// Build-mode selection: the single gate deciding which records reach output.
import { RELEASABLE_TRANSLATION_STATUSES, type BuildMode } from './constants.ts';
import type { ContentRecord, TextFrontmatter } from './schemas.ts';

type TextLike = { fm: Pick<TextFrontmatter, 'translation_status'> } | undefined;

/**
 * Production gate: a non-fixture, published record whose texts exist in every
 * locale and are each original or reviewed translations.
 */
export function isReleasable(record: ContentRecord, texts: readonly TextLike[]): boolean {
  return (
    record.fixture === false &&
    record.review_status === 'published' &&
    texts.length > 0 &&
    texts.every((t) => t !== undefined && RELEASABLE_TRANSLATION_STATUSES.includes(t.fm.translation_status))
  );
}

/** Whether a record may be rendered in the given build mode. */
export function includeInMode(mode: BuildMode, record: ContentRecord, texts: readonly TextLike[]): boolean {
  switch (mode) {
    case 'production':
      return isReleasable(record, texts);
    case 'preview':
      return record.fixture === false;
    case 'fixtures':
      // The fixtures root holds only synthetic test input; render all of it.
      return true;
  }
}
