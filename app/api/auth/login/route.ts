import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 1. Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Invalid login credentials" },
        { status: 401 }
      );
    }

    // 2. Get user name from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", data.user.id)
      .single();

    const name = profile?.name || data.user.user_metadata?.full_name || "User";

    // 3. Create local session
    await createSession({
      userId: data.user.id,
      email: data.user.email!,
      name: name,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        name: name,
        email: data.user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
