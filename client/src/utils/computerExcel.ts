import type { Cell, Worksheet } from "exceljs";

import type { ComputerCardType } from "@/types/computer";

const WORKSHEET_NAME = "Computer Inventory";
const TABLE_NAME = "ComputerInventoryTable";
const TITLE = "iLabCICT Laboratory Computer Inventory";
const XLSX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const BRAND_RED = "FFBF3419";
const BRAND_RED_DARK = "FF8F2615";
const BRAND_RED_LIGHT = "FFFFF2EF";
const BORDER_COLOR = "FFD9DEE7";

export const COMPUTER_INVENTORY_HEADERS = [
  "Computer Code",
  "Operating System",
  "GPU",
  "CPU",
  "Motherboard",
  "RAM Installed (GB)",
  "Disk Installed (GB)",
  "Build Version",
  "Computer Status",
  "Monitor Status",
  "Mouse Status",
  "Keyboard Status",
  "UPS Status",
  "Laboratory",
  "Updated At",
  "Created At",
] as const;

const REQUIRED_IMPORT_HEADERS = [
  "CPU",
  "Operating System",
  "RAM Installed (GB)",
  "Disk Installed (GB)",
] as const;

const computerStatuses = ["active", "fixing", "broken"] as const;
const peripheralStatuses = ["active", "fixing", "broken", "none"] as const;

export type ComputerExcelImportRecord = {
  cpu: string;
  gpu: string;
  motherboard: string;
  ramSizeInstalled: number;
  diskSizeInstalled: number;
  operatingSystem: string;
  buildVersion: string;
  computerStatus: string;
  monitorStatus: string;
  mouseStatus: string;
  keyboardStatus: string;
  upsStatus: string;
};

type ComputerInventoryContext = {
  roomName: string;
  buildingName: string;
  floorNumber: number;
  computers: ComputerCardType[];
};

const normalizeHeader = (header: string) =>
  header.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const formatExportDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

const sanitizeFilenamePart = (value: string) =>
  value
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "Laboratory";

const getLocalDateStamp = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const toExcelDate = (value: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date;
};

const getCellText = (cell: Cell) => cell.text.trim();

const findInventoryHeader = (worksheets: Worksheet[]) => {
  const orderedWorksheets = [...worksheets].sort((first, second) => {
    if (first.name === WORKSHEET_NAME) return -1;
    if (second.name === WORKSHEET_NAME) return 1;
    return 0;
  });

  for (const worksheet of orderedWorksheets) {
    const finalRow = Math.min(worksheet.rowCount, 50);

    for (let rowNumber = 1; rowNumber <= finalRow; rowNumber += 1) {
      const row = worksheet.getRow(rowNumber);
      const headerIndexes = new Map<string, number>();

      row.eachCell({ includeEmpty: false }, (cell, columnNumber) => {
        headerIndexes.set(normalizeHeader(getCellText(cell)), columnNumber);
      });

      if (
        REQUIRED_IMPORT_HEADERS.every((header) =>
          headerIndexes.has(normalizeHeader(header))
        )
      ) {
        return { worksheet, rowNumber, headerIndexes };
      }
    }
  }

  return null;
};

const getRowValue = (
  worksheet: Worksheet,
  rowNumber: number,
  headerIndexes: Map<string, number>,
  header: string
) => {
  const columnNumber = headerIndexes.get(normalizeHeader(header));

  return columnNumber
    ? getCellText(worksheet.getRow(rowNumber).getCell(columnNumber))
    : "";
};

const parsePositiveNumber = (
  value: string,
  fieldName: string,
  rowNumber: number
) => {
  const number = Number(value.replace(/,/g, ""));

  if (!Number.isFinite(number) || number <= 0) {
    throw new Error(
      `Row ${rowNumber}: ${fieldName} must be a number greater than zero.`
    );
  }

  return number;
};

const normalizeStatus = (
  value: string,
  fieldName: string,
  allowedStatuses: readonly string[],
  fallback: string,
  rowNumber: number
) => {
  const status =
    value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ") ||
    fallback;

  if (!allowedStatuses.includes(status)) {
    throw new Error(
      `Row ${rowNumber}: ${fieldName} must be ${allowedStatuses.join(", ")}.`
    );
  }

  return status;
};

