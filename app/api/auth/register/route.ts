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
    // Note: Email confirmation should be disabled in Supabase Dashboard (Auth > Settings)
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

    if (!data.user) {
      return NextResponse.json(
        { error: "Something went wrong during registration" },
        { status: 500 }
      );
    }

    // 2. Insert into profiles table
    // The user mentioned they already have this table linked to auth.users(id)
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
      // We don't necessarily want to fail registration if only profile fails, 
      // but it's good to log it. In this case, I'll return success anyway 
      // if the user was created.
    }

    // 3. Create local session for compatibility with existing system
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
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
