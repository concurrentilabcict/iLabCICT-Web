import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import type {
  ApiWeeklyReport,
  WeeklyReport as WeeklyReportType,
} from "@/types/weeklyReport";
import { appToast } from "@/utils/appToast";

type ApiPrintableTemplate = {
  id: number;
  name: string;
  template_url: string;
  is_active: boolean;
  updated_at: string;
};

const configuredTemplateName =
  import.meta.env.VITE_WEEKLY_REPORT_TEMPLATE_NAME?.trim();
const weeklyReportTemplateNames = configuredTemplateName
  ? [configuredTemplateName]
  : ["weekly-report", "report-header-footer"];

export const WEEKLY_REPORT_TEMPLATE_NAME =
  configuredTemplateName || "weekly-report";

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

const getTemplateImageUrl = (templateUrl: string) => {
  const url = new URL(templateUrl);

  if (
    !url.hostname.endsWith("cloudinary.com") ||
    !url.pathname.toLowerCase().endsWith(".pdf") ||
    !url.pathname.includes("/image/upload/")
  ) {
    throw new Error(
      "The printable template must be a Cloudinary-hosted PDF."
    );
  }

  url.pathname = url.pathname
    .replace("/image/upload/", "/image/upload/f_png,pg_1,dn_150/")
    .replace(/\.pdf$/i, ".png");

  return url.href;
};

const getResponseMessage = (value: unknown) => {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  if ("detail" in value && typeof value.detail === "string") {
    return value.detail;
  }

  return null;
};

const isPrintableTemplate = (value: unknown): value is ApiPrintableTemplate =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  typeof value.id === "number" &&
  "name" in value &&
  typeof value.name === "string" &&
  "template_url" in value &&
  typeof value.template_url === "string" &&
  "is_active" in value &&
  typeof value.is_active === "boolean" &&
  "updated_at" in value &&
  typeof value.updated_at === "string";

const fetchWeeklyReportTemplate = async () => {
  for (const [index, templateName] of weeklyReportTemplateNames.entries()) {
    const response = await privateFetch(
      buildApiUrl(`/api/templates/${encodeURIComponent(templateName)}/`)
    );
    const data: unknown = await response.json().catch(() => null);

    if (response.ok) {
      if (!isPrintableTemplate(data)) {
        throw new Error("The printable template response is invalid.");
      }

      if (!data.is_active || !data.template_url) {
        throw new Error("The Weekly Report printable template is inactive.");
      }

      return getTemplateImageUrl(data.template_url);
    }

    const canTryFallback =
      response.status === 404 && index < weeklyReportTemplateNames.length - 1;
    if (!canTryFallback) {
      throw createApiError(
        response.status,
        getResponseMessage(data) ??
          "Failed to retrieve the Weekly Report printable template."
      );
    }
  }

  throw new Error("Weekly Report printable template not found.");
};

const getReportPeriod = (title: string) => {
  const dates = title.match(/\d{4}-\d{2}-\d{2}/g);

  if (!dates || dates.length < 2) {
    return "Not specified";
  }

  const [startYear, startMonth, startDay] = dates[0].split("-").map(Number);
  const [endYear, endMonth, endDay] = dates[1].split("-").map(Number);
  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long" });
  const startMonthName = monthFormatter.format(
    new Date(startYear, startMonth - 1, startDay)
  );
  const endMonthName = monthFormatter.format(
    new Date(endYear, endMonth - 1, endDay)
  );

  if (startYear === endYear && startMonth === endMonth) {
    return `${startMonthName} ${startDay}–${endDay}, ${startYear}`;
  }

  if (startYear === endYear) {
    return `${startMonthName} ${startDay} – ${endMonthName} ${endDay}, ${startYear}`;
  }

  return `${startMonthName} ${startDay}, ${startYear} – ${endMonthName} ${endDay}, ${endYear}`;
};

const formatReportTimestamp = (date: string) => {
  const value = new Date(date);
  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(value);

  return `${datePart} • ${timePart}`;
};

const getPdfReportTitle = (title: string) => {
  const dates = title.match(/\d{4}-\d{2}-\d{2}/g);

  if (!dates || dates.length < 2) {
    return title;
  }

  const [startYear, startMonth, startDay] = dates[0].split("-").map(Number);
  const [endYear, endMonth, endDay] = dates[1].split("-").map(Number);
  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long" });
  const startMonthName = monthFormatter.format(
    new Date(startYear, startMonth - 1, startDay)
  );
  const endMonthName = monthFormatter.format(
    new Date(endYear, endMonth - 1, endDay)
  );

  if (startYear === endYear && startMonth === endMonth) {
    return `Weekly Report — ${startMonthName} ${startDay}–${endDay}, ${startYear}`;
  }

  if (startYear === endYear) {
    return `Weekly Report — ${startMonthName} ${startDay} – ${endMonthName} ${endDay}, ${startYear}`;
  }

  return `Weekly Report — ${startMonthName} ${startDay}, ${startYear} – ${endMonthName} ${endDay}, ${endYear}`;
};

