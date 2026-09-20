import type { Cell, Worksheet } from "exceljs";

const WORKSHEET_NAME = "Laboratories";
const requiredHeaders = [
  "Room Name",
  "Floor Number",
  "Building Name",
  "Status",
] as const;

export type RoomExcelRecord = Record<(typeof requiredHeaders)[number], string> & {
  "Assigned Custodian ID": string;
  "Assigned Technician ID": string;
};

const normalizeHeader = (header: string) =>
  header.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const getCellText = (cell: Cell) => cell.text.trim();

const findHeaderRow = (worksheets: Worksheet[]) => {
  const orderedWorksheets = [...worksheets].sort((first, second) => {
    if (first.name === WORKSHEET_NAME) return -1;
    if (second.name === WORKSHEET_NAME) return 1;
    return 0;
  });

  for (const worksheet of orderedWorksheets) {
    const finalRow = Math.min(worksheet.rowCount, 50);

    for (let rowNumber = 1; rowNumber <= finalRow; rowNumber += 1) {
      const headerIndexes = new Map<string, number>();
      worksheet
        .getRow(rowNumber)
        .eachCell({ includeEmpty: false }, (cell, columnNumber) => {
          headerIndexes.set(normalizeHeader(getCellText(cell)), columnNumber);
        });

      if (
        requiredHeaders.every((header) =>
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

export const readRoomWorkbook = async (file: File) => {
  const { Workbook } = await import("exceljs");
  const workbook = new Workbook();

  try {
    await workbook.xlsx.load(await file.arrayBuffer());
  } catch {
    throw new Error("The selected file is not a valid Excel workbook.");
  }

  const header = findHeaderRow(workbook.worksheets);
  if (!header) {
    throw new Error(
      `The workbook must include these columns: ${requiredHeaders.join(", ")}.`
    );
  }

  const records: RoomExcelRecord[] = [];
  const { worksheet, rowNumber: headerRowNumber, headerIndexes } = header;

  for (
    let rowNumber = headerRowNumber + 1;
    rowNumber <= worksheet.rowCount;
    rowNumber += 1
  ) {
    const values = requiredHeaders.map((column) =>
      getRowValue(worksheet, rowNumber, headerIndexes, column)
    );
    if (values.every((value) => value === "")) {
      continue;
    }

    records.push({
      "Room Name": getRowValue(
        worksheet,
        rowNumber,
        headerIndexes,
        "Room Name"
      ),
      "Floor Number": getRowValue(
        worksheet,
        rowNumber,
        headerIndexes,
        "Floor Number"
      ),
      "Building Name": getRowValue(
        worksheet,
        rowNumber,
        headerIndexes,
        "Building Name"
      ),
      Status: getRowValue(worksheet, rowNumber, headerIndexes, "Status"),
      "Assigned Custodian ID": getRowValue(
        worksheet,
        rowNumber,
        headerIndexes,
        "Assigned Custodian ID"
      ),
      "Assigned Technician ID": getRowValue(
        worksheet,
        rowNumber,
        headerIndexes,
        "Assigned Technician ID"
      ),
    });
  }

  if (records.length === 0) {
    throw new Error("The Excel workbook does not contain room records.");
  }

  return records;
};
