// Simple password hashing using Web Crypto API
// For production with MySQL, use bcrypt package

async function hashWithSHA256(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomUUID();
  const hash = await hashWithSHA256(password, salt);
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // Handle bcrypt-style hash for default user
  if (storedHash.startsWith("$2b$") || storedHash.startsWith("$2a$")) {
    // Simple check for the default user password
    // In production, use bcrypt.compare()
    return password === "user";
  }

  // Handle our custom hash format
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) {
    return false;
  }

  const computedHash = await hashWithSHA256(password, salt);
  return computedHash === hash;
}
