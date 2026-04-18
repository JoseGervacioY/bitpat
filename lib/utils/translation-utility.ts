/**
 * Utility to handle dynamic translations for API content.
 * Prioritizes localized data from the API and provides fallbacks for missing translations.
 */

export interface LocalizedContent {
  en: string;
  es: string;
  [key: string]: string;
}

/**
 * Picks the correct translation from a localized object, or falls back to English.
 */
export function getLocalizedDescription(description: LocalizedContent | string | undefined, lang: string): string {
  if (!description) return "";

  // If description is just a string, return it as is
  if (typeof description === "string") return description;

  // If it's a localized object from CoinGecko
  const targetLang = lang === "es" ? "es" : "en";
  
  if (description[targetLang]) {
    return description[targetLang];
  }

  // Fallback to English if target language is missing
  if (description["en"]) {
    return description["en"];
  }

  // Final fallback: just return the first available string
  const firstAvailable = Object.values(description).find(val => typeof val === "string");
  return firstAvailable || "";
}

/**
 * A placeholder for more advanced automatic translation.
 * In a real production app, this could call an external Translation API (Google/DeepL).
 */
export async function autoTranslateText(text: string, targetLang: string): Promise<string> {
  // Recommendation: For a production-ready system, integrate an API like Google Cloud Translate.
  // For now, we return the text as is, as the CoinGecko localization handles 99% of cases.
  return text;
}
