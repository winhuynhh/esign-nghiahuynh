"use client";

import { useEffect, useRef, useState } from "react";
import PlacedItem from "./PlacedItem";

export default function PageCanvas({
  pdfDoc,
  pageIndex,
  targetWidth,
  items,
  selectedId,
  onSelect,
  onChange,
  onEditText,
  armed,
  onPlace,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const renderTaskRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      const page = await pdfDoc.getPage(pageIndex + 1);
      const unscaled = page.getViewport({ scale: 1 });
      const scale = targetWidth / unscaled.width;
      const viewport = page.getViewport({ scale });
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;
      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
      const task = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      try {
        await task.promise;
      } catch (err) {
        if (err?.name !== "RenderingCancelledException") throw err;
      }
      if (!cancelled) {
        setPageSize({ width: viewport.width, height: viewport.height });
      }
    }
    render();
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pageIndex, targetWidth]);

  function handleContainerClick(e) {
    if (!armed) {
      onSelect(null);
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const xFrac = (e.clientX - rect.left) / rect.width;
    const yFrac = (e.clientY - rect.top) / rect.height;
    onPlace(pageIndex, clamp01(xFrac), clamp01(yFrac));
  }

  return (
    <div
      style={{
        marginBottom: 28,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        style={{
          position: "relative",
          width: pageSize.width || targetWidth,
          height: pageSize.height || undefined,
          boxShadow: "var(--shadow-page)",
          background: "#fff",
          cursor: armed ? "crosshair" : "default",
        }}
      >
        <canvas ref={canvasRef} style={{ display: "block" }} />
        {pageSize.width > 0 &&
          items.map((item) => (
            <PlacedItem
              key={item.id}
              item={item}
              pageSize={pageSize}
              selected={item.id === selectedId}
              onSelect={onSelect}
              onChange={onChange}
              onEditText={onEditText}
            />
          ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: "var(--ink-soft)", fontFamily: "var(--font-mono)" }}>
        Trang {pageIndex + 1}
      </div>
    </div>
  );
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}
