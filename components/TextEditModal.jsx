"use client";

import { useState } from "react";

export default function TextEditModal({ initial, onClose, onSave }) {
  const [text, setText] = useState(initial.text || "");
  const [fontSize, setFontSize] = useState(initial.fontSize || 13);
  const [bold, setBold] = useState(!!initial.bold);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,33,61,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "var(--radius-lg)",
          width: "min(420px, 92vw)",
          maxHeight: "88vh",
          overflowY: "auto",
          padding: 22,
          boxShadow: "0 24px 60px rgba(20,33,61,0.35)",
        }}
      >
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, margin: "0 0 12px" }}>
          Nội dung văn bản
        </h3>
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            padding: 10,
            fontSize: 14,
            borderRadius: 8,
            border: "1px solid var(--line)",
            fontFamily: "inherit",
            resize: "vertical",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
          <label style={{ fontSize: 12, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 6 }}>
            Cỡ chữ
            <input
              type="number"
              min={8}
              max={40}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              style={{ width: 56, padding: 4, borderRadius: 6, border: "1px solid var(--line)" }}
            />
          </label>
          <label style={{ fontSize: 12, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={bold} onChange={(e) => setBold(e.target.checked)} />
            In đậm
          </label>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
          <button
            onClick={onClose}
            style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid var(--line)", background: "#fff", cursor: "pointer", fontSize: 13 }}
          >
            Huỷ
          </button>
          <button
            onClick={() => onSave({ text, fontSize, bold })}
            style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "var(--chrome)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
