import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: "Password must be at least 4 characters" },
        { status: 400 }
      );
    }

    // 1. Sign up user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.user || !data.session) {
      if (!data.session) {
        return NextResponse.json(
          { error: "Registration successful, but session was not created. Please check if email confirmation is required." },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { error: "Something went wrong during registration" },
        { status: 500 }
      );
    }

    // 2. Insert into profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: data.user.id,
          name: name,
          email: email,
        },
      ]);

    if (profileError) {
      console.error("Error creating profile:", profileError);
    }

    // 3. Create local session with tokens and expiration
    await createSession({
      userId: data.user.id,
      email: data.user.email!,
      name: name,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        name: name,
        email: data.user.email,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
