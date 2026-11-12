# Bảo vệ prototype bằng mật khẩu với StaticCrypt

Tài liệu này giải thích cách StaticCrypt hoạt động và các bước áp dụng cho
`apps/accura-prototype` (app đang deploy lên Vercel, project `accura-prototype`).

---

## 1. Vấn đề

Vercel chỉ cho bật Password Protection ở gói Pro ($20/project/tháng). Prototype
này chỉ cần che mắt người ngoài, không cần bảo mật cấp doanh nghiệp.

## 2. StaticCrypt là gì (giải thích dễ hiểu)

Hình dung trang web của bạn là một lá thư. Bình thường ai mở link cũng đọc được.

StaticCrypt bỏ lá thư vào một **két sắt** ngay lúc build:

1. Sau khi Next.js xuất ra HTML tĩnh, StaticCrypt **mã hoá** nội dung file HTML
   (AES-256-CBC, khoá sinh từ mật khẩu qua PBKDF2).
2. Nó **thay** file HTML gốc bằng một trang mới: một ô nhập mật khẩu + cục dữ
   liệu đã mã hoá nhúng kèm.
3. Khách truy cập nhập đúng mật khẩu → **trình duyệt** tự giải mã bằng Web Crypto
   API rồi render trang thật. Không có server nào tham gia.
4. `--remember 30` lưu trạng thái đã mở khoá 30 ngày trong trình duyệt.

Hệ quả quan trọng:

- **Không cần gói Pro, không cần server.** Chạy được trên Vercel free, Netlify,
  GitHub Pages, S3…
- **Mật khẩu không nằm trong file deploy** — chỉ có bản mã. Không brute-force
  được dễ, nhưng ai có file + thời gian thì vẫn thử được, nên **đừng dùng cho dữ
  liệu thật/nhạy cảm**. Prototype thì vừa đủ.
- `.staticrypt.json` giữ **salt** — không phải bí mật, nên commit để bản mã ổn
  định giữa các lần build (nếu salt đổi, phiên "remember" của mọi người bị mất).

## 3. Điều kiện: app phải xuất tĩnh được

Đã kiểm tra `apps/accura-prototype`:

- Chỉ có `app/layout.tsx` + `app/page.tsx` render `<DocumentsPrototype />`,
  toàn bộ là client UI.
- Không có API route, không có `"use server"`, không có dynamic segment,
  không có middleware.

→ **Xuất tĩnh được.** Hai điều cần sửa: bật `output: "export"` và tắt tối ưu ảnh
(`next/image` đang được dùng ở `dashboard-screen.tsx` và `documents-prototype.tsx`).

> Lưu ý khác với đoạn AI trong chat: app này sau export chỉ có **một** trang
> `out/index.html`, nhưng Next vẫn sinh `out/404.html`. Nên mã hoá cả hai (xem
> bước 4) thay vì chỉ `index.html`.

---

## 4. Các bước áp dụng

### Bước 1 — Cài StaticCrypt

```bash
cd /Users/mac/Documents/GitHub/Accura-One/Coss && bun add -D -F @accura/prototype staticrypt@^3.5.4
```

### Bước 2 — Bật static export trong `apps/accura-prototype/next.config.ts`

Thêm vào `nextConfig`:

```ts
output: "export",
images: { unoptimized: true },
```

(giữ nguyên `transpilePackages`, `allowedDevOrigins`, `webpack`)

### Bước 3 — Thêm script build trong `apps/accura-prototype/package.json`

```json
"build": "next build --webpack && staticrypt out/index.html out/404.html -d out --remember 30 --short --template-title \"Accura Prototype\" --template-instructions \"Nhập mật khẩu để xem bản prototype.\""
```

- `-d out` ghi đè file đã mã hoá trở lại thư mục `out/`.
- `--short` bỏ phần giải thích dài mặc định trên trang khoá.
- Thêm file khác vào danh sách nếu sau này app có nhiều route.

### Bước 4 — Đặt mật khẩu local

Tạo/`sửa` `apps/accura-prototype/.env.local` (đã được `.gitignore` bỏ qua):

```
STATICRYPT_PASSWORD=<mật-khẩu-bạn-chọn>
```

StaticCrypt tự đọc biến này, không cần truyền `-p` trên dòng lệnh (tránh lộ
mật khẩu trong shell history).

### Bước 5 — Commit `.staticrypt.json`

Lần build đầu sinh `apps/accura-prototype/.staticrypt.json` chứa salt. Commit
file này. Nếu `.gitignore` chặn, thêm ngoại lệ.

### Bước 6 — Test local

```bash
cd /Users/mac/Documents/GitHub/Accura-One/Coss/apps/accura-prototype && npm run build && npx serve out
```

Mở trang → phải thấy ô nhập mật khẩu; nhập đúng → prototype hiện ra.

### Bước 7 — Cấu hình Vercel

1. Vercel → project `accura-prototype` → Settings → Environment Variables →
   thêm `STATICRYPT_PASSWORD` cho cả Production và Preview.
2. Settings → Build & Output → Output Directory: `out`
   (hoặc thêm `"outputDirectory": "out"` vào `vercel.json`).
3. Framework Preset: để nguyên `nextjs`; build command vẫn là `npm run build`.
4. Redeploy và kiểm tra trên URL thật.

### Bước 8 — Chia sẻ mật khẩu

Gửi mật khẩu cho team qua kênh riêng (không ghi trong repo, không ghi trong
Jira/PR). Đổi mật khẩu = đổi env var trên Vercel + redeploy.

---

## 5. Nếu muốn dùng Netlify thay vì Vercel

Cách làm giống hệt: Netlify build command `npm run build`, publish directory
`out`, và đặt `STATICRYPT_PASSWORD` trong Site settings → Environment variables.
Không có lý do kỹ thuật nào buộc phải rời Vercel.

## 6. Giới hạn cần biết

- Bảo vệ ở phía client → chống người lạ xem, **không** chống người quyết tâm.
- Mọi người dùng chung một mật khẩu, không phân quyền, không log ai đã xem.
- Khi app cần API route hoặc server action thật, `output: "export"` sẽ không còn
  dùng được — lúc đó phải chuyển sang auth thật (middleware + Basic Auth, hoặc
  Vercel Pro).
