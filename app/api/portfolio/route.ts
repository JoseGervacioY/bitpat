import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { createAuthClient } from "@/lib/supabase";

export async function GET() {
  try {
    const sessionData = await getSession();

    if (!sessionData || !sessionData.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Create an authenticated client for the GET request (satisfies SELECT RLS)
    const authClient = createAuthClient(sessionData.accessToken);
    const portfolio = await db.getPortfolioByUserId(sessionData.userId, authClient);

    return NextResponse.json({ portfolio });
  } catch (error) {
    console.error("Portfolio fetch error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the portfolio" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionData = await getSession();

    if (!sessionData || !sessionData.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated. Please log in again." },
        { status: 401 }
      );
    }

    const { coinId, coinName, coinSymbol, amount, purchasePrice } = await request.json();

    if (!coinId || !coinName || !coinSymbol || amount === undefined || amount === null) {
      return NextResponse.json(
        { error: "Missing required fields (coinId, coinName, coinSymbol, amount)" },
        { status: 400 }
      );
    }

    const finalAmount = parseFloat(amount) || 0;
    const finalPurchasePrice = parseFloat(purchasePrice) || 0;

    // Create an authenticated client for the POST request (satisfies INSERT RLS)
    const authClient = createAuthClient(sessionData.accessToken);

    // 1. Add/Update portfolio item in portfolio_assets table
    const item = await db.addPortfolioItem(
      sessionData.userId,
      coinId,
      coinName,
      coinSymbol,
      finalAmount,
      finalPurchasePrice,
      authClient
    );

    // 2. Add transaction record
    try {
      await db.addTransaction(
        sessionData.userId,
        coinId,
        coinName,
        "buy",
        finalAmount,
        finalPurchasePrice,
        authClient
      );
    } catch (transError) {
      console.error("Failed to log transaction:", transError);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Asset added successfully",
      item 
    });
  } catch (error: any) {
    console.error("Portfolio add error (API Route):", error);
    
    // Check if it's an RLS error from Supabase
    if (error.code === "42501" || error.message?.includes("row-level security")) {
      return NextResponse.json(
        { error: "Security policy violation. You are only allowed to manage your own data." },
        { status: 403 }
      );
    }

    const errorMessage = error.message || "An unexpected error occurred while adding the asset";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
