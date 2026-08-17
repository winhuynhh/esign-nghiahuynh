"use client";

export default function SignSidebar({
  signatures,
  onArmSignature,
  onNewSignature,
  onDeleteSignature,
  armedKind,
  onArmText,
  onDisarm,
  placedCount,
  onExport,
  exporting,
  onCloseMobile,
}) {
  return (
    <aside
      style={{
        width: onCloseMobile ? "100%" : 268,
        flexShrink: 0,
        borderRight: "1px solid var(--line)",
        background: "var(--paper-card)",
        padding: 20,
        height: "100%",
        overflowY: "auto",
      }}
      className="scrollbar-thin"
    >
      {onCloseMobile && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button
            onClick={onCloseMobile}
            aria-label="Đóng bảng công cụ"
            style={{ border: "none", background: "none", fontSize: 18, color: "var(--ink-soft)", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      <Section title="Thư viện chữ ký">
        <p style={{ fontSize: 11.5, color: "var(--ink-soft)", margin: "0 0 10px" }}>
          Chữ ký được lưu tự động trên trình duyệt này (localStorage) — vẫn còn sau khi tải
          lại trang, nhưng không đồng bộ sang máy/trình duyệt khác.
        </p>
        <button
          onClick={onNewSignature}
          style={{
            width: "100%",
            padding: "9px 10px",
            borderRadius: 8,
            border: "1px dashed var(--accent)",
            background: "var(--accent-soft)",
            color: "var(--ink)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 10,
          }}
        >
          + Tạo chữ ký mới
        </button>

        {signatures.length === 0 && (
          <p style={{ fontSize: 12, color: "var(--ink-soft)" }}>
            Chưa có chữ ký nào được lưu.
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {signatures.map((sig) => (
            <div
              key={sig.id}
              style={{
                border: `1.5px solid ${armedKind === sig.id ? "var(--accent)" : "var(--line)"}`,
                borderRadius: 8,
                padding: 8,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: armedKind === sig.id ? "var(--accent-soft)" : "#fff",
              }}
            >
              <button
                onClick={() => onArmSignature(sig)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  background: "#fff",
                  borderRadius: 6,
                  padding: 4,
                  cursor: "pointer",
                  minHeight: 44,
                  gap: 3,
                }}
                title="Chọn để đặt vào tài liệu"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sig.dataUrl} alt={sig.label} style={{ maxHeight: 30, maxWidth: "100%" }} />
                {sig.signerName && (
                  <span
                    style={{
                      fontSize: 10.5,
                      color: "var(--ink-soft)",
                      fontFamily: "var(--font-mono)",
                      lineHeight: 1,
                    }}
                  >
                    {sig.signerName}
                  </span>
                )}
              </button>
              <button
                onClick={() => onDeleteSignature(sig.id)}
                aria-label="Xoá chữ ký"
                style={{
                  border: "none",
                  background: "none",
                  color: "var(--ink-soft)",
                  cursor: "pointer",
                  fontSize: 15,
                  padding: 10,
                  minWidth: 40,
                  minHeight: 40,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {armedKind && (
          <div
            style={{
              marginTop: 10,
              fontSize: 11.5,
              color: "var(--accent)",
              background: "var(--accent-soft)",
              padding: "8px 10px",
              borderRadius: 8,
            }}
          >
            Đang chọn chữ ký — bấm vào vị trí trên tài liệu để đặt.{" "}
            <button
              onClick={onDisarm}
              style={{ border: "none", background: "none", color: "var(--accent)", textDecoration: "underline", cursor: "pointer", padding: 0, fontSize: 11.5 }}
            >
              Huỷ
            </button>
          </div>
        )}
      </Section>

      <Section title="Công cụ khác">
        <button
          onClick={onArmText}
          style={{
            width: "100%",
            padding: "9px 10px",
            borderRadius: 8,
            border: `1px solid ${armedKind === "text" ? "var(--chrome)" : "var(--line)"}`,
            background: armedKind === "text" ? "var(--chrome)" : "#fff",
            color: armedKind === "text" ? "#fff" : "var(--ink)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          + Thêm văn bản
        </button>
      </Section>

      <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 10 }}>
          {placedCount > 0
            ? `${placedCount} mục đã đặt trên tài liệu`
            : "Chưa đặt chữ ký nào"}
        </div>
        <button
          onClick={onExport}
          disabled={exporting}
          style={{
            width: "100%",
            padding: "12px 10px",
            borderRadius: 8,
            border: "none",
            background: "var(--success)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            cursor: exporting ? "default" : "pointer",
            opacity: exporting ? 0.7 : 1,
          }}
        >
          {exporting ? "Đang xuất PDF…" : "Xuất PDF đã ký ↓"}
        </button>
      </div>
    </aside>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "var(--ink-soft)",
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
