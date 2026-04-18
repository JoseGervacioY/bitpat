import { cookies } from "next/headers";

const SESSION_COOKIE = "bitpat-session";

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number; // Unix timestamp in seconds
}

/**
 * Persists session data in an HTTP-only cookie.
 */
export async function createSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  const sessionData = Buffer.from(JSON.stringify(data)).toString("base64");
  
  cookieStore.set(SESSION_COOKIE, sessionData, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

/**
 * Retrieves and parses the session data from the cookie.
 */
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

/**
 * Destroys the session cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
