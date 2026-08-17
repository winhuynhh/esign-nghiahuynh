"use client";

import { useCallback, useRef, useState } from "react";

export default function UploadScreen({ onFile }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = useCallback(
    (fileList) => {
      const file = fileList?.[0];
      if (!file) return;
      const name = file.name.toLowerCase();
      const isPdf = name.endsWith(".pdf");
      const isDocx = name.endsWith(".docx");
      const isDoc = name.endsWith(".doc");
      if (isDoc && !isDocx) {
        setError(
          "Định dạng .doc (Word 97-2003) chưa được hỗ trợ trực tiếp — vui lòng lưu lại dưới dạng .docx rồi tải lên."
        );
        return;
      }
      if (!isPdf && !isDocx) {
        setError("Chỉ hỗ trợ file .pdf hoặc .docx.");
        return;
      }
      setError("");
      onFile(file, isPdf ? "pdf" : "docx");
    },
    [onFile]
  );

  return (
    <div
      style={{
        maxWidth: 760,
        margin: "clamp(24px, 8vw, 64px) auto",
        padding: "0 16px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: 2,
            color: "var(--accent)",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Bước 1 / 4
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 34,
            margin: "0 0 10px",
            color: "var(--ink)",
          }}
        >
          Tải tài liệu cần ký
        </h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
          Hỗ trợ PDF và Word (.docx). Toàn bộ xử lý diễn ra ngay trên trình duyệt của bạn —
          tài liệu không được tải lên máy chủ nào.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        style={{
          border: `2px dashed ${dragOver ? "var(--accent)" : "var(--line)"}`,
          borderRadius: "var(--radius-lg)",
          background: dragOver ? "var(--accent-soft)" : "var(--paper-card)",
          padding: "56px 24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 120ms ease, background 120ms ease",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <DocIcon />
        <div style={{ marginTop: 14, fontSize: 15, color: "var(--ink)", fontWeight: 500 }}>
          Kéo thả file vào đây, hoặc bấm để chọn
        </div>
        <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-soft)" }}>
          .pdf · .docx — tối đa ~30MB
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: "#fbeceb",
            color: "var(--danger)",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

function DocIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
      <rect x="9" y="4" width="28" height="38" rx="3" stroke="var(--chrome)" strokeWidth="1.8" />
      <path d="M14 15h18M14 22h18M14 29h12" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
