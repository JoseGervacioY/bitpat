import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    // 1. Sign out from Supabase
    await supabase.auth.signOut();
    
    // 2. Destroy local session
    await destroySession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
