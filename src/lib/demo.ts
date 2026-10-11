// Public interface demonstration (Task 009; policy in docs/DEMO_POLICY.md).
// Invented data only, kept apart from test fixtures and research records.
import { readFileSync } from 'node:fs';
import { z } from 'astro/zod';
import { FIXTURE_TOKEN, type Locale } from './content/constants.ts';

export const DEMO_DATA = 'src/data/demo/timeline-map.json';

const text = z.strictObject({ en: z.string().min(1), es: z.string().min(1) });
const id = z.string().regex(/^[a-z]+(?:-[a-z0-9]+)*$/);
/** Years on an invented calendar; `approximate` renders as "c." */
const inventedDate = z.strictObject({
  from: z.number().int().positive(),
  to: z.number().int().positive().optional(),
  approximate: z.boolean().optional(),
});
const coordinate = z.number().min(0).max(100);

const geometry = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('point'), x: coordinate, y: coordinate }),
  z.strictObject({ type: z.literal('area'), cx: coordinate, cy: coordinate, rx: coordinate, ry: coordinate }),
  z.strictObject({ type: z.literal('rect'), x: coordinate, y: coordinate, w: coordinate, h: coordinate }),
  z.strictObject({ type: z.literal('line'), points: z.array(z.tuple([coordinate, coordinate])).min(2) }),
]);

export const demoSchema = z.strictObject({
  notice: text,
  view_box: z.tuple([z.number().positive(), z.number().positive()]),
  land: z.strictObject({ path: z.string().min(1), label: text }),
  layers: z.array(z.strictObject({ id, label: text, meaning: text })).min(1),
  uncertainty: z.array(z.strictObject({ id, label: text, description: text })).min(1),
  features: z
    .array(
      z.strictObject({
        id,
        layer: z.string(),
        geometry,
        title: text,
        summary: text,
        date: inventedDate,
        uncertainty: z.string(),
        /** An invented, clearly labelled example; never a real or project source record. */
        example_source: z.strictObject({ title: text, locator: text }),
      }),
    )
    .min(1),
  events: z.array(z.strictObject({ id, date: inventedDate, title: text, features: z.array(z.string()).min(1) })).min(1),
});
export type DemoData = z.infer<typeof demoSchema>;
export type InventedDate = z.infer<typeof inventedDate>;

/** Policy and cross-reference problems; empty when the data is acceptable. */
export function checkDemo(d: DemoData, raw: string): string[] {
  const problems: string[] = [];
  // The demonstration is not a test fixture: fixture data must never be published.
  if (raw.includes(FIXTURE_TOKEN)) problems.push(`demo data must not contain ${FIXTURE_TOKEN}`);
  const layers = new Set(d.layers.map((l) => l.id));
  const levels = new Set(d.uncertainty.map((u) => u.id));
  const features = new Set(d.features.map((f) => f.id));
  const ids = [...d.features.map((f) => f.id), ...d.events.map((e) => e.id)];
  if (new Set(ids).size !== ids.length) problems.push('duplicate feature or event id');
  for (const i of ids) if (!i.startsWith('demo-')) problems.push(`${i}: demo IDs must start with "demo-"`);
  for (const f of d.features) {
    if (!layers.has(f.layer)) problems.push(`${f.id}: unknown layer ${f.layer}`);
    if (!levels.has(f.uncertainty)) problems.push(`${f.id}: unknown uncertainty ${f.uncertainty}`);
    // Areas are only ever drawn as schematic extents, never as boundaries.
    if (f.geometry.type === 'area' && f.uncertainty !== 'schematic') problems.push(`${f.id}: areas must be schematic`);
    // Every example source must say it is invented, in both languages.
    if (!/invented/i.test(f.example_source.title.en) || !/inventad[oa]/i.test(f.example_source.title.es)) {
      problems.push(`${f.id}: example source titles must say "invented" / "inventado"`);
    }
  }
  for (const e of d.events) {
    for (const f of e.features) if (!features.has(f)) problems.push(`${e.id}: unknown feature ${f}`);
  }
  for (const [label, date] of [...d.features, ...d.events].map((x) => [x.id, x.date] as const)) {
    if (date.to !== undefined && date.to < date.from) problems.push(`${label}: date range ends before it starts`);
  }
  return problems;
}

