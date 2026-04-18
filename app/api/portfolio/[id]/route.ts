import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { createAuthClient } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await getSession();

    if (!sessionData || !sessionData.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params; // id is a UUID string
    const { amount, purchasePrice } = await request.json();

    if (amount === undefined || purchasePrice === undefined) {
      return NextResponse.json(
        { error: "Amount and purchase price are required" },
        { status: 400 }
      );
    }

    // Auth client for RLS
    const authClient = createAuthClient(sessionData.accessToken);

    const item = await db.updatePortfolioItem(
      id,
      sessionData.userId,
      parseFloat(amount),
      parseFloat(purchasePrice),
      authClient
    );

    if (!item) {
      return NextResponse.json(
        { error: "Item not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Portfolio update error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await getSession();

    if (!sessionData || !sessionData.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params; // id is a UUID string
    
    // Auth client for RLS
    const authClient = createAuthClient(sessionData.accessToken);
    
    const deleted = await db.deletePortfolioItem(id, sessionData.userId, authClient);

    if (!deleted) {
      return NextResponse.json(
        { error: "Item not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Portfolio delete error:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the item" },
      { status: 500 }
    );
  }
}
