import type { AssignmentReport } from "@/types/assignmentReport";
import {
  fetchWeeklyReportTemplate,
  printWhenAssetsAreReady,
} from "@/components/Admin/WeeklyReport/weeklyReportUtils";
import { appToast } from "@/utils/appToast";
import { escapeHtml, openPrintTarget } from "@/utils/tabularPdf";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const isAssignmentReport = (value: unknown): value is AssignmentReport =>
  isRecord(value) && isRecord(value.technician) &&
  typeof value.technician.id === "number" &&
  typeof value.technician.first_name === "string" &&
  typeof value.technician.last_name === "string" &&
  Array.isArray(value.assignment_report) && value.assignment_report.every((entry: unknown) =>
    isRecord(entry) && typeof entry.date === "string" &&
    typeof entry.summary === "string" && typeof entry.is_completed === "boolean" &&
    Array.isArray(entry.locations) && entry.locations.every((location: unknown) => typeof location === "string")
  );

export const getCompletedAssignments = (report: AssignmentReport) =>
  report.assignment_report.filter((entry) => entry.is_completed === true);

const FORM_HEADERS = ["Date", "Tasks", "Location", "Faculty Signature if Classroom", "Status<br>(Completed, Pending)"];

// "09-03-2026" -> "9/3/26", the way dates are written on the paper form.
const formatFormDate = (date: string) => {
  const match = date.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return match ? `${Number(match[1])}/${Number(match[2])}/${match[3].slice(2)}` : date;
};

