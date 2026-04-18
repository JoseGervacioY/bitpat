/**
 * Server-side service to handle automatic translation of text.
 */
export class TranslationService {
  /**
   * Translates text from English to Spanish.
   * In a production environment, this should call an API like Google Translate or DeepL.
   * For this implementation, we use a basic fallback that can be replaced with a real API call.
   */
  /**
   * Translates text from English to Spanish.
   * Uses the free MyMemory API with localized fallback.
   */
  /**
   * Helper to detect if a text is likely English even if it's supposed to be Spanish.
   * Checks for high-frequency English words vs Spanish words.
   */
  static isLikelyEnglish(text: string): boolean {
    if (!text) return false;
    
    const englishWords = [" the ", " is ", " and ", " of ", " with ", " from ", " that "];
    const spanishWords = [" el ", " la ", " con ", " de ", " que ", " por ", " para "];
    
    let enScore = 0;
    let esScore = 0;
    
    const lowerText = ` ${text.toLowerCase()} `;
    
    englishWords.forEach(word => {
      if (lowerText.includes(word)) enScore++;
    });
    
    spanishWords.forEach(word => {
      if (lowerText.includes(word)) esScore++;
    });
    
    // If English words outnumber Spanish words significantly, or no Spanish words are found
    // while English ones are present, it's likely English.
    return enScore > esScore;
  }

  static async translateToSpanish(text: string): Promise<string> {
    if (!text) return "";

    try {
      // MyMemory API: https://mymemory.translated.net/doc/spec.php
      const pair = "en|es";
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          text.substring(0, 500) // Limit to 500 chars for free tier stability
        )}&langpair=${pair}`,
        {
          headers: { Accept: "application/json" },
          next: { revalidate: 86400 }, // 24 hour cache
        }
      );

      if (!res.ok) {
        throw new Error("Translation API failed");
      }

      const data = await res.json();
      
      if (data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }

      return text;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  }
}
