# Sổ Ký Số — e-signature web app

Ứng dụng mở file **PDF / DOCX**, chỉnh sửa nội dung, đặt **chữ ký điện tử** (vẽ tay / nhập
text / tải ảnh / chọn mẫu đã lưu), tự động điền **"Digitally signed by" + "Signing Date"**,
và xuất ra file **PDF đã ký**. Toàn bộ xử lý chạy ngay trên trình duyệt (client-side) —
không có server lưu trữ tài liệu của bạn.

## Tính năng

- **Import PDF hoặc DOCX**, xem trực tiếp trên trình duyệt.
- **Chỉnh sửa nội dung** kiểu Word (bold/italic/underline, danh sách, căn lề) trước khi ký
  đối với file DOCX; với PDF có thể thêm/sửa các khối văn bản chèn thêm.
- **Thư viện chữ ký**: lưu nhiều mẫu chữ ký (vẽ tay bằng chuột/cảm ứng, nhập tên với font
  chữ thảo, hoặc tải ảnh chữ ký PNG nền trong suốt) — lưu trong `localStorage` của trình
  duyệt, dùng lại cho lần sau.
- **Đặt chữ ký bằng cách click** vào vị trí mong muốn trên tài liệu, sau đó **kéo để di
  chuyển, kéo góc để scale**.
- **Tự động điền timestamp** ("Digitally signed by: <tên>" và "Signing Date: <thời điểm>")
  ngay tại thời điểm đặt chữ ký; có thể ẩn/hiện theo từng chữ ký.
- **Xuất PDF** đã nhúng chữ ký + timestamp bằng `pdf-lib`, tải trực tiếp về máy.

## Công nghệ

Next.js 14 (App Router) · `pdfjs-dist` (hiển thị PDF) · `pdf-lib` (nhúng chữ ký & xuất PDF)
· `mammoth` (DOCX → HTML) · `jsPDF` (HTML → PDF cho luồng DOCX) · `react-signature-canvas`
· `react-rnd` (kéo/scale)

## Chạy thử ở máy local

```bash
npm install
npm run dev
```

Mở http://localhost:3000

## Build production

```bash
npm run build
npm run start
```

## Đưa code lên GitHub

```bash
git init
git add .
git commit -m "Initial commit: e-signature app"
git branch -M main
git remote add origin https://github.com/<username>/<repo-name>.git
git push -u origin main
```

(Thay `<username>/<repo-name>` bằng repo bạn đã tạo trên GitHub — vào github.com → **New
repository**, để trống "Initialize with README" vì repo đã có sẵn code.)

## Deploy lên Vercel

1. Vào https://vercel.com → **Add New… → Project**.
2. Chọn **Import Git Repository**, chọn repo vừa push lên GitHub (cần cấp quyền GitHub cho
   Vercel nếu là lần đầu).
3. Vercel tự nhận diện đây là dự án **Next.js** — giữ nguyên cấu hình mặc định
   (Build Command: `next build`, Output: mặc định).
4. Bấm **Deploy**. Sau ~1-2 phút bạn sẽ có URL dạng `https://<project>.vercel.app`.
5. Mỗi lần `git push` lên nhánh `main`, Vercel sẽ tự động build & deploy lại (CI/CD có sẵn).

Không cần biến môi trường (`.env`) — ứng dụng không gọi API bên ngoài nào, mọi xử lý ký số
diễn ra hoàn toàn trong trình duyệt của người dùng.

## Giới hạn hiện tại

- File `.doc` (Word 97-2003 cũ) chưa được hỗ trợ — cần lưu lại thành `.docx` trước khi tải
  lên (Word: File → Save As → Word Document (.docx)).
- Với PDF, ứng dụng cho phép **chèn thêm/sửa các khối văn bản** chồng lên tài liệu (giống
  ghi chú/điền form) chứ chưa chỉnh sửa trực tiếp văn bản gốc đã có trong PDF — việc này là
  giới hạn kỹ thuật chung của định dạng PDF (không lưu lại văn bản dạng có thể chỉnh sửa
  như DOCX).
- Với DOCX, nội dung được chuyển thành PDF (mất một số định dạng phức tạp như bảng lồng
  nhau, cột nhiều) khi bước sang giai đoạn ký — phù hợp với hầu hết văn bản, hợp đồng, đơn
  từ thông thường.
