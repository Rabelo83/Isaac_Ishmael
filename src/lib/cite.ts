import type { Citation } from './content/schemas.ts';

/** Citation reference anchor IDs, shared by the inline marker and the citation list. */
export const citationAnchor = (citationId: string) => citationId;

/**
 * Replaces each `:cite[cit-id]` marker with a numbered link to the record's
 * citation list. Unknown markers never reach this point: the validator rejects them.
 */
export function renderCiteMarkers(markdown: string, citations: readonly Citation[], labelWord: string): string {
  const order = new Map(citations.map((c, i) => [c.id, i + 1]));
  return markdown.replace(/:cite\[([^\]]*)\]/g, (_, raw: string) => {
    const id = raw.trim();
    const n = order.get(id);
    if (n === undefined) throw new Error(`unresolved citation marker ${id}`);
    return `<sup class="cite"><a href="#${citationAnchor(id)}" aria-label="${labelWord} ${n}">[${n}]</a></sup>`;
  });
}
