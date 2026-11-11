const COOKIE = "tvx_session";
const MAX_AGE = 60 * 60 * 24 * 7;

export function sessionCookieName() {
  return COOKIE;
}

export function sessionMaxAge() {
  return MAX_AGE;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/") + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function constantEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmac(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function signSession(secret: string, now = Date.now()): Promise<string> {
  const payload = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify({ exp: now + MAX_AGE * 1000, v: 1 })),
  );
  const signature = await hmac(secret, payload);
  return `${payload}.${signature}`;
}

export async function verifySession(token: string | undefined, secret: string | undefined, now = Date.now()): Promise<boolean> {
  if (!token || !secret || secret.length < 16) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = await hmac(secret, payload);
  if (!constantEqual(signature, expected)) return false;
  try {
    const json = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as { exp?: number };
    return typeof json.exp === "number" && json.exp > now;
  } catch {
    return false;
  }
}

export function readCookie(header: string | null, name = COOKIE): string {
  if (!header) return "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return "";
}