export const readComputerInventoryWorkbook = async (file: File) => {
  const { Workbook } = await import("exceljs");
  const workbook = new Workbook();

  try {
    await workbook.xlsx.load(await file.arrayBuffer());
  } catch {
    throw new Error("The selected file is not a valid Excel workbook.");
  }

  const inventoryHeader = findInventoryHeader(workbook.worksheets);

  if (!inventoryHeader) {
    throw new Error(
      `The workbook must include these columns: ${REQUIRED_IMPORT_HEADERS.join(", ")}.`
    );
  }

  const { worksheet, rowNumber: headerRowNumber, headerIndexes } =
    inventoryHeader;
  const records: ComputerExcelImportRecord[] = [];

  for (
    let rowNumber = headerRowNumber + 1;
    rowNumber <= worksheet.rowCount;
    rowNumber += 1
  ) {
    const rowValues = COMPUTER_INVENTORY_HEADERS.map((header) =>
      getRowValue(worksheet, rowNumber, headerIndexes, header)
    );

    if (rowValues.every((value) => value === "")) {
      continue;
    }

    const cpu = getRowValue(worksheet, rowNumber, headerIndexes, "CPU");
    const operatingSystem = getRowValue(
      worksheet,
      rowNumber,
      headerIndexes,
      "Operating System"
    );

    if (!cpu || !operatingSystem) {
      throw new Error(
        `Row ${rowNumber}: CPU and Operating System are required.`
      );
    }

    records.push({
      cpu,
      gpu: getRowValue(worksheet, rowNumber, headerIndexes, "GPU"),
      motherboard: getRowValue(
        worksheet,
        rowNumber,
        headerIndexes,
        "Motherboard"
      ),
      ramSizeInstalled: parsePositiveNumber(
        getRowValue(
          worksheet,
          rowNumber,
          headerIndexes,
          "RAM Installed (GB)"
        ),
        "RAM Installed (GB)",
        rowNumber
      ),
      diskSizeInstalled: parsePositiveNumber(
        getRowValue(
          worksheet,
          rowNumber,
          headerIndexes,
          "Disk Installed (GB)"
        ),
        "Disk Installed (GB)",
        rowNumber
      ),
      operatingSystem,
      buildVersion: getRowValue(
        worksheet,
        rowNumber,
        headerIndexes,
        "Build Version"
      ),
      computerStatus: normalizeStatus(
        getRowValue(
          worksheet,
          rowNumber,
          headerIndexes,
          "Computer Status"
        ),
        "Computer Status",
        computerStatuses,
        "active",
        rowNumber
      ),
      monitorStatus: normalizeStatus(
        getRowValue(worksheet, rowNumber, headerIndexes, "Monitor Status"),
        "Monitor Status",
        peripheralStatuses,
        "active",
        rowNumber
      ),
      mouseStatus: normalizeStatus(
        getRowValue(worksheet, rowNumber, headerIndexes, "Mouse Status"),
        "Mouse Status",
        peripheralStatuses,
        "active",
        rowNumber
      ),
      keyboardStatus: normalizeStatus(
        getRowValue(worksheet, rowNumber, headerIndexes, "Keyboard Status"),
        "Keyboard Status",
        peripheralStatuses,
        "active",
        rowNumber
      ),
      upsStatus: normalizeStatus(
        getRowValue(worksheet, rowNumber, headerIndexes, "UPS Status"),
        "UPS Status",
        peripheralStatuses,
        "active",
        rowNumber
      ),
    });
  }

  if (records.length === 0) {
    throw new Error("The Excel workbook does not contain computer records.");
  }

  return records;
};

