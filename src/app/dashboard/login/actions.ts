'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  SESSION_COOKIE,
  checkCredentials,
  createSessionToken,
  sessionCookieOptions,
} from '@/lib/admin-session';

const FAILED_LOGIN_DELAY_MS = 1000;

export async function login(email: unknown, password: unknown) {
  const token =
    typeof email === 'string' && typeof password === 'string' && checkCredentials(email, password)
      ? createSessionToken()
      : null;

  if (!token) {
    // Slows down password guessing.
    await new Promise((resolve) => setTimeout(resolve, FAILED_LOGIN_DELAY_MS));
    return { error: 'Identifiants invalides. Vérifiez votre email et mot de passe.' };
  }

  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
  redirect('/dashboard');
}