// Mirrors the printed Technicians Assignment Form on the uploaded printable
// template, inside the same content area the Weekly Report export uses.
const buildAssignmentForm = (report: AssignmentReport, monthName: string, templateImageUrl: string) => {
  const entries = getCompletedAssignments(report);
  const name = `${report.technician.first_name} ${report.technician.last_name}`.trim();
  const year = entries[0]?.date.match(/\d{4}/)?.[0] ?? String(new Date().getFullYear());
  const rows = entries.map((entry) => `
    <tr>
      <td>${escapeHtml(formatFormDate(entry.date))}</td>
      <td>${escapeHtml(entry.summary)}</td>
      <td>${escapeHtml(entry.locations.join(", "))}</td>
      <td></td>
      <td>Completed</td>
    </tr>`).join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(`Assignment-${name.replace(/[^a-z0-9_-]+/gi, "-")}-${monthName}`)}</title>
        <style>
          @page { size: A4 portrait; margin: 0; }
          * { box-sizing: border-box; }
          html { background: #ffffff; }
          body {
            background: #e5e7eb;
            color: #111111;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 9pt;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .form-page {
            background: #ffffff;
            height: 297mm;
            margin: 0 auto 8mm;
            overflow: hidden;
            position: relative;
            width: 210mm;
          }
          .official-template {
            display: block;
            height: 297mm;
            left: 0;
            object-fit: fill;
            position: absolute;
            top: 0;
            width: 210mm;
            z-index: 0;
          }
          .page-content {
            bottom: 58mm;
            left: 15mm;
            overflow: hidden;
            position: absolute;
            right: 15mm;
            top: 64mm;
            z-index: 2;
          }
          .form-heading {
            align-items: end;
            display: grid;
            gap: 4mm;
            grid-template-columns: 1fr auto 1fr;
            margin-bottom: 1mm;
          }
          .form-heading h1 { font-size: 10pt; margin: 0; text-transform: uppercase; }
          .form-heading span:last-child { text-align: right; }
          table { border-collapse: collapse; table-layout: fixed; width: 100%; }
          th, td {
            border: 0.75pt solid #111111;
            height: 8mm;
            overflow-wrap: anywhere;
            padding: 1.5mm 2mm;
            vertical-align: middle;
          }
          th { font-size: 8pt; text-align: center; text-transform: uppercase; }
          td:nth-child(1), td:nth-child(3), td:nth-child(5) { text-align: center; }
          .signatures {
            display: grid;
            gap: 14mm;
            grid-template-columns: 1fr 1fr;
            padding-top: 14mm;
          }
          .signature-line {
            border-top: 0.75pt solid #111111;
            padding-top: 2mm;
            text-align: center;
          }
          .signature-line strong { display: block; }
          @media print {
            body { background: #ffffff; }
            .form-page { break-after: page; margin: 0; page-break-after: always; }
            .form-page:last-child { break-after: auto; page-break-after: auto; }
          }
        </style>
      </head>
      <body>
        <template id="form-page-template">
          <section class="form-page">
            <img class="official-template" src="${escapeHtml(templateImageUrl)}" alt="" aria-hidden="true" />
            <main class="page-content">
              <header class="form-heading">
                <span>${escapeHtml(monthName)}</span>
                <h1>Technicians Assignment Form ${year}</h1>
                <span>${escapeHtml(name)}</span>
              </header>
              <table>
                <colgroup>
                  <col style="width:12%"><col style="width:36%"><col style="width:17%"><col style="width:19%"><col style="width:16%">
                </colgroup>
                <thead><tr>${FORM_HEADERS.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
                <tbody></tbody>
              </table>
            </main>
          </section>
        </template>

        <div id="form-pages"></div>
        <table hidden><tbody id="form-source">${rows}</tbody></table>
        <template id="form-signatures-template">
          <section class="signatures">
            <div class="signature-line">
              <strong>${escapeHtml(name)}</strong>
              Prepared by / Technician
            </div>
            <div class="signature-line">
              <strong>&nbsp;</strong>
              Reviewed by / Administrator
            </div>
          </section>
        </template>

        <script>
          (() => {
            const pageTemplate = document.getElementById("form-page-template");
            const pages = document.getElementById("form-pages");
            const sourceRows = Array.from(document.getElementById("form-source").children);
            let pageContent;
            let tableBody;

            const createPage = () => {
              const fragment = pageTemplate.content.cloneNode(true);
              pageContent = fragment.querySelector(".page-content");
              tableBody = fragment.querySelector("tbody");
              pages.appendChild(fragment);
            };

            const isOverflowing = () =>
              pageContent.scrollHeight > pageContent.clientHeight + 1;

            createPage();
            sourceRows.forEach((row) => {
              tableBody.appendChild(row);

              if (!isOverflowing() || tableBody.childElementCount === 1) {
                return;
              }

              row.remove();
              createPage();
              tableBody.appendChild(row);
            });

            const signatures = document
              .getElementById("form-signatures-template")
              .content.firstElementChild.cloneNode(true);
            pageContent.appendChild(signatures);

            // Keep the signatures with at least one entry when they spill over.
            if (isOverflowing() && tableBody.childElementCount > 1) {
              const lastRow = tableBody.lastElementChild;
              createPage();
              tableBody.appendChild(lastRow);
              pageContent.appendChild(signatures);
            }

            // Blank ruled rows fill the rest of the last page, like the paper form.
            for (let count = 0; count < 40; count += 1) {
              const blankRow = document.createElement("tr");
              blankRow.innerHTML = "<td></td>".repeat(${FORM_HEADERS.length});
              tableBody.appendChild(blankRow);

              if (isOverflowing()) {
                blankRow.remove();
                break;
              }
            }
          })();
        </script>
      </body>
    </html>
  `;
};

export const exportAssignmentReport = async (report: AssignmentReport, month: number) => {
  const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(2000, month - 1, 1));
  const { targetWindow, iframe } = openPrintTarget();

  if (!targetWindow) {
    iframe?.remove();
    throw new Error("The PDF export window could not be opened.");
  }

  const closeTarget = () => {
    if (iframe) {
      iframe.remove();
      return;
    }

    targetWindow.close();
  };

  targetWindow.document.open();
  targetWindow.document.write(
    "<!doctype html><title>Preparing Assignment Form</title><p style='font-family:Arial;padding:24px'>Preparing Assignment Form...</p>"
  );
  targetWindow.document.close();

  let assignmentForm: string;

  try {
    assignmentForm = buildAssignmentForm(report, monthName, await fetchWeeklyReportTemplate());
  } catch (error) {
    closeTarget();
    throw error;
  }

  targetWindow.document.open();
  targetWindow.document.write(assignmentForm);
  targetWindow.document.close();
  printWhenAssetsAreReady(
    targetWindow,
    iframe ? () => iframe.remove() : undefined,
    () => {
      closeTarget();
      appToast.error("The printable template could not be loaded. Please try again.");
    }
  );
};
