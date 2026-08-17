"use client";

import * as pdfjsLib from "pdfjs-dist";

if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.js",
    import.meta.url
  ).toString();
}

export default pdfjsLib;
