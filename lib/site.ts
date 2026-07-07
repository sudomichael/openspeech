export const SITE_URL = "https://www.openspeech.dev";

/** The hosted-API product this directory funnels into. */
export const CLOUD_URL =
  process.env.NEXT_PUBLIC_CLOUD_URL ?? "https://cloud.openspeech.dev";

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
