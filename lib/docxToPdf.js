import mammoth from "mammoth/mammoth.browser";
import { jsPDF } from "jspdf";

/** Convert an uploaded .docx ArrayBuffer into HTML (styles preserved best-effort). */
export async function convertDocxToHtml(arrayBuffer) {
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      styleMap: [
        "p[style-name='Title'] => h1.docx-title",
        "p[style-name='Heading 1'] => h1",
        "p[style-name='Heading 2'] => h2",
        "p[style-name='Heading 3'] => h3",
      ],
    }
  );
  return { html: result.value, warnings: result.messages };
}

function waitTwoFrames() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

/**
 * Render a live DOM element into a paginated A4 PDF and return the raw
 * bytes, ready to feed into the same signing pipeline used for uploaded PDFs.
 */
export async function renderElementToPdfBytes(element) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  await new Promise((resolve, reject) => {
    try {
      pdf.html(element, {
        margin: [40, 40, 40, 40],
        autoPaging: "text",
        width: 515, // a4 pt width (595) - margins
        windowWidth: element.scrollWidth || 800,
        // Pin html2canvas's capture origin explicitly. Without this, an element
        // positioned via CSS at a large negative offset (the classic "render
        // off-screen" trick) confuses html2canvas's internal crop math and
        // produces a blank/white canvas — a well-known gotcha with jsPDF's
        // html() + html2canvas combo.
        html2canvas: { scrollX: 0, scrollY: 0, useCORS: true },
        callback: () => resolve(),
      });
    } catch (err) {
      reject(err);
    }
  });
  return pdf.output("arraybuffer");
}

/**
 * Convert a .docx ArrayBuffer directly into signable PDF bytes, with no
 * intermediate editing screen: the converted HTML is rendered in a hidden
 * container and rasterized to PDF via jsPDF/html2canvas.
 *
 * IMPORTANT: the container is kept at real (0,0) viewport coordinates and
 * hidden purely via a negative z-index (so it paints behind the normal app
 * UI). Positioning it off-screen with a large negative left/top — the more
 * "obvious" way to hide it — breaks html2canvas's capture and produces a
 * blank PDF, which is the bug this fixes.
 */
export async function convertDocxArrayBufferToPdfBytes(arrayBuffer) {
  const { html } = await convertDocxToHtml(arrayBuffer);
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  container.style.zIndex = "-1";
  container.style.width = "800px";
  container.style.background = "#fff";
  container.style.padding = "48px 56px";
  container.style.fontFamily = "'Times New Roman', Georgia, serif";
  container.style.fontSize = "15px";
  container.style.lineHeight = "1.7";
  container.style.color = "#1a1a1a";
  container.innerHTML = html || "<p></p>";
  document.body.appendChild(container);
  try {
    // Give the browser at least one full layout+paint cycle before capturing,
    // so image/font metrics used by html2canvas are accurate.
    await waitTwoFrames();
    return await renderElementToPdfBytes(container);
  } finally {
    document.body.removeChild(container);
  }
}
