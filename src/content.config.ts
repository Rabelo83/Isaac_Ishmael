// Content collections backed by the project's own loader, so the Astro build
// sees exactly the records that passed validation and the build-mode gate.
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { LOCALES } from './lib/content/constants.ts';
import { buildModeFromEnv, DEFAULT_ROOT, selectCorpus, type SiteCorpus } from './lib/content/corpus.ts';
import { renderCiteMarkers } from './lib/cite.ts';
import { UI } from './lib/i18n.ts';

let cached: SiteCorpus | undefined;
function corpus(): SiteCorpus {
  const mode = buildModeFromEnv(process.env.SITE_MODE);
  cached ??= selectCorpus(mode, process.env.CONTENT_ROOT || DEFAULT_ROOT[mode]);
  return cached;
}

const records = defineCollection({
  loader: {
    name: 'isaac-ishmael-records',
    load: async ({ store, parseData }) => {
      store.clear();
      for (const { record } of corpus().records.values()) {
        store.set({ id: record.id, data: await parseData({ id: record.id, data: record }) });
      }
    },
  },
  // Already validated by the project validator; kept loose here.
  schema: z.looseObject({ id: z.string(), type: z.string() }),
});

const texts = defineCollection({
  loader: {
    name: 'isaac-ishmael-texts',
    load: async ({ store, parseData, renderMarkdown }) => {
      store.clear();
      for (const { record, texts: byLocale } of corpus().records.values()) {
        for (const locale of LOCALES) {
          const text = byLocale[locale];
          if (!text) continue;
          const id = `${locale}/${record.id}`;
          const markdown = renderCiteMarkers(text.body, record.citations, UI[locale].citation);
          store.set({
            id,
            data: await parseData({ id, data: { ...text.fm, record_id: record.id } }),
            rendered: await renderMarkdown(markdown),
          });
        }
      }
    },
  },
  schema: z.looseObject({ id: z.string(), lang: z.enum(LOCALES), record_id: z.string() }),
});

export const collections = { records, texts };
