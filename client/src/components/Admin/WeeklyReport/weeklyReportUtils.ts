import bulsuFooterUrl from "@/assets/weekly-report/bulsu-footer.png";
import bulsuHeaderBaseUrl from "@/assets/weekly-report/bulsu-header-base.png";
import cictSealUrl from "@/assets/weekly-report/cict-seal.png";
import type {
  ApiWeeklyReport,
  WeeklyReport as WeeklyReportType,
} from "@/types/weeklyReport";
import { formatDateTime } from "@/utils/string";

export const formatLabel = (text: string) =>
  text
    .replace(/_/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

export const formatReportDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

export const formatSummaryDate = (dateKey: string) => {
  const [month, day, year] = dateKey.split("-");

  if (!month || !day || !year) {
    return dateKey;
  }

  return formatReportDate(`${year}-${month}-${day}T00:00:00`);
};

export const getTotalRepairLogs = (repairLogSummary: Record<string, number>) =>
  Object.values(repairLogSummary).reduce((total, count) => total + count, 0);

export const sortByNewest = (
  firstReport: WeeklyReportType,
  secondReport: WeeklyReportType
) => Date.parse(secondReport.createdAt) - Date.parse(firstReport.createdAt);

export const mapWeeklyReport = (report: ApiWeeklyReport): WeeklyReportType => ({
  id: report.id,
  reportCode: report.report_code,
  title: report.title,
  technicianName: report.content?.technician_name || "Unassigned Technician",
  summary: report.content?.ai_content_summary || "No summary available.",
  repairLogSummary: report.content?.repair_log_summary || {},
  status: report.status,
  createdAt: report.created_at,
  updatedAt: report.updated_at,
  technicianId: report.technician,
});

export const getStatusClasses = (status: string) => {
  switch (status.toLowerCase()) {
    case "read":
      return "bg-green-100 text-green-700";
    case "unread":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getAssetUrl = (assetUrl: string) =>
  new URL(assetUrl, window.location.origin).href;

const getReportPeriod = (title: string) => {
  const dates = title.match(/\d{4}-\d{2}-\d{2}/g);

  if (!dates || dates.length < 2) {
    return "Not specified";
  }

  return `${formatReportDate(`${dates[0]}T00:00:00`)} to ${formatReportDate(
    `${dates[1]}T00:00:00`
  )}`;
};

const buildPrintableReport = (report: WeeklyReportType) => {
  const totalRepairLogs = getTotalRepairLogs(report.repairLogSummary);
  const reportingPeriod = getReportPeriod(report.title);
  const headerBase = escapeHtml(getAssetUrl(bulsuHeaderBaseUrl));
  const cictSeal = escapeHtml(getAssetUrl(cictSealUrl));
  const footerArtwork = escapeHtml(getAssetUrl(bulsuFooterUrl));
  const rows = Object.entries(report.repairLogSummary)
    .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
    .map(
      ([date, count]) => `
        <tr>
          <td>${escapeHtml(formatSummaryDate(date))}</td>
          <td>${count}</td>
        </tr>
      `
    )
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(report.reportCode)} - ${escapeHtml(report.title)}</title>
        <style>
          @page { size: A4; margin: 0; }
          * { box-sizing: border-box; }
          html { background: #ffffff; }
          body {
            background: #e5e7eb;
            color: #111111;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10.5pt;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .official-header {
            height: 56.6mm;
            left: 0;
            overflow: hidden;
            position: absolute;
            top: 0;
            width: 210mm;
            z-index: 1;
          }
          .official-header-base {
            display: block;
            height: 100%;
            width: 100%;
          }
          .official-cict-seal {
            height: 40.9%;
            left: 15.64%;
            object-fit: contain;
            position: absolute;
            top: 25.1%;
            width: 11.03%;
          }
          .official-college-name {
            color: #c00000;
            font-family: "Arial Narrow", Arial, sans-serif;
            font-size: 12.5pt;
            font-weight: 700;
            left: 39.77%;
            line-height: 1;
            position: absolute;
            text-align: left;
            top: 57.45%;
            white-space: nowrap;
            width: 60.23%;
          }
          .official-contact {
            bottom: 43mm;
            color: #111111;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 8.5pt;
            left: 19mm;
            line-height: 1.25;
            position: absolute;
            right: 19mm;
            text-align: center;
            z-index: 1;
          }
          .official-footer-art {
            bottom: 0;
            display: block;
            height: 42mm;
            left: 0;
            object-fit: fill;
            position: absolute;
            width: 210mm;
            z-index: 0;
          }
          .document {
            margin: 0 auto;
            position: relative;
          }
          #report-source { display: none; }
          .report-page {
            background: #ffffff;
            height: 297mm;
            margin: 0 auto 8mm;
            overflow: hidden;
            position: relative;
            width: 210mm;
          }
          .page-content {
            bottom: 58mm;
            left: 19mm;
            overflow: hidden;
            position: absolute;
            right: 19mm;
            top: 64mm;
            z-index: 2;
          }
          .report-heading {
            border-bottom: 1.5pt solid #b91c1c;
            margin-bottom: 6mm;
            padding-bottom: 3mm;
            text-align: center;
          }
          .report-heading h1 {
            font-size: 17pt;
            line-height: 1.2;
            margin: 0 0 1.5mm;
          }
          .report-code {
            color: #4b5563;
            font-size: 9pt;
            font-weight: 700;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          .meta {
            margin: 0 0 6mm;
            table-layout: fixed;
          }
          .meta th,
          .meta td,
          .summary-table th,
          .summary-table td {
            border: 0.75pt solid #cbd0d6;
            padding: 2.4mm 2.8mm;
            text-align: left;
            vertical-align: top;
          }
          .meta th {
            background: #f3f4f6;
            color: #374151;
            font-size: 8.5pt;
            width: 22%;
          }
          .meta td { width: 28%; }
          h2 {
            border-bottom: 0.75pt solid #d1d5db;
            font-size: 11.5pt;
            margin: 6mm 0 2.5mm;
            padding-bottom: 1.5mm;
            text-transform: uppercase;
          }
          .summary-table {
            margin-top: 2.5mm;
            page-break-inside: auto;
          }
          .summary-table thead { display: table-header-group; }
          .summary-table tr { page-break-inside: avoid; }
          .summary-table th {
            background: #b91c1c;
            color: #ffffff;
          }
          .summary-table th:last-child,
          .summary-table td:last-child {
            text-align: center;
            width: 30%;
          }
          .narrative {
            margin: 0;
            orphans: 3;
            text-align: justify;
            widows: 3;
          }
          .signatures {
            display: grid;
            gap: 14mm;
            grid-template-columns: 1fr 1fr;
            margin-top: 18mm;
            page-break-inside: avoid;
          }
          .signature-line {
            border-top: 0.75pt solid #111111;
            padding-top: 2mm;
            text-align: center;
          }
          .signature-line strong {
            display: block;
            font-size: 9.5pt;
          }
          @media print {
            body { background: #ffffff; }
            .report-page {
              break-after: page;
              margin: 0;
              page-break-after: always;
            }
            .report-page:last-child {
              break-after: auto;
              page-break-after: auto;
            }
          }
        </style>
      </head>
      <body>
        <template id="report-page-template">
          <section class="report-page">
            <header class="official-header" aria-hidden="true">
              <img class="official-header-base" src="${headerBase}" alt="" />
              <img class="official-cict-seal" src="${cictSeal}" alt="" />
              <div class="official-college-name">COLLEGE OF INFORMATION AND COMMUNICATIONS TECHNOLOGY</div>
            </header>

            <div class="official-contact" aria-hidden="true">
              <div>OfficeoftheDean.CICT@BulSU.edu.ph | (044) 919 7800 Local 1102</div>
              <div>McArthur Highway, City of Malolos 3000</div>
              <div>Bulacan, Philippines</div>
            </div>
            <img class="official-footer-art" src="${footerArtwork}" alt="" aria-hidden="true" />
            <main class="page-content document"></main>
          </section>
        </template>

        <div id="report-pages"></div>

        <div id="report-source">
          <section data-report-block>
            <section class="report-heading">
              <h1>${escapeHtml(report.title)}</h1>
              <div class="report-code">WEEKLY MAINTENANCE REPORT · ${escapeHtml(report.reportCode)}</div>
            </section>

            <table class="meta">
              <tbody>
                <tr>
                  <th>Technician</th>
                  <td>${escapeHtml(report.technicianName)}</td>
                  <th>Report Status</th>
                  <td>${escapeHtml(formatLabel(report.status))}</td>
                </tr>
                <tr>
                  <th>Reporting Period</th>
                  <td>${escapeHtml(reportingPeriod)}</td>
                  <th>Total Repair Logs</th>
                  <td>${totalRepairLogs}</td>
                </tr>
                <tr>
                  <th>Created</th>
                  <td>${escapeHtml(formatDateTime(report.createdAt))}</td>
                  <th>Last Updated</th>
                  <td>${escapeHtml(formatDateTime(report.updatedAt))}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section data-report-block data-pagination="text" data-title="Executive Summary">
            <h2>Executive Summary</h2>
            <p class="narrative">${escapeHtml(report.summary)}</p>
          </section>

          <section data-report-block data-pagination="table" data-title="Repair Log Summary">
            <h2>Repair Log Summary</h2>
            <table class="summary-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Completed Logs</th>
                </tr>
              </thead>
              <tbody>
                ${
                  rows ||
                  `<tr><td colspan="2">No repair log activity recorded.</td></tr>`
                }
              </tbody>
            </table>
          </section>

          <section data-report-block>
            <section class="signatures">
              <div class="signature-line">
                <strong>${escapeHtml(report.technicianName)}</strong>
                Prepared by / Technician
              </div>
              <div class="signature-line">
                <strong>&nbsp;</strong>
                Reviewed by / Administrator
              </div>
            </section>
          </section>
        </div>

        <script>
          (() => {
            const pageTemplate = document.getElementById("report-page-template");
            const pages = document.getElementById("report-pages");
            const source = document.getElementById("report-source");
            let pageContent;

            const createPage = () => {
              const fragment = pageTemplate.content.cloneNode(true);
              const nextContent = fragment.querySelector(".page-content");
              pages.appendChild(fragment);
              pageContent = nextContent;
              return nextContent;
            };

            const isOverflowing = () =>
              pageContent.scrollHeight > pageContent.clientHeight + 1;

            const appendWholeBlock = (block) => {
              const clone = block.cloneNode(true);
              pageContent.appendChild(clone);

              if (isOverflowing() && pageContent.childElementCount > 1) {
                clone.remove();
                createPage().appendChild(clone);
              }
            };

            const createTextSection = (title, continued) => {
              const section = document.createElement("section");
              const heading = document.createElement("h2");
              const paragraph = document.createElement("p");

              heading.textContent = continued ? title + " (continued)" : title;
              paragraph.className = "narrative";
              section.append(heading, paragraph);
              pageContent.appendChild(section);

              if (isOverflowing() && pageContent.childElementCount > 1) {
                section.remove();
                createPage().appendChild(section);
              }

              return paragraph;
            };

            const appendTextBlock = (block) => {
              const title = block.dataset.title;
              const words = block.querySelector(".narrative").textContent.trim().split(/\\s+/);
              let paragraph = createTextSection(title, false);

              words.forEach((word) => {
                const previousText = paragraph.textContent;
                paragraph.textContent = previousText ? previousText + " " + word : word;

                if (!isOverflowing()) {
                  return;
                }

                paragraph.textContent = previousText;
                createPage();
                paragraph = createTextSection(title, true);
                paragraph.textContent = word;
              });
            };

            const createTableSection = (block, continued) => {
              const section = document.createElement("section");
              const heading = block.querySelector("h2").cloneNode(true);
              const sourceTable = block.querySelector("table");
              const table = sourceTable.cloneNode(false);
              const tableHead = sourceTable.querySelector("thead").cloneNode(true);
              const tableBody = document.createElement("tbody");

              if (continued) {
                heading.textContent = block.dataset.title + " (continued)";
              }

              table.append(tableHead, tableBody);
              section.append(heading, table);
              pageContent.appendChild(section);

              if (isOverflowing() && pageContent.childElementCount > 1) {
                section.remove();
                createPage().appendChild(section);
              }

              return tableBody;
            };

            const appendTableBlock = (block) => {
              const sourceRows = Array.from(block.querySelectorAll("tbody tr"));
              let tableBody = createTableSection(block, false);

              sourceRows.forEach((row) => {
                const clone = row.cloneNode(true);
                tableBody.appendChild(clone);

                if (!isOverflowing()) {
                  return;
                }

                clone.remove();
                createPage();
                tableBody = createTableSection(block, true);
                tableBody.appendChild(clone);
              });
            };

            createPage();
            source.querySelectorAll("[data-report-block]").forEach((block) => {
              if (block.dataset.pagination === "text") {
                appendTextBlock(block);
                return;
              }

              if (block.dataset.pagination === "table") {
                appendTableBlock(block);
                return;
              }

              appendWholeBlock(block);
            });
          })();
        </script>
      </body>
    </html>
  `;
};

const printWhenAssetsAreReady = (
  targetWindow: Window,
  onAfterPrint?: () => void
) => {
  const images = Array.from(targetWindow.document.images);
  const imageLoads = images.map(
    (image) =>
      new Promise<void>((resolve) => {
        if (image.complete) {
          resolve();
          return;
        }

        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      })
  );

  void Promise.all(imageLoads).then(() => {
    if (onAfterPrint) {
      let hasCleanedUp = false;
      const cleanUp = () => {
        if (hasCleanedUp) {
          return;
        }

        hasCleanedUp = true;
        onAfterPrint();
      };

      targetWindow.addEventListener("afterprint", cleanUp, { once: true });
      window.setTimeout(cleanUp, 60_000);
    }

    targetWindow.focus();
    targetWindow.print();
  });
};

export const exportReportToPdf = (report: WeeklyReportType) => {
  const printableReport = buildPrintableReport(report);
  const printWindow = window.open("", "_blank");

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printableReport);
    printWindow.document.close();
    printWhenAssetsAreReady(printWindow);
    return;
  }

  const iframe = document.createElement("iframe");

  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";

  document.body.appendChild(iframe);

  const iframeDocument = iframe.contentWindow?.document;

  if (!iframeDocument) {
    iframe.remove();
    return;
  }

  iframeDocument.open();
  iframeDocument.write(printableReport);
  iframeDocument.close();

  if (iframe.contentWindow) {
    printWhenAssetsAreReady(iframe.contentWindow, () => iframe.remove());
  }
};
