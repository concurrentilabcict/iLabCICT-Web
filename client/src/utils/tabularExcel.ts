const XLSX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const BRAND_RED = "FFBF3419";
const BRAND_RED_DARK = "FF8F2615";
const BRAND_RED_LIGHT = "FFFFF2EF";
const BORDER_COLOR = "FFD9DEE7";

export type ExcelTableValue = string | number | boolean | Date | null;

type ExcelMetadata = {
  label: string;
  value: ExcelTableValue;
};

type TabularExcelExportOptions = {
  title: string;
  subject: string;
  worksheetName: string;
  filename: string;
  headers: string[];
  rows: ExcelTableValue[][];
  columnWidths?: number[];
  metadata?: ExcelMetadata[];
};

const ensureXlsxExtension = (filename: string) =>
  filename.toLowerCase().endsWith(".xlsx") ? filename : `${filename}.xlsx`;

const createTableName = (worksheetName: string) => {
  const name = worksheetName.replace(/[^a-z0-9]/gi, "");
  return `${name || "Export"}Table`;
};

export const getLocalDateStamp = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatExcelDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

export const formatExcelDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export const exportTableWorkbook = async ({
  title,
  subject,
  worksheetName,
  filename,
  headers,
  rows,
  columnWidths = [],
  metadata = [],
}: TabularExcelExportOptions) => {
  if (rows.length === 0) {
    throw new Error("There are no records to export.");
  }

  if (headers.length === 0) {
    throw new Error("The export does not define any columns.");
  }

  const invalidRow = rows.find((row) => row.length !== headers.length);
  if (invalidRow) {
    throw new Error("The export data does not match the configured columns.");
  }

  const { Workbook } = await import("exceljs");
  const exportedAt = new Date();
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet(worksheetName.slice(0, 31), {
    properties: { defaultRowHeight: 20, tabColor: { argb: BRAND_RED } },
    pageSetup: {
      orientation: headers.length > 6 ? "landscape" : "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2,
      },
    },
    views: [{ showGridLines: false }],
  });

  workbook.creator = "iLabCICT";
  workbook.created = exportedAt;
  workbook.modified = exportedAt;
  workbook.subject = subject;
  workbook.title = title;

  worksheet.mergeCells(1, 1, 1, headers.length);
  const titleCell = worksheet.getCell(1, 1);
  titleCell.value = title;
  titleCell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 18 };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: BRAND_RED },
  };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getRow(1).height = 34;

  const exportMetadata: ExcelMetadata[] = [
    ...metadata,
    { label: "Total Records", value: rows.length },
    { label: "Exported", value: formatExcelDateTime(exportedAt.toISOString()) },
  ];
  const midpoint = Math.max(2, Math.ceil(headers.length / 2));
  const metadataRowCount = Math.ceil(exportMetadata.length / 2);

  for (let index = 0; index < exportMetadata.length; index += 1) {
    const entry = exportMetadata[index];
    const rowNumber = 3 + Math.floor(index / 2);
    const isRight = index % 2 === 1;
    const labelColumn = isRight ? midpoint + 1 : 1;
    const valueStart = labelColumn + 1;
    const valueEnd = isRight ? headers.length : midpoint;

    worksheet.getCell(rowNumber, labelColumn).value = entry.label;
    worksheet.getCell(rowNumber, labelColumn).font = {
      bold: true,
      color: { argb: BRAND_RED_DARK },
    };
    worksheet.getCell(rowNumber, labelColumn).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: BRAND_RED_LIGHT },
    };

    if (valueEnd >= valueStart) {
      worksheet.mergeCells(rowNumber, valueStart, rowNumber, valueEnd);
    }
    const valueCell = worksheet.getCell(rowNumber, valueStart);
    valueCell.value = entry.value;
    valueCell.alignment = { vertical: "middle", wrapText: true };
    worksheet.getRow(rowNumber).height = 24;
  }

  const tableRowNumber = 3 + metadataRowCount + 1;
  worksheet.addTable({
    name: createTableName(worksheetName),
    displayName: createTableName(worksheetName),
    ref: `A${tableRowNumber}`,
    headerRow: true,
    totalsRow: false,
    style: { theme: "TableStyleMedium2", showRowStripes: true },
    columns: headers.map((header) => ({ name: header, filterButton: true })),
    rows,
  });

  worksheet.views = [
    {
      state: "frozen",
      ySplit: tableRowNumber,
      topLeftCell: `A${tableRowNumber + 1}`,
      activeCell: `A${tableRowNumber + 1}`,
      showGridLines: false,
    },
  ];

  const headerRow = worksheet.getRow(tableRowNumber);
  headerRow.height = 34;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: BRAND_RED_DARK },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
  });

  for (
    let rowNumber = tableRowNumber + 1;
    rowNumber <= worksheet.rowCount;
    rowNumber += 1
  ) {
    const row = worksheet.getRow(rowNumber);
    row.height = 28;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = { vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: BORDER_COLOR } },
        left: { style: "thin", color: { argb: BORDER_COLOR } },
        bottom: { style: "thin", color: { argb: BORDER_COLOR } },
        right: { style: "thin", color: { argb: BORDER_COLOR } },
      };
    });
  }

  headers.forEach((header, index) => {
    worksheet.getColumn(index + 1).width =
      columnWidths[index] ?? Math.min(Math.max(header.length + 4, 14), 28);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([new Uint8Array(buffer)], { type: XLSX_MIME_TYPE });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = ensureXlsxExtension(filename);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(url);
};