const buildPrintableReport = (
  report: WeeklyReportType,
  templateImageUrl: string
) => {
  const totalRepairLogs = getTotalRepairLogs(report.repairLogSummary);
  const reportingPeriod = getReportPeriod(report.title);
  const pdfTitle = getPdfReportTitle(report.title);
  const exportDocumentTitle =
    reportingPeriod === "Not specified"
      ? `${report.reportCode} - ${report.title}`
      : `${report.reportCode} - Weekly Report - ${reportingPeriod.replace(
          /\s*–\s*/g,
          "-"
        )}`;
  const printableTemplate = escapeHtml(templateImageUrl);
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
        <title>${escapeHtml(exportDocumentTitle)}</title>
        <style>
          @page { size: 8.5in 14in; margin: 0; }
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
          .official-template {
            height: 14in;
            left: 0;
            object-fit: fill;
            position: absolute;
            top: 0;
            display: block;
            width: 8.5in;
            z-index: 0;
          }
          .document {
            margin: 0 auto;
            position: relative;
          }
          #report-source { display: none; }
          .report-page {
            background: #ffffff;
            height: 14in;
            margin: 0 auto 8mm;
            overflow: hidden;
            position: relative;
            width: 8.5in;
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
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            margin: 0 0 6mm;
            overflow: hidden;
            border: 0.75pt solid #d1d5db;
            border-radius: 2.5mm;
          }
          .meta-item {
            min-width: 0;
            padding: 2.8mm 3.2mm;
            background: #f8f9fa;
            border-bottom: 0.75pt solid #d1d5db;
          }
          .meta-item:nth-child(odd) {
            border-right: 0.75pt solid #d1d5db;
          }
          .meta-item:nth-last-child(-n + 2) {
            border-bottom: 0;
          }
          .meta-label {
            color: #6b7280;
            font-size: 7.5pt;
            font-weight: 700;
            letter-spacing: 0.02em;
            line-height: 1.2;
            margin-bottom: 1.2mm;
            text-transform: uppercase;
          }
          .meta-value {
            color: #111827;
            font-size: 9.5pt;
            line-height: 1.35;
            overflow-wrap: anywhere;
          }
          .summary-table th,
          .summary-table td {
            border: 0.75pt solid #cbd0d6;
            padding: 2.4mm 2.8mm;
            text-align: left;
            vertical-align: top;
          }
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
            <img class="official-template" src="${printableTemplate}" alt="" aria-hidden="true" />
            <main class="page-content document"></main>
          </section>
        </template>

        <div id="report-pages"></div>

        <div id="report-source">
          <section data-report-block>
            <section class="report-heading">
              <h1>${escapeHtml(pdfTitle)}</h1>
              <div class="report-code">WEEKLY MAINTENANCE REPORT · ${escapeHtml(report.reportCode)}</div>
            </section>

            <div class="meta-grid">
              <div class="meta-item">
                <div class="meta-label">Technician</div>
                <div class="meta-value">${escapeHtml(report.technicianName)}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Report Status</div>
                <div class="meta-value">${escapeHtml(formatLabel(report.status))}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Reporting Period</div>
                <div class="meta-value">${escapeHtml(reportingPeriod)}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Total Repair Logs</div>
                <div class="meta-value">${totalRepairLogs}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Created</div>
                <div class="meta-value">${escapeHtml(formatReportTimestamp(report.createdAt))}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Last Updated</div>
                <div class="meta-value">${escapeHtml(formatReportTimestamp(report.updatedAt))}</div>
              </div>
            </div>
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
  onAfterPrint?: () => void,
  onAssetError?: () => void
) => {
  const images = Array.from(targetWindow.document.images);
  const imageLoads = images.map(
    (image) =>
      new Promise<boolean>((resolve) => {
        if (image.complete) {
          resolve(image.naturalWidth > 0);
          return;
        }

        image.addEventListener("load", () => resolve(true), { once: true });
        image.addEventListener("error", () => resolve(false), { once: true });
      })
  );

  void Promise.all(imageLoads).then((results) => {
    if (results.some((didLoad) => !didLoad)) {
      onAssetError?.();
      return;
    }

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

export const exportReportToPdf = async (report: WeeklyReportType) => {
  const printWindow = window.open("", "_blank");
  let iframe: HTMLIFrameElement | null = null;
  let targetWindow = printWindow;

  if (!targetWindow) {
    iframe = document.createElement("iframe");

    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";

    document.body.appendChild(iframe);
    targetWindow = iframe.contentWindow;
  }

  if (!targetWindow) {
    iframe?.remove();
    appToast.error("The PDF export window could not be opened.");
    return;
  }

  targetWindow.document.open();
  targetWindow.document.write(
    "<!doctype html><title>Preparing Weekly Report</title><p style='font-family:Arial;padding:24px'>Preparing Weekly Report...</p>"
  );
  targetWindow.document.close();

  try {
    const templateImageUrl = await fetchWeeklyReportTemplate();
    const printableReport = buildPrintableReport(report, templateImageUrl);

    targetWindow.document.open();
    targetWindow.document.write(printableReport);
    targetWindow.document.close();
    printWhenAssetsAreReady(
      targetWindow,
      iframe ? () => iframe?.remove() : undefined,
      () => {
        if (printWindow) {
          printWindow.close();
        }
        iframe?.remove();
        appToast.error(
          "The Weekly Report template could not be loaded. Please try again."
        );
      }
    );
  } catch (error) {
    if (printWindow) {
      printWindow.close();
    }
    iframe?.remove();
    appToast.error(
      error instanceof Error
        ? error.message
        : "We couldn't prepare the Weekly Report PDF."
    );
  }
};
