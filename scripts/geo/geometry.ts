// Small, dependency-free geometry helpers for preparing the atlas base layer.
// Coordinates are [longitude, latitude] in WGS84 degrees.

export type Point = [number, number];
export interface BBox { west: number; south: number; east: number; north: number }

/** Sutherland–Hodgman clip of one polygon ring to a rectangle. Returns [] if nothing remains. */
export function clipRing(ring: Point[], b: BBox): Point[] {
  const edges: [(p: Point) => boolean, (a: Point, c: Point) => Point][] = [
    [(p) => p[0] >= b.west, (a, c) => lerpX(a, c, b.west)],
    [(p) => p[0] <= b.east, (a, c) => lerpX(a, c, b.east)],
    [(p) => p[1] >= b.south, (a, c) => lerpY(a, c, b.south)],
    [(p) => p[1] <= b.north, (a, c) => lerpY(a, c, b.north)],
  ];
  let out = ring;
  for (const [inside, cut] of edges) {
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i];
      const prev = input[(i + input.length - 1) % input.length];
      if (inside(cur)) {
        if (!inside(prev)) out.push(cut(prev, cur));
        out.push(cur);
      } else if (inside(prev)) {
        out.push(cut(prev, cur));
      }
    }
    if (out.length === 0) return [];
  }
  return out.length >= 3 ? out : [];
}

/** Clip a polyline to a rectangle; returns the pieces that lie inside. */
export function clipLine(line: Point[], b: BBox): Point[][] {
  const pieces: Point[][] = [];
  let current: Point[] = [];
  for (let i = 1; i < line.length; i++) {
    const seg = clipSegment(line[i - 1], line[i], b);
    if (!seg) {
      if (current.length > 1) pieces.push(current);
      current = [];
      continue;
    }
    const [a, c] = seg;
    if (current.length === 0 || !samePoint(current[current.length - 1], a)) {
      if (current.length > 1) pieces.push(current);
      current = [a];
    }
    current.push(c);
  }
  if (current.length > 1) pieces.push(current);
  return pieces;
}

/** Liang–Barsky segment clipping. */
function clipSegment(a: Point, c: Point, b: BBox): [Point, Point] | null {
  const dx = c[0] - a[0];
  const dy = c[1] - a[1];
  let t0 = 0;
  let t1 = 1;
  for (const [p, q] of [
    [-dx, a[0] - b.west],
    [dx, b.east - a[0]],
    [-dy, a[1] - b.south],
    [dy, b.north - a[1]],
  ]) {
    if (p === 0) {
      if (q < 0) return null;
    } else {
      const r = q / p;
      if (p < 0) t0 = Math.max(t0, r);
      else t1 = Math.min(t1, r);
      if (t0 > t1) return null;
    }
  }
  return [
    [a[0] + t0 * dx, a[1] + t0 * dy],
    [a[0] + t1 * dx, a[1] + t1 * dy],
  ];
}

/** Douglas–Peucker simplification with a tolerance in degrees. Keeps both endpoints. */
export function simplify(points: Point[], tolerance: number): Point[] {
  if (points.length <= 2) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop()!;
    let maxDist = 0;
    let index = -1;
    for (let i = first + 1; i < last; i++) {
      const d = segmentDistance(points[i], points[first], points[last]);
      if (d > maxDist) [maxDist, index] = [d, i];
    }
    if (index >= 0 && maxDist > tolerance) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

export function round(points: Point[], decimals: number): Point[] {
  const f = 10 ** decimals;
  const out: Point[] = [];
  for (const [x, y] of points) {
    const p: Point = [Math.round(x * f) / f, Math.round(y * f) / f];
    if (!out.length || !samePoint(out[out.length - 1], p)) out.push(p);
  }
  return out;
}

/** Area-weighted centroid of a ring (planar, in degrees; adequate for label placement). */
export function centroid(ring: Point[]): Point {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[(i + 1) % ring.length];
    const f = x0 * y1 - x1 * y0;
    a += f;
    cx += (x0 + x1) * f;
    cy += (y0 + y1) * f;
  }
  return a === 0 ? ring[0] : [cx / (3 * a), cy / (3 * a)];
}

export function ringArea(ring: Point[]): number {
  let a = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[(i + 1) % ring.length];
    a += x0 * y1 - x1 * y0;
  }
  return Math.abs(a / 2);
}

function segmentDistance(p: Point, a: Point, b: Point): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}
const lerpX = (a: Point, c: Point, x: number): Point => [x, a[1] + ((c[1] - a[1]) * (x - a[0])) / (c[0] - a[0])];
const lerpY = (a: Point, c: Point, y: number): Point => [a[0] + ((c[0] - a[0]) * (y - a[1])) / (c[1] - a[1]), y];
const samePoint = (a: Point, b: Point) => a[0] === b[0] && a[1] === b[1];
