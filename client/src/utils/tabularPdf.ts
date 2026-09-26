export type PdfTableValue = string | number | boolean | Date | null;

type PdfMetadata = {
  label: string;
  value: PdfTableValue;
};

type TabularPdfExportOptions = {
  title: string;
  subject: string;
  filename: string;
  headers: string[];
  rows: PdfTableValue[][];
  columnWidths?: number[];
  metadata?: PdfMetadata[];
  orientation?: "portrait" | "landscape";
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const ensurePdfExtension = (filename: string) =>
  filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;

const formatValue = (value: PdfTableValue) => {
  if (value === null) {
    return "";
  }

  if (value instanceof Date) {
    return formatPdfDateTime(value.toISOString());
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
};

export const getLocalDateStamp = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatPdfDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

export const formatPdfDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const buildColumnWidths = (headers: string[], widths: number[]) => {
  if (widths.length !== headers.length) {
    return "";
  }

  const totalWidth = widths.reduce((total, width) => total + width, 0);

  return `<colgroup>${widths
    .map((width) => `<col style="width:${(width / totalWidth) * 100}%">`)
    .join("")}</colgroup>`;
};

const openPrintTarget = () => {
  const printWindow = window.open("", "_blank");

  if (printWindow) {
    return { targetWindow: printWindow, iframe: null };
  }

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  return { targetWindow: iframe.contentWindow, iframe };
};

export const exportTablePdf = ({
  title,
  subject,
  filename,
  headers,
  rows,
  columnWidths = [],
  metadata = [],
  orientation = headers.length > 6 ? "landscape" : "portrait",
}: TabularPdfExportOptions) => {
  if (rows.length === 0) {
    throw new Error("There are no records to export.");
  }

  if (headers.length === 0) {
    throw new Error("The export does not define any columns.");
  }

  if (rows.some((row) => row.length !== headers.length)) {
    throw new Error("The export data does not match the configured columns.");
  }

  const { targetWindow, iframe } = openPrintTarget();

  if (!targetWindow) {
    iframe?.remove();
    throw new Error("The PDF export window could not be opened.");
  }

  const exportedAt = new Date();
  const documentFilename = ensurePdfExtension(filename);
  const pageWidth = orientation === "landscape" ? "297mm" : "210mm";
  const pageHeight = orientation === "landscape" ? "210mm" : "297mm";
  const tableFontSize = headers.length >= 12 ? "6.5pt" : headers.length >= 8 ? "7.5pt" : "8.5pt";
  const exportMetadata: PdfMetadata[] = [
    ...metadata,
    { label: "Total Records", value: rows.length },
    { label: "Exported", value: formatPdfDateTime(exportedAt.toISOString()) },
  ];
  const metadataHtml = exportMetadata
    .map(
      ({ label, value }) => `
        <div class="meta-item">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(formatValue(value))}</strong>
        </div>`
    )
    .join("");
  const headerHtml = headers
    .map((header) => `<th>${escapeHtml(header)}</th>`)
    .join("");
  const rowsHtml = rows
    .map(
      (row) => `<tr>${row
        .map((value) => `<td>${escapeHtml(formatValue(value))}</td>`)
        .join("")}</tr>`
    )
    .join("");

  targetWindow.document.open();
  targetWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(documentFilename)}</title>
        <style>
          @page { size: A4 ${orientation}; margin: 0.45in; }
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; }
          body {
            background: #ffffff;
            color: #18181b;
            font-family: Arial, Helvetica, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .document {
            margin: 0 auto;
            min-height: ${pageHeight};
            width: ${pageWidth};
          }
          .header {
            align-items: flex-end;
            border-bottom: 2px solid #bf3419;
            display: flex;
            justify-content: space-between;
            margin-bottom: 14px;
            padding: 0 0 10px;
          }
          .eyebrow {
            color: #bf3419;
            font-size: 8pt;
            font-weight: 700;
            letter-spacing: 0.08em;
            margin: 0 0 4px;
            text-transform: uppercase;
          }
          h1 { font-size: 18pt; line-height: 1.2; margin: 0; }
          .subject { color: #71717a; font-size: 8pt; margin: 0; text-align: right; }
          .metadata {
            display: grid;
            gap: 1px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            margin-bottom: 14px;
            overflow: hidden;
            border: 1px solid #e4e4e7;
            border-radius: 6px;
            background: #e4e4e7;
          }
          .meta-item { background: #fafafa; padding: 7px 9px; }
          .meta-item span {
            color: #71717a;
            display: block;
            font-size: 6.5pt;
            font-weight: 700;
            margin-bottom: 2px;
            text-transform: uppercase;
          }
          .meta-item strong { display: block; font-size: 8pt; overflow-wrap: anywhere; }
          table {
            border-collapse: collapse;
            font-size: ${tableFontSize};
            table-layout: fixed;
            width: 100%;
          }
          thead { display: table-header-group; }
          tr { break-inside: avoid; page-break-inside: avoid; }
          th, td {
            border: 1px solid #d4d4d8;
            overflow-wrap: anywhere;
            padding: 5px 6px;
            text-align: left;
            vertical-align: top;
            word-break: normal;
          }
          th {
            background: #9f2b16;
            color: #ffffff;
            font-weight: 700;
          }
          tbody tr:nth-child(even) td { background: #fff7f5; }
          .footer {
            color: #71717a;
            display: flex;
            font-size: 7pt;
            justify-content: space-between;
            margin-top: 10px;
          }
          .page-number::after { content: counter(page); }
          @media screen {
            body { background: #e5e7eb; padding: 16px; }
            .document { background: white; padding: 0.45in; }
          }
          @media print {
            .document { min-height: 0; width: auto; }
          }
        </style>
      </head>
      <body>
        <main class="document">
          <header class="header">
            <div>
              <p class="eyebrow">ILabCICT</p>
              <h1>${escapeHtml(title)}</h1>
            </div>
            <p class="subject">${escapeHtml(subject)}</p>
          </header>
          <section class="metadata">${metadataHtml}</section>
          <table>
            ${buildColumnWidths(headers, columnWidths)}
            <thead><tr>${headerHtml}</tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <footer class="footer">
            <span>Generated by ILabCICT</span>
            <span>A4 paper - Page <span class="page-number"></span></span>
          </footer>
        </main>
        <script>
          window.addEventListener("load", () => {
            window.setTimeout(() => {
              window.focus();
              window.print();
            }, 100);
          });
        </script>
      </body>
    </html>
  `);
  targetWindow.document.close();

  if (iframe) {
    const cleanUp = () => iframe.remove();
    targetWindow.addEventListener("afterprint", cleanUp, { once: true });
    window.setTimeout(cleanUp, 60_000);
  }
};
