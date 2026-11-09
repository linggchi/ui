import "./globals.css";

import { fontMono, fontSans } from "@coss/ui/fonts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Accura Patterns & Behavior Catalogue — reusable elements, their rules, and where they are applied.",
  title: "Patterns & Behavior · Accura",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>
          {":where(svg[stroke-width]) { stroke-width: 2 !important; }"}
        </style>
      </head>
      <body
        className={`${fontSans.variable} ${fontMono.variable} bg-background font-sans text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
