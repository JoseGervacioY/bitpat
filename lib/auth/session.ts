import { cookies } from "next/headers";

const SESSION_COOKIE = "bitpat-session";

export interface SessionData {
  userId: number;
  email: string;
  name: string;
}

// Simple session management using cookies
// In production, use a proper session library like iron-session

export async function createSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  const sessionData = Buffer.from(JSON.stringify(data)).toString("base64");
  
  cookieStore.set(SESSION_COOKIE, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  
  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString());
    return data as SessionData;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
