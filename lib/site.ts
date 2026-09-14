export const SITE_URL = "https://www.openspeech.dev";

/** The hosted-API product this directory funnels into. */
export const CLOUD_URL =
  process.env.NEXT_PUBLIC_CLOUD_URL ?? "https://app.openspeech.dev";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  yue: "Cantonese",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  hi: "Hindi",
  ru: "Russian",
  nl: "Dutch",
  pl: "Polish",
  tr: "Turkish",
  ar: "Arabic",
  cs: "Czech",
  hu: "Hungarian",
  vi: "Vietnamese",
  id: "Indonesian",
  th: "Thai",
};

export function languageNames(codes: string[]): string {
  return codes.map((c) => LANGUAGE_NAMES[c] ?? c.toUpperCase()).join(", ");
}

export const CLOUD_PRICING = [
  { id: "small", name: "Small models", perMinUsd: 0.10, notes: "Planned tier for lightweight models such as Kokoro." },
  { id: "medium", name: "Medium models", perMinUsd: 0.20, notes: "Planned tier for models such as Chatterbox and Orpheus." },
  { id: "large", name: "Large models", perMinUsd: 0.40, notes: "Planned tier for larger, expressive models." },
] as const;
export const CLOUD_PRICING_REVIEWED = "2026-09-14";
