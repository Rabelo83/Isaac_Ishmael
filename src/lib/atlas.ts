// Atlas preview (Task 010): modern physical geography only, from Natural Earth.
// Generated in local preview builds only; never in production (see the page's getStaticPaths).
import { readFileSync } from 'node:fs';
import type { Locale } from './content/constants.ts';

export const ATLAS_DATA = 'src/data/geo/east-med-base.json';

type Pt = [number, number];
interface Named {
  name_en: string;
  name_es: string;
  name_alt: string;
  featurecla: string;
  scalerank: number;
  ne_ids: number[];
  wikidata: string;
}
export interface AtlasBase {
  source: {
    name: string;
    homepage: string;
    license: string;
    credit: string;
    scale: string;
    accessed: string;
    layers: Record<string, { layer: string; version: string; url: string; sha256: string }>;
  };
  processing: { bbox: { west: number; south: number; east: number; north: number } };
  land: Pt[][];
  coast: Pt[][];
  lakes: (Named & { rings: Pt[][] })[];
  rivers: (Named & { lines: Pt[][] })[];
  marine: (Named & { label_at: Pt; label_omitted: { en: string; es: string } | null })[];
}

export function loadAtlas(): AtlasBase {
  return JSON.parse(readFileSync(ATLAS_DATA, 'utf8')) as AtlasBase;
}

/**
 * Equirectangular projection with longitude scaled by cos(central latitude). Over this
 * small extent (about 6.4° by 5.5°) the distortion is a few percent, which suits a
 * reading map; it is not a survey projection.
 */
export function projection(b: AtlasBase['processing']['bbox'], width = 1000) {
  const lat0 = ((b.south + b.north) / 2) * (Math.PI / 180);
  const k = width / ((b.east - b.west) * Math.cos(lat0));
  const height = (b.north - b.south) * k;
  const project = ([lon, lat]: Pt): Pt => [
    Math.round((lon - b.west) * Math.cos(lat0) * k * 10) / 10,
    Math.round((b.north - lat) * k * 10) / 10,
  ];
  /** Kilometres per projected unit at the central latitude (1° latitude ≈ 111.32 km). */
  const kmPerUnit = 111.32 / k;
  return { project, width, height, kmPerUnit, lat0 };
}

export const pathOf = (rings: Pt[][], project: (p: Pt) => Pt, close: boolean) =>
  rings.map((r) => `M${r.map((p) => project(p).join(',')).join('L')}${close ? 'Z' : ''}`).join('');

export type FeatureKind = 'sea' | 'gulf' | 'lake' | 'river' | 'canal';

/**
 * Display names derive from Natural Earth's own names. Where a bare name could be
 * mistaken for something else, the feature type is added (for example "Jordan" becomes
 * "Jordan River", so it cannot be read as the state).
 */
export function displayName(kind: FeatureKind, f: Named, locale: Locale): string {
  const en = f.name_en;
  const es = f.name_es || f.name_en;
  if (kind === 'river' && !/branch|river/i.test(en)) return locale === 'en' ? `${en} River` : `río ${es}`;
  if (kind === 'lake' && !/lake|sea/i.test(en)) return locale === 'en' ? `${en} Lake` : `lago ${es}`;
  if (kind === 'sea' && locale === 'es' && !/^mar /i.test(es)) return `mar ${es}`;
  return locale === 'en' ? en : es;
}

export function kindOf(layer: 'lakes' | 'rivers' | 'marine', f: Named): FeatureKind {
  if (layer === 'lakes') return 'lake';
  if (layer === 'marine') return f.featurecla === 'gulf' ? 'gulf' : 'sea';
  return /canal/i.test(f.name_en) ? 'canal' : 'river';
}

