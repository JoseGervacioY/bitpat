import { NextRequest, NextResponse } from "next/server";
import { TranslationService } from "@/lib/i18n/translation-service";
import { FileCache } from "@/lib/utils/cache-utils";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "detail";

    if (type === "history") {
      const days = searchParams.get("days") || "7";
      const res = await fetch(
        `${COINGECKO_API}/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
        {
          headers: { Accept: "application/json" },
          next: { revalidate: 300 },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch price history");
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    // Handle coin detail with localization
    const lang = searchParams.get("lang") || "en";
    
    const res = await fetch(
      `${COINGECKO_API}/coins/${id}?localization=true&tickers=false&community_data=false&developer_data=false`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch coin details");
    }

    const data = await res.json();

    // Translation Layer: If Spanish is requested but not provided (or is English) from CoinGecko
    if (lang === "es" && data.description) {
      const coinGeckoDescEs = data.description.es || "";
      const isActuallySpanish = coinGeckoDescEs.trim().length > 0 && !TranslationService.isLikelyEnglish(coinGeckoDescEs);
      
      if (!isActuallySpanish) {
        const cacheKey = `trans_${id}_es`;
        let translatedText = FileCache.get(cacheKey);

        if (!translatedText) {
          // Trigger automatic translation
          translatedText = await TranslationService.translateToSpanish(data.description.en);
          FileCache.set(cacheKey, translatedText);
        }

        // Inject the translated text into the response
        data.description.es = translatedText;
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Crypto detail fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch crypto data" },
      { status: 500 }
    );
  }
}

