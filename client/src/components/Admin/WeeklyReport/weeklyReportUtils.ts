import { formatDateTime } from "@/utils/string";
import type {
  ApiWeeklyReport,
  WeeklyReport as WeeklyReportType,
} from "@/types/weeklyReport";

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

const buildPrintableReport = (report: WeeklyReportType) => {
  const totalRepairLogs = getTotalRepairLogs(report.repairLogSummary);
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
          @page { size: A4; margin: 18mm; }
          * { box-sizing: border-box; }
          body {
            color: #111827;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            line-height: 1.55;
            margin: 0;
          }
          .document { min-height: 100vh; position: relative; }
          .header {
            border-bottom: 2px solid #991b1b;
            padding-bottom: 18px;
            text-align: center;
          }
          .office {
            color: #374151;
            font-size: 11px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          h1 {
            font-size: 22px;
            letter-spacing: 0.02em;
            margin: 8px 0 4px;
            text-transform: uppercase;
          }
          .report-code { color: #4b5563; font-weight: 700; }
          .meta {
            border: 1px solid #d1d5db;
            border-collapse: collapse;
            margin: 24px 0;
            width: 100%;
          }
          .meta th,
          .meta td,
          .summary-table th,
          .summary-table td {
            border: 1px solid #d1d5db;
            padding: 9px 10px;
            text-align: left;
            vertical-align: top;
          }
          .meta th { background: #f3f4f6; width: 28%; }
          h2 {
            border-bottom: 1px solid #d1d5db;
            font-size: 14px;
            margin: 22px 0 10px;
            padding-bottom: 6px;
            text-transform: uppercase;
          }
          .summary-table {
            border: 1px solid #d1d5db;
            border-collapse: collapse;
            margin-top: 10px;
            width: 100%;
          }
          .summary-table th { background: #f3f4f6; }
          .narrative { text-align: justify; }
          .signatures {
            display: grid;
            gap: 36px;
            grid-template-columns: 1fr 1fr;
            margin-top: 70px;
          }
          .signature-line {
            border-top: 1px solid #111827;
            padding-top: 8px;
            text-align: center;
          }
          .footer {
            bottom: 0;
            color: #6b7280;
            font-size: 10px;
            position: fixed;
            text-align: center;
            width: 100%;
          }
          @media print {
            .document { min-height: auto; }
          }
        </style>
      </head>
      <body>
        <main class="document">
          <section class="header">
            <div class="office">iLabCICT Maintenance Reporting</div>
            <h1>${escapeHtml(report.title)}</h1>
            <div class="report-code">${escapeHtml(report.reportCode)}</div>
          </section>

          <table class="meta">
            <tbody>
              <tr>
                <th>Technician</th>
                <td>${escapeHtml(report.technicianName)}</td>
              </tr>
              <tr>
                <th>Report Status</th>
                <td>${escapeHtml(formatLabel(report.status))}</td>
              </tr>
              <tr>
                <th>Date Generated</th>
                <td>${escapeHtml(formatDateTime(report.createdAt))}</td>
              </tr>
              <tr>
                <th>Total Repair Logs</th>
                <td>${totalRepairLogs}</td>
              </tr>
            </tbody>
          </table>

          <h2>Executive Summary</h2>
          <p class="narrative">${escapeHtml(report.summary)}</p>

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

          <section class="signatures">
            <div class="signature-line">Prepared by / Technician</div>
            <div class="signature-line">Reviewed by / Administrator</div>
          </section>

          <footer class="footer">
            Generated from iLabCICT on ${escapeHtml(formatReportDate(new Date().toISOString()))}
          </footer>
        </main>
        <script>
          window.addEventListener("load", () => {
            window.print();
          });
        </script>
      </body>
    </html>
  `;
};

export const exportReportToPdf = (report: WeeklyReportType) => {
  const printableReport = buildPrintableReport(report);
  const printWindow = window.open("", "_blank");

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printableReport);
    printWindow.document.close();
    printWindow.focus();
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

  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    window.setTimeout(() => {
      iframe.remove();
    }, 1000);
  };
};