export const exportComputerInventoryWorkbook = async ({
  roomName,
  buildingName,
  floorNumber,
  computers,
}: ComputerInventoryContext) => {
  if (computers.length === 0) {
    throw new Error("There are no computers to export.");
  }

  const { Workbook } = await import("exceljs");
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet(WORKSHEET_NAME, {
    properties: { defaultRowHeight: 20, tabColor: { argb: BRAND_RED } },
    pageSetup: {
      orientation: "landscape",
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
    views: [
      {
        state: "frozen",
        ySplit: 7,
        topLeftCell: "A8",
        activeCell: "A8",
        showGridLines: false,
      },
    ],
  });
  const exportedAt = new Date();

  workbook.creator = "iLabCICT";
  workbook.created = exportedAt;
  workbook.modified = exportedAt;
  workbook.subject = "Laboratory computer inventory";
  workbook.title = TITLE;

  worksheet.mergeCells("A1:P1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = TITLE;
  titleCell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 18 };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_RED } };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getRow(1).height = 34;

  const metadata = [
    ["Laboratory", roomName || "Not specified", "Building", buildingName || "Not specified"],
    ["Floor", floorNumber ? `Floor ${floorNumber}` : "Not specified", "Exported", formatExportDate(exportedAt)],
    ["Total Computers", computers.length, "System", "iLabCICT"],
  ];

  metadata.forEach((values, index) => {
    const rowNumber = index + 3;
    worksheet.mergeCells(rowNumber, 2, rowNumber, 6);
    worksheet.mergeCells(rowNumber, 8, rowNumber, 10);
    worksheet.mergeCells(rowNumber, 11, rowNumber, 16);
    worksheet.getCell(rowNumber, 1).value = values[0];
    worksheet.getCell(rowNumber, 2).value = values[1];
    worksheet.getCell(rowNumber, 8).value = values[2];
    worksheet.getCell(rowNumber, 11).value = values[3];

    [1, 8].forEach((columnNumber) => {
      const cell = worksheet.getCell(rowNumber, columnNumber);
      cell.font = { bold: true, color: { argb: BRAND_RED_DARK } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: BRAND_RED_LIGHT },
      };
      cell.alignment = { vertical: "middle" };
    });

    [2, 11].forEach((columnNumber) => {
      const cell = worksheet.getCell(rowNumber, columnNumber);
      cell.font = { color: { argb: "FF252932" } };
      cell.alignment = { vertical: "middle", wrapText: true };
    });

    worksheet.getRow(rowNumber).height = 24;
  });

  const rows = computers.map((computer) => [
    computer.computerCode,
    computer.operatingSystem,
    computer.gpu,
    computer.cpu,
    computer.motherboard,
    computer.ramSizeInstalled,
    computer.diskSizeInstalled,
    computer.buildVersion,
    computer.computerStatus,
    computer.monitorStatus,
    computer.mouseStatus,
    computer.keyboardStatus,
    computer.upsStatus,
    roomName,
    toExcelDate(computer.updatedAt),
    toExcelDate(computer.createdAt),
  ]);

  worksheet.addTable({
    name: TABLE_NAME,
    displayName: TABLE_NAME,
    ref: "A7",
    headerRow: true,
    totalsRow: false,
    style: {
      theme: "TableStyleMedium2",
      showRowStripes: true,
    },
    columns: COMPUTER_INVENTORY_HEADERS.map((header) => ({
      name: header,
      filterButton: true,
    })),
    rows,
  });

  const headerRow = worksheet.getRow(7);
  headerRow.height = 34;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: BRAND_RED_DARK },
    };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: BORDER_COLOR } },
      left: { style: "thin", color: { argb: BORDER_COLOR } },
      bottom: { style: "thin", color: { argb: BORDER_COLOR } },
      right: { style: "thin", color: { argb: BORDER_COLOR } },
    };
  });

  for (let rowNumber = 8; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    row.height = 30;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = { vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: BORDER_COLOR } },
        left: { style: "thin", color: { argb: BORDER_COLOR } },
        bottom: { style: "thin", color: { argb: BORDER_COLOR } },
        right: { style: "thin", color: { argb: BORDER_COLOR } },
      };

      if (rowNumber % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFAF8" },
        };
      }
    });
  }

  [6, 7].forEach((columnNumber) => {
    worksheet.getColumn(columnNumber).numFmt = "0";
    worksheet.getColumn(columnNumber).alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
  });
  [15, 16].forEach((columnNumber) => {
    worksheet.getColumn(columnNumber).numFmt = "mmm d, yyyy h:mm AM/PM";
  });

  const columnWidths = [
    20, 24, 30, 28, 28, 18, 19, 18, 18, 17, 17, 18, 15, 18, 23, 23,
  ];
  columnWidths.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = width;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([new Uint8Array(buffer)], { type: XLSX_MIME_TYPE });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = `iLabCICT_${sanitizeFilenamePart(roomName)}_Computers_${getLocalDateStamp(exportedAt)}.xlsx`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(url);
};
