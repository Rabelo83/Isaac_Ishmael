// Minimal reader for the two ESRI Shapefile geometry types Natural Earth uses here
// (Polyline = 3, Polygon = 5) plus their .dbf attribute tables. No dependencies.
// Format reference: ESRI Shapefile Technical Description (1998); dBASE III table format.
import { readFileSync } from 'node:fs';

export type Ring = [number, number][];
export interface ShapeRecord {
  type: 'Polygon' | 'Polyline';
  /** Polygon rings or polyline parts, as [longitude, latitude] pairs. */
  parts: Ring[];
  attributes: Record<string, string | number>;
}

function readShp(path: string): { type: 'Polygon' | 'Polyline'; parts: Ring[] }[] {
  const buf = readFileSync(path);
  if (buf.readInt32BE(0) !== 9994) throw new Error(`${path}: not a shapefile`);
  const fileType = buf.readInt32LE(32);
  if (fileType !== 3 && fileType !== 5) throw new Error(`${path}: unsupported shape type ${fileType}`);
  const out: { type: 'Polygon' | 'Polyline'; parts: Ring[] }[] = [];
  let off = 100;
  while (off < buf.length) {
    const contentBytes = buf.readInt32BE(off + 4) * 2;
    const c = off + 8;
    const shapeType = buf.readInt32LE(c);
    if (shapeType === 0) {
      out.push({ type: fileType === 5 ? 'Polygon' : 'Polyline', parts: [] });
    } else {
      const numParts = buf.readInt32LE(c + 36);
      const numPoints = buf.readInt32LE(c + 40);
      const partStarts = Array.from({ length: numParts }, (_, i) => buf.readInt32LE(c + 44 + i * 4));
      const pts = c + 44 + numParts * 4;
      const parts: Ring[] = partStarts.map((start, i) => {
        const end = i + 1 < numParts ? partStarts[i + 1] : numPoints;
        const ring: Ring = [];
        for (let p = start; p < end; p++) ring.push([buf.readDoubleLE(pts + p * 16), buf.readDoubleLE(pts + p * 16 + 8)]);
        return ring;
      });
      out.push({ type: shapeType === 5 ? 'Polygon' : 'Polyline', parts });
    }
    off = c + contentBytes;
  }
  return out;
}

function readDbf(path: string, encoding: BufferEncoding = 'utf8'): Record<string, string | number>[] {
  const buf = readFileSync(path);
  const count = buf.readUInt32LE(4);
  const headerLen = buf.readUInt16LE(8);
  const recordLen = buf.readUInt16LE(10);
  const fields: { name: string; type: string; len: number }[] = [];
  for (let off = 32; buf[off] !== 0x0d; off += 32) {
    fields.push({
      name: buf.toString('latin1', off, off + 11).replace(/\0.*$/, ''),
      type: String.fromCharCode(buf[off + 11]),
      len: buf[off + 16],
    });
  }
  const rows: Record<string, string | number>[] = [];
  for (let r = 0; r < count; r++) {
    let off = headerLen + r * recordLen + 1; // first byte is the deletion flag
    const row: Record<string, string | number> = {};
    for (const f of fields) {
      // Some tables pad text with NUL bytes rather than spaces.
      const raw = buf.toString(encoding, off, off + f.len).replaceAll('\0', '').trim();
      row[f.name.toLowerCase()] = (f.type === 'N' || f.type === 'F') && raw !== '' ? Number(raw) : raw;
      off += f.len;
    }
    rows.push(row);
  }
  return rows;
}

/** Reads `<base>.shp` and `<base>.dbf`; the .cpg file states the attribute encoding. */
export function readShapefile(base: string): ShapeRecord[] {
  let encoding: BufferEncoding = 'utf8';
  try {
    if (!/utf-?8/i.test(readFileSync(`${base}.cpg`, 'utf8'))) encoding = 'latin1';
  } catch {
    /* no .cpg: assume UTF-8, as Natural Earth 5.x ships */
  }
  const shapes = readShp(`${base}.shp`);
  const attrs = readDbf(`${base}.dbf`, encoding);
  if (shapes.length !== attrs.length) throw new Error(`${base}: ${shapes.length} shapes but ${attrs.length} attribute rows`);
  return shapes.map((s, i) => ({ ...s, attributes: attrs[i] }));
}