export function loadDemo(): DemoData {
  const raw = readFileSync(DEMO_DATA, 'utf8');
  const data = demoSchema.parse(JSON.parse(raw));
  const problems = checkDemo(data, raw);
  if (problems.length) throw new Error(`demo data invalid:\n${problems.join('\n')}`);
  return data;
}

const YEAR: Record<Locale, string> = { en: 'Year', es: 'Año' };
const CIRCA: Record<Locale, string> = { en: 'c.', es: 'h.' };
const INVENTED: Record<Locale, string> = { en: 'invented calendar', es: 'calendario inventado' };

export function formatInventedDate(d: InventedDate, locale: Locale): string {
  const span = d.to !== undefined ? `${d.from}–${d.to}` : `${d.from}`;
  return `${d.approximate ? `${CIRCA[locale]} ` : ''}${YEAR[locale]} ${span} (${INVENTED[locale]})`;
}

export const DEMO_SLUG: Record<Locale, string> = { en: 'timeline-map', es: 'cronologia-mapa' };

export const DEMO_UI = {
  en: {
    navLabel: 'Interface demo',
    title: 'Timeline and map: interface demonstration',
    banner: 'Demonstration only. Everything on this page is invented to show how the interface works. It is not historical evidence.',
    lead: 'Choose an event on the timeline, a shape on the map, or a row in the table to see the example evidence behind it.',
    homeHeading: 'Try the interface',
    homeBody: 'A working demonstration of the planned timeline, map and evidence panel, using an invented island and calendar. It contains no historical claims.',
    homeLink: 'Open the timeline and map demonstration',
    layers: 'Layers',
    uncertainty: 'How certain is the location?',
    map: 'Schematic map',
    mapNote: 'An invented island drawn with simple shapes. No real geography or historical boundary is shown.',
    timeline: 'Timeline',
    timelineNote: 'Each mark is a dated example record. Nothing is shown for the years in between.',
    evidence: 'Example evidence',
    evidenceEmpty: 'Select an event, a map shape, or a table row to see its example source, locator, date and uncertainty.',
    table: 'All map features as a table',
    feature: 'Feature',
    layer: 'Layer',
    date: 'Date',
    certainty: 'Location certainty',
    source: 'Example source (invented)',
    locator: 'Locator',
    show: 'Show evidence',
    linkedFeatures: 'Features in this record',
    linkedEvents: 'On the timeline',
    status: 'Status',
    statusValue: 'Invented for this demonstration; not research',
    layerHidden: 'This layer is hidden. Turn it on under Layers to see it on the map.',
  },
  es: {
    navLabel: 'Demostración',
    title: 'Cronología y mapa: demostración de la interfaz',
    banner: 'Solo es una demostración. Todo lo que aparece en esta página es inventado para mostrar cómo funciona la interfaz. No es prueba histórica.',
    lead: 'Elija un evento en la cronología, una forma en el mapa o una fila de la tabla para ver las pruebas de ejemplo que lo respaldan.',
    homeHeading: 'Pruebe la interfaz',
    homeBody: 'Una demostración funcional de la cronología, el mapa y el panel de pruebas previstos, con una isla y un calendario inventados. No contiene afirmaciones históricas.',
    homeLink: 'Abrir la demostración de cronología y mapa',
    layers: 'Capas',
    uncertainty: '¿Qué certeza hay sobre la ubicación?',
    map: 'Mapa esquemático',
    mapNote: 'Una isla inventada dibujada con formas simples. No se muestra geografía real ni ninguna frontera histórica.',
    timeline: 'Cronología',
    timelineNote: 'Cada marca es un registro de ejemplo fechado. No se muestra nada para los años intermedios.',
    evidence: 'Pruebas de ejemplo',
    evidenceEmpty: 'Seleccione un evento, una forma del mapa o una fila de la tabla para ver su fuente de ejemplo, localizador, fecha e incertidumbre.',
    table: 'Todos los elementos del mapa en una tabla',
    feature: 'Elemento',
    layer: 'Capa',
    date: 'Fecha',
    certainty: 'Certeza de la ubicación',
    source: 'Fuente de ejemplo (inventada)',
    locator: 'Localizador',
    show: 'Ver pruebas',
    linkedFeatures: 'Elementos de este registro',
    linkedEvents: 'En la cronología',
    status: 'Estado',
    statusValue: 'Inventado para esta demostración; no es investigación',
    layerHidden: 'Esta capa está oculta. Actívela en Capas para verla en el mapa.',
  },
} as const;
