"use client";

import { useState } from "react";
import Header from "../components/Header";
import UploadScreen from "../components/UploadScreen";
import SignWorkspace from "../components/SignWorkspace";
import DoneScreen from "../components/DoneScreen";
import { convertDocxArrayBufferToPdfBytes } from "../lib/docxToPdf";

export default function Home() {
  const [step, setStep] = useState("upload"); // upload | sign | done
  const [fileMeta, setFileMeta] = useState(null); // { name, kind }
  const [pdfBytes, setPdfBytes] = useState(null); // Uint8Array used for signing
  const [signedCount, setSignedCount] = useState(0);
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState("");

  async function handleFile(file, kind) {
    const buf = await file.arrayBuffer();
    setFileMeta({ name: file.name, kind });
    setConvertError("");
    if (kind === "pdf") {
      setPdfBytes(new Uint8Array(buf));
      setStep("sign");
      return;
    }
    setConverting(true);
    try {
      const bytes = await convertDocxArrayBufferToPdfBytes(buf);
      setPdfBytes(new Uint8Array(bytes));
      setStep("sign");
    } catch (err) {
      console.error(err);
      setConvertError("Không chuyển được file Word sang PDF. Vui lòng thử lại.");
      setFileMeta(null);
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
    setPdfBytes(null);
    setConvertError("");
  }

  const baseName = fileMeta?.name?.replace(/\.(pdf|docx)$/i, "") || "document";

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header step={step} fileName={fileMeta?.name} signedCount={signedCount} onReset={handleReset} />

      {step === "upload" && (
        <UploadScreen onFile={handleFile} converting={converting} error={convertError} />
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
