export interface ZipFile {
  name: string;
  data: Uint8Array<ArrayBuffer>;
}

const crc32 = (data: Uint8Array) => {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
};

// Store PNGs without recompressing their already-compressed image data.
export const createZip = (files: ZipFile[]) => {
  const contents: BlobPart[] = [];
  const directory: BlobPart[] = [];
  let offset = 0;
  let directorySize = 0;
  if (files.length > 65535) throw new Error("Too many files to export.");
  for (const file of files) {
    const name = new TextEncoder().encode(file.name);
    const crc = crc32(file.data);
    const header = new ArrayBuffer(30 + name.length);
    const local = new DataView(header);
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true);
    local.setUint16(12, 33, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, file.data.length, true);
    local.setUint32(22, file.data.length, true);
    local.setUint16(26, name.length, true);
    new Uint8Array(header, 30).set(name);
    contents.push(header, file.data);

    const record = new ArrayBuffer(46 + name.length);
    const central = new DataView(record);
    central.setUint32(0, 0x02014b50, true);
    central.setUint16(4, 20, true);
    central.setUint16(6, 20, true);
    central.setUint16(8, 0x0800, true);
    central.setUint16(14, 33, true);
    central.setUint32(16, crc, true);
    central.setUint32(20, file.data.length, true);
    central.setUint32(24, file.data.length, true);
    central.setUint16(28, name.length, true);
    central.setUint32(42, offset, true);
    new Uint8Array(record, 46).set(name);
    directory.push(record);
    directorySize += record.byteLength;
    offset += header.byteLength + file.data.length;
  }
  const end = new ArrayBuffer(22);
  const view = new DataView(end);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, files.length, true);
  view.setUint16(10, files.length, true);
  view.setUint32(12, directorySize, true);
  view.setUint32(16, offset, true);
  return new Blob([...contents, ...directory, end], { type: "application/zip" });
};
