/** Dedicated newspaper illustrations: clean generation + measured local quality review. */
export const NEWS_ARTWORK = {
  schoolOpening: new URL('../assets/events/news/school-opening.webp', import.meta.url).href,
  committeeFounded: new URL('../assets/events/news/committee-founded.webp', import.meta.url).href,
  assemblyVote: new URL('../assets/events/news/assembly-vote.webp', import.meta.url).href,
  broadcastSeized: new URL('../assets/events/news/broadcast-seized.webp', import.meta.url).href,
  commercialCampus: new URL('../assets/events/news/commercial-campus.webp', import.meta.url).href,
  entertainmentInauguration: new URL('../assets/events/news/entertainment-inauguration.webp', import.meta.url).href,
} as const;

// November 2026: simple event scenes
export const SIMPLE_NEWS_ART = {
 council: new URL("../assets/events/news/N_council.webp", import.meta.url).href,
 exam: new URL("../assets/events/news/N_exam.webp", import.meta.url).href,
 press: new URL("../assets/events/news/N_press.webp", import.meta.url).href,
 security: new URL("../assets/events/news/N_security.webp", import.meta.url).href,
} as const;
export function getSimpleNewsArt(id: string): string | undefined {
 if (/bill|election|assembly|parliament|vote/.test(id)) return SIMPLE_NEWS_ART.council;
 if (/exam|reform|testing|study|paper/.test(id)) return SIMPLE_NEWS_ART.exam;
 if (/broadcast|radio|frequency|leaflet|print/.test(id)) return SIMPLE_NEWS_ART.press;
 if (/patrol|purge|security|martial|silenced/.test(id)) return SIMPLE_NEWS_ART.security;
 return undefined;
}
