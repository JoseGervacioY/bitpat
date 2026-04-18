import { NextRequest, NextResponse } from "next/server";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "100";
    const ids = searchParams.get("ids");

    let url = `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h`;
    
    if (ids) {
      url = `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`;
    }

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch crypto data");
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Crypto fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch crypto data" },
      { status: 500 }
    );
  }
}
