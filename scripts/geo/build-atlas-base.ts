// Builds src/data/geo/east-med-base.json from official Natural Earth 1:10m shapefiles.
// Reproduce: see docs/tasks/010-atlas-preview.md ("Reproducing the geographic base").
//   node scripts/geo/build-atlas-base.ts --raw <folder with the four extracted layers and their zips>
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { arg } from '../args.ts';
import { centroid, clipLine, clipRing, ringArea, round, simplify, type BBox, type Point } from './geometry.ts';
import { readShapefile, type ShapeRecord } from './shapefile.ts';

const RAW = arg('raw');
const OUT = arg('out', 'src/data/geo/east-med-base.json')!;
if (!RAW) throw new Error('usage: node scripts/geo/build-atlas-base.ts --raw <dir>');

/** Study area: eastern Mediterranean, centred on the region the project researches. */
const BBOX: BBox = { west: 31.0, south: 28.5, east: 37.4, north: 34.0 };
const TOLERANCE = { land: 0.003, lake: 0.0015, river: 0.0015 }; // degrees (~150–330 m)
const DECIMALS = 4; // ~11 m

const BASE_URL = 'https://naciscdn.org/naturalearth/10m/physical/';
/** SHA-256 of the official zips as downloaded on 11 October 2026. A changed file fails the build. */
const LAYERS = {
  land: { file: 'ne_10m_land', sha256: 'e547d749445eaa0964aba76738090ec88f5e63c4585122170f98c67a7ea922dc' },
  lakes: { file: 'ne_10m_lakes', sha256: '0803a06f9c3cb4671d89b68c48b142aad9366ba40f665245e12a913fbc61722a' },
  rivers: { file: 'ne_10m_rivers_lake_centerlines', sha256: 'ded71b01870855ccfe19b51f2ec14c9bb48fae23c0e9f3c11974d426433b5c38' },
  marine: { file: 'ne_10m_geography_marine_polys', sha256: 'a2d3395904c41e718e02c3ec5bc988712164c524c236fad32d95d282ca303b2a' },
} as const;

/** Names left unlabelled in this first preview, with the reason shown to readers. */
const LABEL_OMIT: Record<string, { en: string; es: string }> = {
  'Gulf of Aqaba': {
    en: 'Label omitted: this gulf has more than one name in use (Gulf of Aqaba, Gulf of Eilat).',
    es: 'Etiqueta omitida: este golfo tiene más de un nombre en uso (golfo de Aqaba, golfo de Eilat).',
  },
};

const provenance = Object.fromEntries(
  Object.entries(LAYERS).map(([key, l]) => {
    const zip = readFileSync(join(RAW, `${l.file}.zip`));
    const sha = createHash('sha256').update(zip).digest('hex');
    if (sha !== l.sha256) throw new Error(`${l.file}.zip: SHA-256 ${sha} does not match the pinned ${l.sha256}`);
    const version = readFileSync(join(RAW, l.file, `${l.file}.VERSION.txt`), 'utf8').trim();
    return [key, { layer: l.file, version, url: `${BASE_URL}${l.file}.zip`, sha256: sha }];
  }),
);

const read = (key: keyof typeof LAYERS): ShapeRecord[] => {
  const f = LAYERS[key].file;
  return readShapefile(join(RAW, f, f));
};
const prep = (pts: Point[], tol: number) => round(simplify(pts, tol), DECIMALS);
const closed = (ring: Point[]): Point[] => [...ring, ring[0]];

// Land: filled polygons, plus coastlines as lines so the study-area edge is never drawn as coast.
const land: Point[][] = [];
const coast: Point[][] = [];
for (const r of read('land')) {
  for (const ring of r.parts) {
    const clipped = prep(clipRing(ring, BBOX), TOLERANCE.land);
    if (clipped.length >= 4 && ringArea(clipped) > 1e-5) land.push(clipped);
    for (const piece of clipLine(closed(ring), BBOX)) {
      const line = prep(piece, TOLERANCE.land);
      if (line.length > 1) coast.push(line);
    }
  }
}

