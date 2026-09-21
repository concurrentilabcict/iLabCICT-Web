import type { Cell, Worksheet } from "exceljs";

import type { ComputerCardType } from "@/types/computer";
import {
  exportTablePdf,
  formatPdfDateTime,
  getLocalDateStamp,
} from "@/utils/tabularPdf";

const WORKSHEET_NAME = "Computer Inventory";

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

const sanitizeFilenamePart = (value: string) =>
  value
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "Laboratory";

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

export const exportComputerInventoryPdf = ({
  roomName,
  buildingName,
  floorNumber,
  computers,
}: ComputerInventoryContext) => {
  if (computers.length === 0) {
    throw new Error("There are no computers to export.");
  }

  const exportedAt = new Date();
  exportTablePdf({
    title: "iLabCICT Laboratory Computer Inventory",
    subject: "Laboratory computer inventory export",
    filename: `iLabCICT_${sanitizeFilenamePart(roomName)}_Computers_${getLocalDateStamp(exportedAt)}.pdf`,
    headers: [...COMPUTER_INVENTORY_HEADERS],
    rows: computers.map((computer) => [
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
      formatPdfDateTime(computer.updatedAt),
      formatPdfDateTime(computer.createdAt),
    ]),
    columnWidths: [
      20, 24, 30, 28, 28, 18, 19, 18, 18, 17, 17, 18, 15, 18, 23, 23,
    ],
    metadata: [
      { label: "Laboratory", value: roomName || "Not specified" },
      { label: "Building", value: buildingName || "Not specified" },
      {
        label: "Floor",
        value: floorNumber ? `Floor ${floorNumber}` : "Not specified",
      },
    ],
    orientation: "landscape",
  });
};
