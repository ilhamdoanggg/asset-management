import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "node:crypto";
import { cookies, headers } from "next/headers";
import { COOKIES } from "./constants";

const SECRET =
  process.env.AUTH_SECRET || "asset-management-dev-secret-key-change-in-prod";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const hash = scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, "hex");
  if (hash.length !== keyBuffer.length) return false;
  return timingSafeEqual(hash, keyBuffer);
}

export interface SessionUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export function signToken(payload: SessionUser): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyToken(token: string): SessionUser | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expectedSig = createHmac("sha256", SECRET).update(data).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIES.SESSION)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSession(user: SessionUser) {
  const token = signToken(user);
  const cookieStore = await cookies();
  let isHttps = false;
  try {
    const headerList = await headers();
    isHttps = headerList.get("x-forwarded-proto") === "https";
  } catch {
    // Fallback if called outside request context
  }

  cookieStore.set(COOKIES.SESSION, token, {
    httpOnly: true,
    secure: isHttps || process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIES.SESSION);
}
