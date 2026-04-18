import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const portfolio = await db.getPortfolioByUserId(session.userId);

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
    const session = await getSession();

    if (!session) {
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

    // 1. Add/Update portfolio item in portfolio_assets table
    const item = await db.addPortfolioItem(
      session.userId,
      coinId,
      coinName,
      coinSymbol,
      finalAmount,
      finalPurchasePrice
    );

    // 2. Add transaction record
    try {
      await db.addTransaction(
        session.userId,
        coinId,
        coinName,
        "buy",
        finalAmount,
        finalPurchasePrice
      );
    } catch (transError) {
      // We log but don't fail the whole request if the transaction log fails
      console.error("Failed to log transaction:", transError);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Asset added successfully",
      item 
    });
  } catch (error: any) {
    console.error("Portfolio add error (API Route):", error);
    
    // Provide a more descriptive error if possible
    const errorMessage = error.message || "An unexpected error occurred while adding the asset";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