export const ATLAS_UI = {
  en: {
    navLabel: 'Atlas preview',
    title: 'Atlas preview: the eastern Mediterranean',
    lead: 'A geographic base for future maps: today’s coastlines, lakes and rivers around the region this project studies.',
    notice:
      'This is a modern geographic base, not a historical reconstruction. It shows coastlines, lakes and rivers as mapped today by Natural Earth at 1:10m scale. Coastlines, lake levels and river courses have changed over time. No borders, territorial claims, settlements or historical events are shown.',
    localOnly: 'Local preview only. This page is not part of the published site.',
    map: 'Map',
    mapHelp: 'Drag or use the arrow keys to move, the mouse wheel or + and − to zoom, and 0 to reset. Select a named feature to see its details.',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    reset: 'Reset view',
    details: 'Feature details',
    detailsEmpty: 'Select a sea, lake or river on the map, or use “Show on map” in the table.',
    table: 'Named features (text alternative)',
    name: 'Name',
    otherName: 'Other name in the data',
    type: 'Type',
    layer: 'Natural Earth layer',
    ids: 'Natural Earth feature ID',
    show: 'Show on map',
    labelOmitted: 'Label omitted',
    kinds: { sea: 'Sea', gulf: 'Gulf', lake: 'Lake', river: 'River', canal: 'Canal' },
    attributionHeading: 'Geographic source',
    attribution: 'Geography: Made with Natural Earth. Public-domain 1:10m physical vectors',
    accessed: 'downloaded',
    scale: 'Scale at 31.25° N',
    km: 'km',
    north: 'N',
    processing: 'How this base was prepared',
    processingBody:
      'The official Natural Earth files were checked against recorded SHA-256 hashes, clipped to 31.0–37.4° E and 28.5–34.0° N, and simplified (tolerances of about 150–330 m) with a script in this repository. Nothing was added by hand.',
  },
  es: {
    navLabel: 'Vista previa del atlas',
    title: 'Vista previa del atlas: el Mediterráneo oriental',
    lead: 'Una base geográfica para futuros mapas: las costas, lagos y ríos actuales de la región que estudia este proyecto.',
    notice:
      'Es una base geográfica moderna, no una reconstrucción histórica. Muestra las costas, los lagos y los ríos tal como los cartografía hoy Natural Earth a escala 1:10m. Las costas, el nivel de los lagos y el curso de los ríos han cambiado con el tiempo. No se muestran fronteras, reclamaciones territoriales, asentamientos ni acontecimientos históricos.',
    localOnly: 'Solo vista previa local. Esta página no forma parte del sitio publicado.',
    map: 'Mapa',
    mapHelp: 'Arrastre o use las flechas para desplazarse, la rueda del ratón o + y − para acercar o alejar, y 0 para restablecer. Seleccione un elemento con nombre para ver sus detalles.',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    reset: 'Restablecer vista',
    details: 'Detalles del elemento',
    detailsEmpty: 'Seleccione un mar, lago o río en el mapa, o use «Ver en el mapa» en la tabla.',
    table: 'Elementos con nombre (alternativa textual)',
    name: 'Nombre',
    otherName: 'Otro nombre en los datos',
    type: 'Tipo',
    layer: 'Capa de Natural Earth',
    ids: 'ID del elemento en Natural Earth',
    show: 'Ver en el mapa',
    labelOmitted: 'Etiqueta omitida',
    kinds: { sea: 'Mar', gulf: 'Golfo', lake: 'Lago', river: 'Río', canal: 'Canal' },
    attributionHeading: 'Fuente geográfica',
    attribution: 'Geografía: hecho con Natural Earth. Vectores físicos 1:10m de dominio público',
    accessed: 'descargados el',
    scale: 'Escala a 31,25° N',
    km: 'km',
    north: 'N',
    processing: 'Cómo se preparó esta base',
    processingBody:
      'Los archivos oficiales de Natural Earth se verificaron con sus hashes SHA-256 registrados, se recortaron a 31,0–37,4° E y 28,5–34,0° N, y se simplificaron (tolerancias de unos 150–330 m) con un script de este repositorio. No se añadió nada a mano.',
  },
} as const;
