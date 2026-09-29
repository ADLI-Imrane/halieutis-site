import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

// Admin login without a database: one admin whose credentials are the Vercel
// variables ADMIN_EMAIL and ADMIN_PASSWORD. A successful login sets a signed,
// HttpOnly cookie holding only its expiry time.
//
// The signing key is derived from ADMIN_PASSWORD and ADMIN_API_TOKEN (a
// 64-hex-char secret the server already has), so changing the password signs
// every existing session out.

export const SESSION_COOKIE = 'halieutis_admin';
const SESSION_SECONDS = 12 * 60 * 60;
// A shorter configured password disables the login rather than weaken it.
const MIN_PASSWORD_LENGTH = 12;

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_SECONDS,
};

export function checkCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword || expectedPassword.length < MIN_PASSWORD_LENGTH) {
    return false;
  }
  // Compare both, always, so the response time does not reveal which was wrong.
  const emailOk = safeEqual(email.trim().toLowerCase(), expectedEmail);
  const passwordOk = safeEqual(password, expectedPassword);
  return emailOk && passwordOk;
}

/** A new session value, or null when the login is not configured. */
export function createSessionToken(): string | null {
  const key = signingKey();
  if (!key) return null;
  const expires = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  return `${expires}.${sign(key, expires)}`;
}

export function isValidSession(token: string | undefined): boolean {
  const key = signingKey();
  if (!key || !token) return false;
  const [expires, signature] = token.split('.');
  if (!expires || !signature) return false;
  if (!safeEqual(signature, sign(key, expires))) return false;
  return Number(expires) > Date.now() / 1000;
}

function signingKey(): Buffer | null {
  const password = process.env.ADMIN_PASSWORD;
  const apiToken = process.env.ADMIN_API_TOKEN;
  if (!password || password.length < MIN_PASSWORD_LENGTH || !apiToken) return null;
  return createHash('sha256').update(`halieutis-admin-session\0${apiToken}\0${password}`).digest();
}

function sign(key: Buffer, value: string): string {
  return createHmac('sha256', key).update(value).digest('base64url');
}

// Hash first so both sides have the same length, as timingSafeEqual requires.
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(
    createHash('sha256').update(a).digest(),
    createHash('sha256').update(b).digest(),
  );
}
