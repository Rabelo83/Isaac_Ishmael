// Atlas (Tasks 010–011): physical geography only, from public-domain Natural Earth data.
// Published with the owner's approval in Task 011.
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
    scale_denominator: number;
    accessed: string;
    layers: Record<string, { layer: string; version: string; file_date: string; url: string; sha256: string }>;
  };
  processing: {
    bbox: { west: number; south: number; east: number; north: number };
    simplify: { method: string; tolerance_degrees: Record<string, number> };
    decimals: number;
    script: string;
  };
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
    navLabel: 'Atlas',
    title: 'Atlas: the eastern Mediterranean',
    lead: 'A geographic base for the project’s future maps: coastlines, lakes and rivers around the region it studies, as represented in Natural Earth’s physical map data.',
    baseNotice:
      'Geographic base map. It shows physical geography only. It is not historical evidence and draws no borders, territorial claims or settlements.',
    notice:
      'Not a historical reconstruction. Coastlines, lakes and rivers are drawn as represented in the cited Natural Earth data versions, not as they were in any historical period. Coastlines, lake levels and river courses have changed over time.',
    homeHeading: 'Atlas',
    homeBody:
      'A geographic base map of the eastern Mediterranean, built from public-domain Natural Earth data. It shows physical geography only, with no borders or historical claims.',
    homeLink: 'Open the atlas',
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
    show: 'Show on map',
    labelOmitted: 'Label omitted',
    kinds: { sea: 'Sea', gulf: 'Gulf', lake: 'Lake', river: 'River', canal: 'Canal' },
    sourceHeading: 'Source and limits',
    attribution: 'Geography: Made with Natural Earth (public domain).',
    dataVersions: 'Data versions',
    dataVersionsValue: 'Natural Earth 1:10m physical vectors',
    fileDates: 'Data file dates',
    fileDatesNote: 'dates of the files on Natural Earth’s download server, not survey dates of the features',
    downloaded: 'Downloaded for this project',
    scaleLabel: 'Scale of the source data',
    scaleValue: '1:10,000,000',
    scaleNote: 'Regional detail: suitable for an overview of the region, not for local, parcel-level or legal precision.',
    scaleBar: 'Scale bar at 31.25° N',
    km: 'km',
    north: 'N',
    technical: 'Technical details',
    technicalIntro:
      'The official Natural Earth files were checked against the SHA-256 hashes below, clipped to the study area and simplified with a script in this repository. Nothing was drawn by hand.',
    studyArea: 'Study area',
    simplification: 'Simplification tolerance',
    precision: 'Coordinate precision',
    decimals: 'decimal places',
    script: 'Processing script',
    file: 'File',
    version: 'Version',
    fileDate: 'File date',
    sha: 'SHA-256 of the downloaded zip',
    featureIds: 'Natural Earth feature IDs',
  },
  es: {
    navLabel: 'Atlas',
    title: 'Atlas: el Mediterráneo oriental',
    lead: 'Una base geográfica para los futuros mapas del proyecto: costas, lagos y ríos de la región que estudia, tal como figuran en los datos cartográficos físicos de Natural Earth.',
    baseNotice:
      'Mapa base geográfico. Solo muestra geografía física. No es prueba histórica y no traza fronteras, reclamaciones territoriales ni asentamientos.',
    notice:
      'No es una reconstrucción histórica. Las costas, los lagos y los ríos se dibujan tal como figuran en las versiones citadas de los datos de Natural Earth, no como eran en ningún período histórico. Las costas, el nivel de los lagos y el curso de los ríos han cambiado con el tiempo.',
    homeHeading: 'Atlas',
    homeBody:
      'Un mapa base geográfico del Mediterráneo oriental, elaborado con datos de dominio público de Natural Earth. Solo muestra geografía física, sin fronteras ni afirmaciones históricas.',
    homeLink: 'Abrir el atlas',
    map: 'Mapa',
    mapHelp:
      'Arrastre o use las flechas para desplazarse, la rueda del ratón o + y − para acercar o alejar, y 0 para restablecer. Seleccione un elemento con nombre para ver sus detalles.',
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
    show: 'Ver en el mapa',
    labelOmitted: 'Etiqueta omitida',
    kinds: { sea: 'Mar', gulf: 'Golfo', lake: 'Lago', river: 'Río', canal: 'Canal' },
    sourceHeading: 'Fuente y límites',
    attribution: 'Geografía: hecho con Natural Earth (dominio público).',
    dataVersions: 'Versiones de los datos',
    dataVersionsValue: 'Vectores físicos 1:10m de Natural Earth',
    fileDates: 'Fechas de los archivos',
    fileDatesNote: 'fechas de los archivos en el servidor de descarga de Natural Earth, no fechas de levantamiento de los elementos',
    downloaded: 'Descargados para este proyecto',
    scaleLabel: 'Escala de los datos de origen',
    scaleValue: '1:10 000 000',
    scaleNote: 'Detalle regional: sirve para una vista general de la región, no para precisión local, parcelaria ni jurídica.',
    scaleBar: 'Barra de escala a 31,25° N',
    km: 'km',
    north: 'N',
    technical: 'Detalles técnicos',
    technicalIntro:
      'Los archivos oficiales de Natural Earth se verificaron con los hashes SHA-256 indicados abajo, se recortaron al área de estudio y se simplificaron con un script de este repositorio. No se dibujó nada a mano.',
    studyArea: 'Área de estudio',
    simplification: 'Tolerancia de simplificación',
    precision: 'Precisión de las coordenadas',
    decimals: 'decimales',
    script: 'Script de procesamiento',
    file: 'Archivo',
    version: 'Versión',
    fileDate: 'Fecha del archivo',
    sha: 'SHA-256 del zip descargado',
    featureIds: 'ID de los elementos en Natural Earth',
  },
} as const;
