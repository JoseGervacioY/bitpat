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
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { coinId, coinName, amount, purchasePrice } = await request.json();

    if (!coinId || !coinName || !amount || !purchasePrice) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const item = await db.addPortfolioItem(
      session.userId,
      coinId,
      coinName,
      parseFloat(amount),
      parseFloat(purchasePrice)
    );

    // Add transaction record
    await db.addTransaction(
      session.userId,
      coinId,
      coinName,
      "buy",
      parseFloat(amount),
      parseFloat(purchasePrice)
    );

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Portfolio add error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
