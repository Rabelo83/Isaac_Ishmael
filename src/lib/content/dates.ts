import type { DateEndpoint, DateValue } from './schemas.ts';
import type { Locale } from './constants.ts';

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Sortable key using astronomical numbering internally (1 BCE = 0). */
export function endpointKey(e: DateEndpoint): [number, number, number] {
  const year = e.era === 'CE' ? e.year : 1 - e.year;
  return [year, e.month ?? 0, e.day ?? 0];
}

function compareKeys(a: [number, number, number], b: [number, number, number]): number {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

/** Returns human-readable problems; empty when the date is coherent. */
export function checkDate(value: DateValue): string[] {
  if (value.kind === 'unknown') return [];
  const problems: string[] = [];
  const endpoints = value.kind === 'range' ? [value.start, value.end] : [value.date];
  for (const e of endpoints) {
    if (e.day !== undefined && e.month === undefined) problems.push('day given without month');
    if (e.month !== undefined && e.day !== undefined && e.day > DAYS_IN_MONTH[e.month - 1]) {
      problems.push(`day ${e.day} does not exist in month ${e.month}`);
    }
    if (value.precision === 'day' && (e.month === undefined || e.day === undefined)) {
      problems.push('precision "day" requires month and day');
    }
    if (value.precision === 'month' && e.month === undefined) {
      problems.push('precision "month" requires month');
    }
    if (value.precision === 'month' && e.day !== undefined) {
      problems.push('day given but precision is "month" (contradictory precision)');
    }
    if (['year', 'decade', 'century'].includes(value.precision) && e.month !== undefined) {
      problems.push(`month/day given but precision is "${value.precision}" (contradictory precision)`);
    }
  }
  if (value.kind === 'range' && compareKeys(endpointKey(value.end), endpointKey(value.start)) < 0) {
    problems.push('range end precedes start');
  }
  return problems;
}

const ERA: Record<Locale, Record<'BCE' | 'CE', string>> = {
  en: { BCE: 'BCE', CE: 'CE' },
  es: { BCE: 'a. e. c.', CE: 'e. c.' },
};
const APPROX: Record<Locale, string> = { en: 'c.', es: 'h.' };
const UNKNOWN: Record<Locale, string> = { en: 'Date unknown', es: 'Fecha desconocida' };

function formatEndpoint(e: DateEndpoint, locale: Locale): string {
  const parts: string[] = [];
  if (e.day !== undefined) parts.push(String(e.day));
  if (e.month !== undefined) {
    parts.push(
      new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }).format(
        new Date(Date.UTC(2000, e.month - 1, 1)),
      ),
    );
  }
  parts.push(`${e.year} ${ERA[locale][e.era]}`);
  return parts.join(' ');
}

export function formatDate(value: DateValue | undefined, locale: Locale): string {
  if (!value || value.kind === 'unknown') return UNKNOWN[locale];
  if (value.kind === 'range') {
    return `${formatEndpoint(value.start, locale)} – ${formatEndpoint(value.end, locale)}`;
  }
  const text = formatEndpoint(value.date, locale);
  return value.kind === 'approximate' ? `${APPROX[locale]} ${text}` : text;
}
