import "./globals.css";

export const metadata = {
  title: "Ký Số Tài Liệu — Ledger",
  description: "Mở PDF/DOCX, chỉnh sửa, ký chữ ký điện tử và xuất PDF ngay trên trình duyệt.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Caveat:wght@500;600&family=Dancing+Script:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
