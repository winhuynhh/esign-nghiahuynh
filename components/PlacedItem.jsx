"use client";

import { Rnd } from "react-rnd";

export default function PlacedItem({ item, pageSize, selected, onSelect, onChange, onEditText }) {
  const px = {
    x: item.xFrac * pageSize.width,
    y: item.yFrac * pageSize.height,
    width: Math.max(item.wFrac * pageSize.width, 24),
    height: Math.max(item.hFrac * pageSize.height, 16),
  };

  return (
    <Rnd
      bounds="parent"
      size={{ width: px.width, height: px.height }}
      position={{ x: px.x, y: px.y }}
      lockAspectRatio={item.kind === "signature"}
      minWidth={item.kind === "signature" ? 60 : 40}
      minHeight={item.kind === "signature" ? 30 : 20}
      onDragStart={() => onSelect(item.id)}
      onDragStop={(e, d) => {
        onChange(item.id, {
          xFrac: clamp01(d.x / pageSize.width),
          yFrac: clamp01(d.y / pageSize.height),
        });
      }}
      onResizeStart={() => onSelect(item.id)}
      onResizeStop={(e, dir, ref, delta, pos) => {
        onChange(item.id, {
          wFrac: ref.offsetWidth / pageSize.width,
          hFrac: ref.offsetHeight / pageSize.height,
          xFrac: clamp01(pos.x / pageSize.width),
          yFrac: clamp01(pos.y / pageSize.height),
        });
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item.id);
      }}
      style={{
        border: selected ? "1.5px solid var(--accent)" : "1.5px dashed rgba(20,22,26,0.16)",
        background: selected ? "rgba(234,239,255,0.45)" : "transparent",
        borderRadius: 4,
        zIndex: selected ? 6 : 3,
        cursor: "grab",
      }}
    >
      {selected && (
        <div
          style={{
            position: "absolute",
            top: -9,
            right: -9,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "var(--accent)",
            color: "#fff",
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          ✓
        </div>
      )}

      {item.kind === "signature" ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.dataUrl}
            alt="Chữ ký"
            draggable={false}
            style={{
              width: "100%",
              flex: item.showTimestamp ? "1 1 auto" : "1 1 100%",
              objectFit: "contain",
              minHeight: 0,
            }}
          />
          {item.showTimestamp && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: Math.max(7, Math.min(10, pageSize.width * 0.011)),
                color: "#3d4352",
                lineHeight: 1.25,
                marginTop: 2,
              }}
            >
              {item.timestampLines.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          onDoubleClick={(e) => {
            e.stopPropagation();
            onEditText(item.id);
          }}
          style={{
            width: "100%",
            height: "100%",
            fontSize: item.fontSize || 13,
            fontWeight: item.bold ? 700 : 400,
            color: "#1a1a1a",
            padding: 2,
            overflow: "hidden",
            whiteSpace: "pre-wrap",
            userSelect: "none",
          }}
        >
          {item.text || "Nhấp đúp để nhập văn bản…"}
        </div>
      )}
    </Rnd>
  );
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}
