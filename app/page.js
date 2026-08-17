"use client";

import { useState } from "react";
import Header from "../components/Header";
import UploadScreen from "../components/UploadScreen";
import DocxEditor from "../components/DocxEditor";
import SignWorkspace from "../components/SignWorkspace";
import DoneScreen from "../components/DoneScreen";
import { convertDocxToHtml, renderElementToPdfBytes } from "../lib/docxToPdf";

export default function Home() {
  const [step, setStep] = useState("upload"); // upload | edit | sign | done
  const [fileMeta, setFileMeta] = useState(null); // { name, kind }
  const [docxHtml, setDocxHtml] = useState("");
  const [pdfBytes, setPdfBytes] = useState(null); // Uint8Array used for signing
  const [signedCount, setSignedCount] = useState(0);
  const [converting, setConverting] = useState(false);

  async function handleFile(file, kind) {
    const buf = await file.arrayBuffer();
    setFileMeta({ name: file.name, kind });
    if (kind === "pdf") {
      setPdfBytes(new Uint8Array(buf));
      setStep("sign");
    } else {
      const { html } = await convertDocxToHtml(buf);
      setDocxHtml(html || "<p></p>");
      setStep("edit");
    }
  }

  async function handleDocxContinue(editorElement) {
    setConverting(true);
    try {
      const bytes = await renderElementToPdfBytes(editorElement);
      setPdfBytes(new Uint8Array(bytes));
      setStep("sign");
    } finally {
      setConverting(false);
    }
  }

  function handleExported() {
    setSignedCount((c) => c + 1);
    setStep("done");
  }

  function handleReset() {
    setStep("upload");
    setFileMeta(null);
    setDocxHtml("");
    setPdfBytes(null);
  }

  const baseName = fileMeta?.name?.replace(/\.(pdf|docx)$/i, "") || "document";

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header step={step} fileName={fileMeta?.name} signedCount={signedCount} onReset={handleReset} />

      {step === "upload" && <UploadScreen onFile={handleFile} />}

      {step === "edit" && (
        <DocxEditor html={docxHtml} onContinue={handleDocxContinue} busy={converting} />
      )}

      {step === "sign" && pdfBytes && (
        <SignWorkspace pdfBytes={pdfBytes} fileBaseName={baseName} onExported={handleExported} />
      )}

      {step === "done" && (
        <DoneScreen
          fileName={`${baseName}-signed.pdf`}
          onBackToSign={() => setStep("sign")}
          onNewDocument={handleReset}
        />
      )}
    </div>
  );
}
