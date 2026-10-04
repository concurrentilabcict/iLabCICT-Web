import type { AssignmentReport } from "@/types/assignmentReport";
import { exportTablePdf } from "@/utils/tabularPdf";
import header from "@/assets/weekly-report/bulsu-header-base.png";
import footer from "@/assets/weekly-report/bulsu-footer.png";

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

export const exportAssignmentReport = (report: AssignmentReport, month: number) => {
  const entries = getCompletedAssignments(report);
  const name = `${report.technician.first_name} ${report.technician.last_name}`.trim();
  const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(2000, month - 1, 1));
  exportTablePdf({
    title: "Technician Assignment Form",
    subject: "College of Information and Communications Technology",
    filename: `Assignment-${name.replace(/[^a-z0-9_-]+/gi, "-")}-${monthName}.pdf`,
    headers: ["Date", "Tasks", "Location", "Faculty Signature if Classroom", "Status"],
    rows: entries.map((entry) => [entry.date, entry.summary, entry.locations.join(", "), "", "Completed"]),
    columnWidths: [12, 42, 18, 18, 10],
    metadata: [{ label: "Technician", value: name }, { label: "Month", value: monthName }],
    orientation: "portrait",
    letterhead: { header, footer },
  });
};
