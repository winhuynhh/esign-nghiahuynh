"use client";

import { useEffect, useRef, useState } from "react";

const FORMAT_BUTTONS = [
  { cmd: "bold", label: "B", style: { fontWeight: 700 } },
  { cmd: "italic", label: "I", style: { fontStyle: "italic" } },
  { cmd: "underline", label: "U", style: { textDecoration: "underline" } },
  { cmd: "insertUnorderedList", label: "• List" },
  { cmd: "insertOrderedList", label: "1. List" },
  { cmd: "justifyLeft", label: "⇤" },
  { cmd: "justifyCenter", label: "≡" },
  { cmd: "justifyRight", label: "⇥" },
];

export default function DocxEditor({ html, onContinue, busy }) {
  const editorRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (editorRef.current && !ready) {
      editorRef.current.innerHTML = html;
      setReady(true);
    }
  }, [html, ready]);

  const exec = (cmd) => {
    document.execCommand(cmd, false, null);
    editorRef.current?.focus();
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "16px" }}>
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: 2,
            color: "var(--accent)",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Bước 2 / 4
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: 0 }}>
          Chỉnh sửa nội dung
        </h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "6px 0 0" }}>
          Sửa văn bản trực tiếp như trong Word. Khi xong, bấm "Tiếp tục để ký" để chuyển sang
          bước đặt chữ ký — tài liệu sẽ được chuyển thành PDF ở bước này.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          background: "var(--paper-card)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-md) var(--radius-md) 0 0",
          padding: 8,
          position: "sticky",
          top: 0,
          zIndex: 5,
        }}
      >
        {FORMAT_BUTTONS.map((b) => (
          <button
            key={b.cmd}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(b.cmd)}
            style={{
              ...b.style,
              border: "1px solid var(--line)",
              background: "#fff",
              borderRadius: 6,
              padding: "6px 10px",
              fontSize: 13,
              cursor: "pointer",
              color: "var(--ink)",
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="docx-surface"
        style={{
          background: "#fff",
          border: "1px solid var(--line)",
          borderTop: "none",
          borderRadius: "0 0 var(--radius-md) var(--radius-md)",
          minHeight: 500,
          padding: "clamp(20px, 6vw, 48px) clamp(16px, 6vw, 56px)",
          boxShadow: "var(--shadow-page)",
          fontFamily: "'Times New Roman', Georgia, serif",
          fontSize: 15,
          lineHeight: 1.7,
          color: "#1a1a1a",
        }}
      />

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
        <button
          disabled={busy}
          onClick={() => onContinue(editorRef.current)}
          style={{
            background: "var(--chrome)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 22px",
            fontSize: 14,
            fontWeight: 600,
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? "Đang chuyển sang PDF…" : "Tiếp tục để ký →"}
        </button>
      </div>
    </div>
  );
}
