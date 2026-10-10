import { describe, expect, it } from 'vitest';
import { checkDate, endpointKey, formatDate } from '../src/lib/content/dates.ts';

describe('dates', () => {
  it('orders BCE before CE without a year zero', () => {
    expect(endpointKey({ year: 1, era: 'BCE' })[0]).toBe(0);
    expect(endpointKey({ year: 1, era: 'CE' })[0]).toBe(1);
    expect(
      checkDate({ kind: 'range', start: { year: 1, era: 'BCE' }, end: { year: 1, era: 'CE' }, precision: 'year' }),
    ).toEqual([]);
  });

  it('accepts unknown dates without precision', () => {
    expect(checkDate({ kind: 'unknown' })).toEqual([]);
    expect(formatDate({ kind: 'unknown' }, 'es')).toBe('Fecha desconocida');
  });

  it('formats per locale without inventing precision', () => {
    expect(formatDate({ kind: 'approximate', date: { year: 1200, era: 'CE' }, precision: 'century' }, 'en')).toBe(
      'c. 1200 CE',
    );
    expect(formatDate({ kind: 'exact', date: { year: 586, era: 'BCE' }, precision: 'year' }, 'es')).toBe(
      '586 a. e. c.',
    );
    expect(
      formatDate({ kind: 'exact', date: { year: 2001, era: 'CE', month: 3, day: 14 }, precision: 'day' }, 'es'),
    ).toBe('14 marzo 2001 e. c.');
  });
});
