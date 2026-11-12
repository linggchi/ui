import { createHash, timingSafeEqual } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const enabled = process.env.BASIC_AUTH_ENABLED ?? "true";

  if (enabled === "false") {
    return NextResponse.next();
  }

  const username = process.env.BASIC_AUTH_USERNAME?.normalize("NFC");
  const password = process.env.BASIC_AUTH_PASSWORD?.normalize("NFC");
  const headers = { "Cache-Control": "private, no-store" };

  // A missing or invalid configuration must never make the prototype public.
  if (
    enabled !== "true" ||
    !username ||
    !password ||
    username.includes(":") ||
    /\p{Cc}/u.test(username + password)
  ) {
    return new NextResponse("Website access is not configured.", {
      status: 503,
      headers,
    });
  }

  const authorization = request.headers.get("authorization") ?? "";
  const providedToken = /^Basic +([A-Za-z0-9+/]+={0,2})$/i.exec(
    authorization,
  )?.[1];
  const expectedToken = Buffer.from(`${username}:${password}`, "utf8").toString(
    "base64",
  );

  // Compare fixed-length digests without decoding untrusted header contents.
  const authenticated =
    providedToken !== undefined &&
    timingSafeEqual(
      createHash("sha256").update(providedToken).digest(),
      createHash("sha256").update(expectedToken).digest(),
    );

  if (!authenticated) {
    return new NextResponse("Authentication required.", {
      status: 401,
      headers: {
        ...headers,
        "WWW-Authenticate": 'Basic realm="Accura", charset="UTF-8"',
      },
    });
  }

  return NextResponse.next({ headers });
}

export const config = {
  // Catalog fixtures can live in JS bundles, so assets are protected too.
  matcher: "/:path*",
};
