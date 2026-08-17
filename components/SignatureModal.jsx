"use client";

import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { v4 as uuidv4 } from "uuid";

const TYPE_FONTS = [
  { id: "dancing", label: "Chữ thảo", css: "'Dancing Script', cursive" },
  { id: "caveat", label: "Chữ tay", css: "'Caveat', cursive" },
  { id: "serif", label: "Trang trọng", css: "'Plus Jakarta Sans', sans-serif" },
];

export default function SignatureModal({ onClose, onUse, defaultSignerName }) {
  const [tab, setTab] = useState("draw");
  const [typedText, setTypedText] = useState("");
  const [fontId, setFontId] = useState("dancing");
  const [saveToLibrary, setSaveToLibrary] = useState(true);
  const [uploadedDataUrl, setUploadedDataUrl] = useState(null);
  const [signerName, setSignerName] = useState(defaultSignerName || "");
  const sigRef = useRef(null);
  const typeCanvasRef = useRef(null);

  const activeFont = TYPE_FONTS.find((f) => f.id === fontId);

  useEffect(() => {
    if (tab !== "type") return;
    drawTypedPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, typedText, fontId]);

  async function drawTypedPreview() {
    const canvas = typeCanvasRef.current;
    if (!canvas) return;
    try {
      await document.fonts.load(`48px ${activeFont.css}`);
    } catch {}
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#14213d";
    ctx.font = `48px ${activeFont.css}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(typedText || "Chữ ký của bạn", canvas.width / 2, canvas.height / 2);
  }

  function handleUploadFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadedDataUrl(reader.result);
    reader.readAsDataURL(file);
  }

  function getResultDataUrl() {
    if (tab === "draw") {
      if (!sigRef.current || sigRef.current.isEmpty()) return null;
      return sigRef.current.getTrimmedCanvas().toDataURL("image/png");
    }
    if (tab === "type") {
      if (!typedText.trim()) return null;
      return typeCanvasRef.current.toDataURL("image/png");
    }
    if (tab === "upload") {
      return uploadedDataUrl;
    }
    return null;
  }

  function handleUse() {
    const dataUrl = getResultDataUrl();
    if (!dataUrl) return;
    const sig = {
      id: uuidv4(),
      dataUrl,
      type: tab,
      label: tab === "type" ? typedText : tab === "draw" ? "Chữ ký vẽ tay" : "Chữ ký tải lên",
      signerName: signerName.trim(),
      createdAt: new Date().toISOString(),
    };
    onUse(sig, saveToLibrary);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20, 33, 61, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "var(--radius-lg)",
          width: "min(480px, 92vw)",
          maxHeight: "88vh",
          overflowY: "auto",
          padding: 24,
          boxShadow: "0 24px 60px rgba(20,33,61,0.35)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, margin: 0 }}>
            Tạo chữ ký mới
          </h3>
          <button
            onClick={onClose}
            aria-label="Đóng"
            style={{ border: "none", background: "none", fontSize: 18, cursor: "pointer", color: "var(--ink-soft)" }}
          >
            ✕
          </button>
        </div>

        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: "var(--ink-soft)", display: "block", marginBottom: 5 }}>
            Tên người ký (dùng cho timestamp khi đặt chữ ký này)
          </span>
          <input
            type="text"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder="Nhập tên người ký"
            style={{
              width: "100%",
              padding: "9px 10px",
              borderRadius: 8,
              border: "1px solid var(--line)",
              fontSize: 13,
            }}
          />
        </label>

        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[
            { id: "draw", label: "Vẽ" },
            { id: "type", label: "Nhập text" },
            { id: "upload", label: "Tải ảnh lên" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: 8,
                border: `1px solid ${tab === t.id ? "var(--chrome)" : "var(--line)"}`,
                background: tab === t.id ? "var(--chrome)" : "#fff",
                color: tab === t.id ? "#fff" : "var(--ink)",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "draw" && (
          <div>
            <div
              style={{
                border: "1px dashed var(--line)",
                borderRadius: "var(--radius-md)",
                background: "var(--paper)",
              }}
            >
              <SignatureCanvas
                ref={sigRef}
                penColor="#14213d"
                canvasProps={{
                  width: 432,
                  height: 180,
                  style: { width: "100%", height: 180, borderRadius: 10, touchAction: "none" },
                }}
              />
            </div>
            <button
              onClick={() => sigRef.current?.clear()}
              style={{ marginTop: 8, fontSize: 12, background: "none", border: "none", color: "var(--ink-soft)", cursor: "pointer" }}
            >
              Xoá và vẽ lại
            </button>
          </div>
        )}

        {tab === "type" && (
          <div>
            <input
              type="text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder="Nhập tên của bạn"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                fontSize: 14,
                marginBottom: 10,
              }}
            />
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {TYPE_FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFontId(f.id)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: `1px solid ${fontId === f.id ? "var(--accent)" : "var(--line)"}`,
                    background: fontId === f.id ? "var(--accent-soft)" : "#fff",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <canvas
              ref={typeCanvasRef}
              width={432}
              height={140}
              style={{
                width: "100%",
                height: 140,
                border: "1px dashed var(--line)",
                borderRadius: "var(--radius-md)",
                background: "var(--paper)",
              }}
            />
          </div>
        )}

        {tab === "upload" && (
          <div>
            <input type="file" accept="image/*" onChange={handleUploadFile} style={{ fontSize: 13 }} />
            {uploadedDataUrl && (
              <div
                style={{
                  marginTop: 10,
                  border: "1px dashed var(--line)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--paper)",
                  padding: 10,
                  textAlign: "center",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={uploadedDataUrl} alt="Xem trước chữ ký" style={{ maxHeight: 140, maxWidth: "100%" }} />
              </div>
            )}
            <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 8 }}>
              Nên dùng ảnh nền trong suốt (PNG) để chữ ký hoà hợp với tài liệu.
            </p>
          </div>
        )}

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, fontSize: 13, color: "var(--ink-soft)" }}>
          <input type="checkbox" checked={saveToLibrary} onChange={(e) => setSaveToLibrary(e.target.checked)} />
          Lưu vào thư viện chữ ký để dùng lại
        </label>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "#fff", cursor: "pointer", fontSize: 13 }}
          >
            Huỷ
          </button>
          <button
            onClick={handleUse}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: "var(--accent)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Dùng chữ ký này
          </button>
        </div>
      </div>
    </div>
  );
}
