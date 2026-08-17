"use client";

const STEPS = [
  { id: "upload", label: "Tải tài liệu" },
  { id: "edit", label: "Chỉnh sửa" },
  { id: "sign", label: "Ký & Đặt chữ ký" },
  { id: "done", label: "Xuất PDF" },
];

export default function Header({ step, fileName, signedCount, onReset }) {
  const activeIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <header
      style={{
        background: "var(--chrome)",
        color: "#fff",
        borderBottom: "1px solid var(--chrome-soft)",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "13px 24px",
          display: "flex",
          alignItems: "center",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logomark />
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Sổ Ký Số
          </div>
        </div>

        <nav
          aria-label="Các bước thực hiện"
          style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, minWidth: 260 }}
        >
          {STEPS.map((s, i) => {
            const state =
              i < activeIndex ? "done" : i === activeIndex ? "active" : "upcoming";
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "5px 10px",
                    borderRadius: 999,
                    background: state === "active" ? "rgba(255,255,255,0.12)" : "transparent",
                  }}
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      fontSize: 10,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        state === "done"
                          ? "var(--success)"
                          : state === "active"
                          ? "var(--accent)"
                          : "rgba(255,255,255,0.14)",
                      color: state === "upcoming" ? "rgba(255,255,255,0.5)" : "#fff",
                    }}
                  >
                    {state === "done" ? "✓" : i + 1}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: state === "active" ? 600 : 400,
                      color: state === "upcoming" ? "rgba(255,255,255,0.45)" : "#fff",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 14, height: 1, background: "rgba(255,255,255,0.14)" }} />
                )}
              </div>
            );
          })}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {fileName && (
            <span
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.55)",
                fontFamily: "var(--font-mono)",
                maxWidth: 220,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={fileName}
            >
              {fileName}
            </span>
          )}
          {fileName && (
            <button
              onClick={onReset}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 12.5,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Tài liệu mới
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function Logomark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="8" fill="var(--accent)" />
      <path
        d="M8 18.5c2-5.4 3.6-8.2 5-8.2 1.1 0 1.4 1.7 2.4 1.7.9 0 1.6-1 2.6-3"
        fill="none"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="19" r="1.4" fill="#fff" />
    </svg>
  );
}
