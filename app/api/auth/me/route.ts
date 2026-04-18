import { NextResponse } from "next/server";
import { getSession, createSession, destroySession } from "@/lib/auth/session";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const sessionData = await getSession();

    if (!sessionData || !sessionData.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const SAFETY_MARGIN = 60; // 60 seconds margin

    // 1. PERFORMANCE OPTIMIZATION: Trust cookie if token is still valid
    if (sessionData.expiresAt && sessionData.expiresAt > now + SAFETY_MARGIN) {
      return NextResponse.json({
        user: {
          id: sessionData.userId,
          name: sessionData.name,
          email: sessionData.email,
        },
      });
    }

    // 2. TOKEN REFRESH: If token is expired or about to expire
    if (sessionData.refreshToken) {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: sessionData.refreshToken,
      });

      if (!error && data.session && data.user) {
        // Atomic update of the session cookie with new tokens
        await createSession({
          userId: data.user.id,
          email: data.user.email!,
          name: sessionData.name, // Keep the same name or refresh from profile
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at,
        });

        return NextResponse.json({
          user: {
            id: data.user.id,
            name: sessionData.name,
            email: data.user.email,
          },
        });
      }
    }

    // 3. ERROR HANDLING: If refresh fails or no tokens
    console.warn("Session refresh failed, clearing cookies");
    await destroySession();
    
    return NextResponse.json(
      { error: "Session expired and could not be refreshed" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
