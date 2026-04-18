import { NextRequest, NextResponse } from "next/server";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ coins: [] });
    }

    const res = await fetch(
      `${COINGECKO_API}/search?query=${encodeURIComponent(query)}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to search coins");
    }

    const data = await res.json();
    return NextResponse.json({ coins: data.coins?.slice(0, 50) || [] });
  } catch (error) {
    console.error("Crypto search error:", error);
    return NextResponse.json(
      { error: "Failed to search coins" },
      { status: 500 }
    );
  }
}
