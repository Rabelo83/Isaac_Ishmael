import { statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ATLAS_DATA, displayName, loadAtlas, projection } from '../src/lib/atlas.ts';
import { clipLine, clipRing, round, simplify, type Point } from '../scripts/geo/geometry.ts';

const atlas = loadAtlas();
const bbox = atlas.processing.bbox;

describe('geometry helpers', () => {
  const box = { west: 0, south: 0, east: 10, north: 10 };
  it('clips a polygon to the box', () => {
    const square: Point[] = [[-5, -5], [5, -5], [5, 5], [-5, 5]];
    const out = clipRing(square, box);
    expect(out.every(([x, y]) => x >= 0 && x <= 10 && y >= 0 && y <= 10)).toBe(true);
    expect(out).toContainEqual([5, 5]);
    expect(clipRing([[20, 20], [30, 20], [30, 30]], box)).toEqual([]);
  });
  it('clips a line into the pieces inside the box', () => {
    const pieces = clipLine([[-5, 5], [5, 5], [15, 5], [15, 8], [5, 8]], box);
    expect(pieces).toEqual([
      [[0, 5], [5, 5], [10, 5]],
      [[10, 8], [5, 8]],
    ]);
  });
  it('simplifies within tolerance and rounds without duplicate points', () => {
    expect(simplify([[0, 0], [1, 0.0001], [2, 0]], 0.01)).toEqual([[0, 0], [2, 0]]);
    expect(simplify([[0, 0], [1, 1], [2, 0]], 0.01)).toHaveLength(3);
    expect(round([[0.00001, 0], [0.00002, 0], [1.23456, 2]], 4)).toEqual([[0, 0], [1.2346, 2]]);
  });
});

describe('atlas base data (Natural Earth)', () => {
  it('records its public-domain source, versions and pinned hashes', () => {
    expect(atlas.source.name).toBe('Natural Earth');
    expect(atlas.source.license).toMatch(/^Public domain/);
    expect(atlas.source.scale).toBe('1:10m');
    for (const l of Object.values(atlas.source.layers)) {
      expect(l.url).toMatch(/^https:\/\/naciscdn\.org\/naturalearth\/10m\/physical\/ne_10m_[a-z_]+\.zip$/);
      expect(l.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(l.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(l.file_date).toMatch(/^20\d\d-\d\d-\d\d$/);
    }
  });

  it('contains physical layers only: no boundaries, places or claims', () => {
    const keys = Object.keys(atlas).filter((k) => !['description', 'source', 'processing'].includes(k)).sort();
    expect(keys).toEqual(['coast', 'lakes', 'land', 'marine', 'rivers']);
    // Feature content only (the description itself says "no boundaries").
    const features = JSON.stringify({ lakes: atlas.lakes, rivers: atlas.rivers, marine: atlas.marine });
    expect(features).not.toMatch(/admin|boundar|populated|countr|disputed/i);
  });

  it('keeps every coordinate inside the study area and stays compact', () => {
    const pts: [number, number][] = [
      ...atlas.land.flat(),
      ...atlas.coast.flat(),
      ...atlas.lakes.flatMap((l) => l.rings.flat()),
      ...atlas.rivers.flatMap((r) => r.lines.flat()),
      ...atlas.marine.map((m) => m.label_at),
    ];
    for (const [x, y] of pts) {
      expect(x).toBeGreaterThanOrEqual(bbox.west);
      expect(x).toBeLessThanOrEqual(bbox.east);
      expect(y).toBeGreaterThanOrEqual(bbox.south);
      expect(y).toBeLessThanOrEqual(bbox.north);
    }
    expect(statSync(ATLAS_DATA).size).toBeLessThan(60_000);
  });

  it('includes the expected features with names in both languages', () => {
    const names = (xs: { name_en: string; name_es: string }[]) => xs.map((x) => `${x.name_en}/${x.name_es}`);
    expect(names(atlas.lakes)).toEqual(expect.arrayContaining(['Dead Sea/mar Muerto', 'Sea of Galilee/mar de Galilea']));
    expect(names(atlas.rivers)).toContain('Jordan/Jordán');
    expect(names(atlas.marine)).toContain('Mediterranean Sea/Mediterráneo');
  });

  it('omits the label of a feature with more than one name in use, and says why', () => {
    const aqaba = atlas.marine.find((m) => m.name_en === 'Gulf of Aqaba')!;
    expect(aqaba.label_omitted?.en).toMatch(/more than one name/);
    expect(aqaba.label_omitted?.es).toMatch(/más de un nombre/);
  });
});

describe('display names and projection', () => {
  it('never shows a river name that could be read as a state', () => {
    const jordan = atlas.rivers.find((r) => r.name_en === 'Jordan')!;
    expect(displayName('river', jordan, 'en')).toBe('Jordan River');
    expect(displayName('river', jordan, 'es')).toBe('río Jordán');
    const med = atlas.marine.find((m) => m.name_en === 'Mediterranean Sea')!;
    expect(displayName('sea', med, 'es')).toBe('mar Mediterráneo');
  });
  it('projects the study area into a 1000-unit-wide frame', () => {
    const p = projection(bbox);
    expect(p.project([bbox.west, bbox.north])).toEqual([0, 0]);
    expect(p.project([bbox.east, bbox.south])[0]).toBeCloseTo(1000, 0);
    expect(p.kmPerUnit).toBeGreaterThan(0.5);
    expect(p.kmPerUnit).toBeLessThan(0.7);
  });
});
