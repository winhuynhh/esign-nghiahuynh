import mammoth from "mammoth/mammoth.browser";
import { jsPDF } from "jspdf";

/** Convert an uploaded .docx ArrayBuffer into editable HTML (styles preserved best-effort). */
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

/**
 * Render a live DOM element (e.g. the contentEditable document body) into a
 * paginated A4 PDF and return the raw bytes, ready to feed into the same
 * signing pipeline used for uploaded PDFs.
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
        callback: () => resolve(),
      });
    } catch (err) {
      reject(err);
    }
  });
  return pdf.output("arraybuffer");
}
