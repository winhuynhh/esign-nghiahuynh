import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

/**
 * Bake placed signatures + text annotations into a PDF and return the final bytes.
 *
 * Coordinates are stored as fractions (0..1) of the page's on-screen box so the
 * same placement works regardless of zoom level. PDF space is bottom-left
 * origin, screen space is top-left origin, so we flip Y on the way in.
 *
 * IMPORTANT: we embed NotoSans (bundled in /public/fonts) instead of using
 * StandardFonts.Helvetica, because pdf-lib's standard fonts only support the
 * WinAnsi charset and cannot encode Vietnamese diacritics (ĩ, ạ, ệ, ...).
 * Drawing Vietnamese text with a standard font throws and used to silently
 * abort the export whenever the signer name or any added text had Vietnamese
 * characters — which is virtually always for this app.
 *
 * @param {Object} args
 * @param {ArrayBuffer|Uint8Array} args.pdfBytes
 * @param {Array} args.placedSignatures - [{page, xFrac, yFrac, wFrac, hFrac, dataUrl, timestampLines, showTimestamp}]
 * @param {Array} args.textAnnotations - [{page, xFrac, yFrac, wFrac, fontSize, text, color}]
 */
export async function exportSignedPdf({ pdfBytes, placedSignatures = [], textAnnotations = [] }) {
  let pdfDoc;
  try {
    pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  } catch (err) {
    throw new ExportError(
      "Không đọc được file PDF gốc (có thể file bị hỏng hoặc được mã hoá mật khẩu).",
      err
    );
  }

  pdfDoc.registerFontkit(fontkit);

  let font;
  let fontBold;
  try {
    const [regularBytes, boldBytes] = await Promise.all([
      fetch("/fonts/NotoSans-Regular.ttf").then((r) => r.arrayBuffer()),
      fetch("/fonts/NotoSans-Bold.ttf").then((r) => r.arrayBuffer()),
    ]);
    font = await pdfDoc.embedFont(regularBytes, { subset: true });
    fontBold = await pdfDoc.embedFont(boldBytes, { subset: true });
  } catch (err) {
    throw new ExportError(
      "Không tải được font hỗ trợ tiếng Việt để nhúng vào PDF. Kiểm tra kết nối mạng rồi thử lại.",
      err
    );
  }

  const pages = pdfDoc.getPages();

  const imageCache = new Map();
  async function embedImage(dataUrl) {
    if (imageCache.has(dataUrl)) return imageCache.get(dataUrl);
    const isPng = dataUrl.startsWith("data:image/png");
    const bytes = dataUrlToBytes(dataUrl);
    let img;
    try {
      img = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
    } catch (err) {
      throw new ExportError("Không nhúng được ảnh chữ ký vào PDF.", err);
    }
    imageCache.set(dataUrl, img);
    return img;
  }

  try {
    for (const sig of placedSignatures) {
      const page = pages[sig.page];
      if (!page) continue;
      const { width: pw, height: ph } = page.getSize();

      const boxW = sig.wFrac * pw;
      const boxH = sig.hFrac * ph;
      const boxX = sig.xFrac * pw;
      const boxTopY = sig.yFrac * ph; // distance from top, screen space

      const img = await embedImage(sig.dataUrl);

      const tsLines = sig.showTimestamp ? sig.timestampLines || [] : [];
      const tsBlockH = tsLines.length ? tsLines.length * 9 + 4 : 0;
      const imgH = Math.max(boxH - tsBlockH, boxH * 0.55);

      const imgYFromTop = boxTopY;
      const imgYPdf = ph - imgYFromTop - imgH;

      page.drawImage(img, {
        x: boxX,
        y: imgYPdf,
        width: boxW,
        height: imgH,
      });

      if (tsLines.length) {
        let cursorYTop = boxTopY + imgH + 10;
        for (const line of tsLines) {
          const yPdf = ph - cursorYTop;
          page.drawText(line, {
            x: boxX,
            y: yPdf,
            size: 7.5,
            font,
            color: rgb(0.25, 0.25, 0.28),
          });
          cursorYTop += 9;
        }
      }
    }

    for (const ann of textAnnotations) {
      const page = pages[ann.page];
      if (!page) continue;
      const { width: pw, height: ph } = page.getSize();
      const x = ann.xFrac * pw;
      const yTop = ann.yFrac * ph;
      const size = ann.fontSize || 12;
      const lines = String(ann.text || "").split("\n");
      const color = ann.color
        ? rgb(ann.color[0], ann.color[1], ann.color[2])
        : rgb(0.1, 0.1, 0.1);
      let cursorTop = yTop + size;
      for (const line of lines) {
        const yPdf = ph - cursorTop;
        page.drawText(line, {
          x,
          y: yPdf,
          size,
          font: ann.bold ? fontBold : font,
          color,
        });
        cursorTop += size * 1.25;
      }
    }
  } catch (err) {
    if (err instanceof ExportError) throw err;
    throw new ExportError("Có lỗi khi vẽ chữ ký/văn bản lên PDF.", err);
  }

  try {
    return await pdfDoc.save();
  } catch (err) {
    throw new ExportError("Không tạo được file PDF cuối cùng.", err);
  }
}

export class ExportError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "ExportError";
    this.cause = cause;
  }
}

function dataUrlToBytes(dataUrl) {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function downloadBytes(bytes, filename) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
