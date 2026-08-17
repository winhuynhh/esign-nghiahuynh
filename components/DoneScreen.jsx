"use client";

export default function DoneScreen({ fileName, onBackToSign, onNewDocument }) {
  return (
    <div style={{ maxWidth: 560, margin: "90px auto", padding: "0 24px", textAlign: "center" }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "var(--success)",
          margin: "0 auto 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="30" height="30" viewBox="0 0 30 30">
          <path
            d="M7 15.5l5 5L23 9"
            fill="none"
            stroke="#fff"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: "0 0 8px" }}>
        Đã ký và xuất PDF
      </h2>
      <p style={{ color: "var(--ink-soft)", fontSize: 14, lineHeight: 1.6 }}>
        File <strong>{fileName}</strong> đã được tải xuống thiết bị của bạn kèm chữ ký và
        timestamp đã đặt.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24 }}>
        <button
          onClick={onBackToSign}
          style={{
            padding: "11px 18px",
            borderRadius: 8,
            border: "1px solid var(--line)",
            background: "#fff",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          ← Quay lại chỉnh sửa chữ ký
        </button>
        <button
          onClick={onNewDocument}
          style={{
            padding: "11px 18px",
            borderRadius: 8,
            border: "none",
            background: "var(--chrome)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Ký tài liệu khác
        </button>
      </div>
    </div>
  );
}
