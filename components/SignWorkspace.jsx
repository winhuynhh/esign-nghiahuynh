"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import pdfjsLib from "../lib/pdfjs";
import PageCanvas from "./PageCanvas";
import SignSidebar from "./SignSidebar";
import SignatureModal from "./SignatureModal";
import TextEditModal from "./TextEditModal";
import { exportSignedPdf, downloadBytes, ExportError } from "../lib/pdfExport";
import { formatSignTimestamp } from "../lib/timestamp";
import { loadSignatures, saveSignature, deleteSignature, loadProfile, saveProfile } from "../lib/storage";

export default function SignWorkspace({ pdfBytes, fileBaseName, onExported }) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [items, setItems] = useState([]); // {id, kind, page, xFrac,yFrac,wFrac,hFrac, ...}
  const [selectedId, setSelectedId] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [profile, setProfile] = useState({ name: "" });
  const [armed, setArmed] = useState(null); // { kind: 'signature'|'text', dataUrl? }
  const [showNewSigModal, setShowNewSigModal] = useState(false);
  const [editingTextId, setEditingTextId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [containerWidth, setContainerWidth] = useState(760);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    setSignatures(loadSignatures());
    setProfile(loadProfile());
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const bytesCopy = pdfBytes.slice(0);
      const doc = await pdfjsLib.getDocument({ data: bytesCopy }).promise;
      if (cancelled) return;
      setPdfDoc(doc);
      setNumPages(doc.numPages);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [pdfBytes]);

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth - 32;
        setContainerWidth(Math.max(280, Math.min(820, w)));
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [sidebarOpen]);

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth <= 760);
    }
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const itemsByPage = useMemo(() => {
    const map = {};
    for (const it of items) {
      map[it.page] = map[it.page] || [];
      map[it.page].push(it);
    }
    return map;
  }, [items]);

  function updateItem(id, patch) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function deleteItem(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function toggleTimestamp(id) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, showTimestamp: !it.showTimestamp } : it))
    );
  }

  function handlePlace(pageIndex, xFrac, yFrac) {
    if (!armed) return;
    if (armed.kind === "signature") {
      const now = new Date();
      const signerName = profile.name?.trim() || "Người ký";
      const newItem = {
        id: uuidv4(),
        kind: "signature",
        page: pageIndex,
        xFrac: clamp(xFrac - 0.09, 0, 0.8),
        yFrac: clamp(yFrac - 0.035, 0, 0.9),
        wFrac: 0.2,
        hFrac: 0.075,
        dataUrl: armed.dataUrl,
        showTimestamp: true,
        timestampLines: [
          `Digitally signed by: ${signerName}`,
          `Signing Date: ${formatSignTimestamp(now)}`,
        ],
      };
      setItems((prev) => [...prev, newItem]);
      setSelectedId(newItem.id);
    } else if (armed.kind === "text") {
      const newItem = {
        id: uuidv4(),
        kind: "text",
        page: pageIndex,
        xFrac: clamp(xFrac - 0.1, 0, 0.85),
        yFrac: clamp(yFrac - 0.02, 0, 0.92),
        wFrac: 0.24,
        hFrac: 0.045,
        text: "",
        fontSize: 13,
        bold: false,
      };
      setItems((prev) => [...prev, newItem]);
      setSelectedId(newItem.id);
      setEditingTextId(newItem.id);
    }
    setArmed(null);
  }

  function handleUseSignature(sig, saveToLib) {
    if (saveToLib) {
      const next = saveSignature(sig);
      setSignatures(next);
    }
    if (sig.signerName) {
      handleProfileNameChange(sig.signerName);
    }
    setArmed({ kind: "signature", dataUrl: sig.dataUrl });
    setShowNewSigModal(false);
  }

  function handleArmExistingSignature(sig) {
    if (sig.signerName) {
      handleProfileNameChange(sig.signerName);
    }
    setArmed({ kind: "signature", dataUrl: sig.dataUrl });
  }

  function handleDeleteSignature(id) {
    const next = deleteSignature(id);
    setSignatures(next);
  }

  function handleProfileNameChange(name) {
    const next = { ...profile, name };
    setProfile(next);
    saveProfile(next);
  }

  async function handleExport() {
    setExporting(true);
    setExportError("");
    try {
      const placedSignatures = items
        .filter((it) => it.kind === "signature")
        .map((it) => ({
          page: it.page,
          xFrac: it.xFrac,
          yFrac: it.yFrac,
          wFrac: it.wFrac,
          hFrac: it.hFrac,
          dataUrl: it.dataUrl,
          showTimestamp: it.showTimestamp,
          timestampLines: it.timestampLines,
        }));
      const textAnnotations = items
        .filter((it) => it.kind === "text" && it.text?.trim())
        .map((it) => ({
          page: it.page,
          xFrac: it.xFrac,
          yFrac: it.yFrac,
          wFrac: it.wFrac,
          fontSize: it.fontSize,
          bold: it.bold,
          text: it.text,
        }));

      const bytes = await exportSignedPdf({
        pdfBytes: pdfBytes.slice(0),
        placedSignatures,
        textAnnotations,
      });
      const filename = `${fileBaseName || "document"}-signed.pdf`;
      downloadBytes(bytes, filename);
      onExported?.();
    } catch (err) {
      console.error("Export failed:", err);
      if (err instanceof ExportError) {
        setExportError(err.message);
      } else {
        setExportError("Xuất PDF thất bại. Vui lòng thử lại hoặc tải lại trang.");
      }
    } finally {
      setExporting(false);
    }
  }

  const editingItem = items.find((it) => it.id === editingTextId);
  const selectedItem = items.find((it) => it.id === selectedId);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 63px)", position: "relative" }}>
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(20,33,61,0.4)", zIndex: 55 }}
        />
      )}

      <div
        style={
          isMobile
            ? {
                position: "fixed",
                top: 0,
                bottom: 0,
                left: 0,
                width: "min(84vw, 300px)",
                zIndex: 60,
                transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 220ms ease",
                boxShadow: sidebarOpen ? "8px 0 24px rgba(20,33,61,0.25)" : "none",
              }
            : {
                display: sidebarOpen ? "block" : "none",
                height: "100%",
              }
        }
      >
        <SignSidebar
          profileName={profile.name}
          onProfileNameChange={handleProfileNameChange}
          signatures={signatures}
          onArmSignature={(sig) => {
            handleArmExistingSignature(sig);
            if (isMobile) setSidebarOpen(false);
          }}
          onNewSignature={() => setShowNewSigModal(true)}
          onDeleteSignature={handleDeleteSignature}
          armedKind={armed?.kind === "signature" ? armed.dataUrl : armed?.kind === "text" ? "text" : null}
          onArmText={() => {
            setArmed({ kind: "text" });
            if (isMobile) setSidebarOpen(false);
          }}
          onDisarm={() => setArmed(null)}
          placedCount={items.length}
          onExport={handleExport}
          exporting={exporting}
          onCloseMobile={isMobile ? () => setSidebarOpen(false) : null}
        />
      </div>

      <div
        ref={containerRef}
        className="scrollbar-thin"
        style={{
          flex: 1,
          position: "relative",
          overflowY: "auto",
          padding: isMobile ? "16px 12px 90px" : "24px",
          background: "var(--paper)",
        }}
        onClick={() => {
          if (!armed) setSelectedId(null);
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSidebarOpen((o) => !o);
          }}
          style={{
            position: "sticky",
            top: 0,
            left: 0,
            zIndex: 20,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--chrome)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12.5,
            cursor: "pointer",
            marginBottom: 14,
          }}
        >
          <span aria-hidden="true">{sidebarOpen ? "⟨" : "☰"}</span>
          {sidebarOpen ? "Ẩn công cụ" : "Công cụ & chữ ký"}
        </button>

        {exportError && (
          <div
            role="alert"
            style={{
              marginBottom: 14,
              padding: "12px 14px",
              borderRadius: 8,
              background: "#fbeceb",
              color: "var(--danger)",
              fontSize: 13,
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <span>{exportError}</span>
            <button
              onClick={() => setExportError("")}
              style={{ border: "none", background: "none", color: "var(--danger)", cursor: "pointer", fontSize: 13 }}
            >
              ✕
            </button>
          </div>
        )}

        {!pdfDoc && (
          <div style={{ textAlign: "center", color: "var(--ink-soft)", marginTop: 80, fontSize: 14 }}>
            Đang tải tài liệu…
          </div>
        )}
        {pdfDoc &&
          Array.from({ length: numPages }).map((_, i) => (
            <PageCanvas
              key={i}
              pdfDoc={pdfDoc}
              pageIndex={i}
              targetWidth={containerWidth}
              items={itemsByPage[i] || []}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onChange={updateItem}
              onDelete={deleteItem}
              onToggleTimestamp={toggleTimestamp}
              onEditText={(id) => setEditingTextId(id)}
              armed={!!armed}
              onPlace={handlePlace}
            />
          ))}

        {isMobile && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleExport();
            }}
            disabled={exporting}
            style={{
              position: "fixed",
              bottom: 18,
              right: 18,
              left: 18,
              zIndex: 30,
              padding: "14px 10px",
              borderRadius: 10,
              border: "none",
              background: "var(--success)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: exporting ? "default" : "pointer",
              opacity: exporting ? 0.7 : 1,
              boxShadow: "0 8px 24px rgba(20,33,61,0.25)",
            }}
          >
            {exporting ? "Đang xuất PDF…" : "Xuất PDF đã ký ↓"}
          </button>
        )}
      </div>

      {selectedItem && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: isMobile ? 84 : 24,
            zIndex: 80,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "var(--chrome)",
            padding: 8,
            borderRadius: 12,
            boxShadow: "0 12px 32px rgba(20,22,26,0.35)",
          }}
        >
          {selectedItem.kind === "signature" && (
            <ActionBarButton onClick={() => toggleTimestamp(selectedItem.id)}>
              {selectedItem.showTimestamp ? "Ẩn timestamp" : "Hiện timestamp"}
            </ActionBarButton>
          )}
          {selectedItem.kind === "text" && (
            <ActionBarButton onClick={() => setEditingTextId(selectedItem.id)}>
              Sửa văn bản
            </ActionBarButton>
          )}
          <ActionBarButton danger onClick={() => deleteItem(selectedItem.id)}>
            Xoá
          </ActionBarButton>
          <ActionBarButton onClick={() => setSelectedId(null)}>Xong</ActionBarButton>
        </div>
      )}

      {showNewSigModal && (
        <SignatureModal
          onClose={() => setShowNewSigModal(false)}
          onUse={handleUseSignature}
          defaultSignerName={profile.name}
        />
      )}

      {editingItem && (
        <TextEditModal
          initial={editingItem}
          onClose={() => setEditingTextId(null)}
          onSave={(patch) => {
            updateItem(editingItem.id, patch);
            setEditingTextId(null);
          }}
        />
      )}
    </div>
  );
}

function ActionBarButton({ children, onClick, danger }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        border: "none",
        background: danger ? "var(--danger)" : "rgba(255,255,255,0.14)",
        color: "#fff",
        fontSize: 13,
        fontWeight: 500,
        borderRadius: 8,
        padding: "10px 14px",
        minHeight: 40,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}