interface Named {
  name_en: string;
  name_es: string;
  name_alt: string;
  featurecla: string;
  scalerank: number;
  ne_ids: number[];
  wikidata: string;
}
const attrs = (a: ShapeRecord['attributes']): Named => ({
  name_en: String(a.name_en || a.name || ''),
  name_es: String(a.name_es || ''),
  name_alt: String(a.name_alt || a.namealt || ''),
  featurecla: String(a.featurecla || ''),
  scalerank: Number(a.scalerank),
  ne_ids: [Number(a.ne_id)],
  wikidata: String(a.wikidataid || ''),
});
/** Group records sharing an English name (e.g. a river and its lake centreline). */
function group<T extends Named>(items: T[], merge: (into: T, from: T) => void): T[] {
  const byName = new Map<string, T>();
  const out: T[] = [];
  for (const it of items) {
    const prev = it.name_en ? byName.get(it.name_en) : undefined;
    if (prev) {
      merge(prev, it);
      prev.ne_ids.push(...it.ne_ids);
      prev.scalerank = Math.min(prev.scalerank, it.scalerank);
      if (!prev.name_alt) prev.name_alt = it.name_alt;
    } else {
      out.push(it);
      if (it.name_en) byName.set(it.name_en, it);
    }
  }
  return out;
}

const lakes = group(
  read('lakes').flatMap((r) => {
    const rings = r.parts.map((ring) => prep(clipRing(ring, BBOX), TOLERANCE.lake)).filter((x) => x.length >= 4);
    return rings.length ? [{ ...attrs(r.attributes), rings }] : [];
  }),
  (into, from) => into.rings.push(...from.rings),
);

const rivers = group(
  read('rivers').flatMap((r) => {
    const lines = r.parts.flatMap((part) => clipLine(part, BBOX)).map((l) => prep(l, TOLERANCE.river)).filter((l) => l.length > 1);
    return lines.length ? [{ ...attrs(r.attributes), lines }] : [];
  }),
  (into, from) => into.lines.push(...from.lines),
);

const marine = read('marine').flatMap((r) => {
  const rings = r.parts.map((ring) => clipRing(ring, BBOX)).filter((x) => x.length >= 3);
  if (!rings.length) return [];
  const a = attrs(r.attributes);
  const largest = rings.reduce((m, x) => (ringArea(x) > ringArea(m) ? x : m));
  const omit = LABEL_OMIT[a.name_en];
  return [{ ...a, label_at: round([centroid(largest)], DECIMALS)[0], label_omitted: omit ?? null }];
});

const doc = {
  description:
    'Modern physical geography of the eastern Mediterranean, clipped and simplified from Natural Earth 1:10m vectors for the atlas preview. Not a historical reconstruction; no boundaries.',
  source: {
    name: 'Natural Earth',
    homepage: 'https://www.naturalearthdata.com/',
    license: 'Public domain (https://www.naturalearthdata.com/about/terms-of-use/)',
    credit: 'Made with Natural Earth.',
    scale: '1:10m',
    accessed: '2026-10-11',
    layers: provenance,
  },
  processing: {
    script: 'scripts/geo/build-atlas-base.ts',
    bbox: BBOX,
    crs: 'WGS84 longitude/latitude (EPSG:4326), as in the source',
    clip: 'Sutherland–Hodgman (polygons), Liang–Barsky (lines) to bbox',
    simplify: { method: 'Douglas–Peucker', tolerance_degrees: TOLERANCE },
    decimals: DECIMALS,
    grouping: 'Records sharing an English name are merged (for example a river and its lake centreline).',
    label_points: 'Marine labels sit at the area-weighted centroid of the largest clipped polygon.',
  },
  land,
  coast,
  lakes,
  rivers,
  marine,
};

writeFileSync(OUT, `${JSON.stringify(doc)}\n`);
const pts = (x: unknown): number => (Array.isArray(x) ? (typeof x[0] === 'number' ? 1 : x.reduce((n: number, y) => n + pts(y), 0)) : 0);
console.log(
  `wrote ${OUT}: ${(JSON.stringify(doc).length / 1024).toFixed(1)} KB; land rings ${land.length} (${pts(land)} pts), coast lines ${coast.length}, lakes ${lakes.length}, rivers ${rivers.length}, marine ${marine.length}`,
);
