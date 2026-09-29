'use server'

import { headers } from 'next/headers';
import { Resend } from 'resend';
import { createSubmission, type SubmissionInput } from '@/lib/submissions-api';

// Keep in step with cloudflare/worker/src/index.ts and its migration.
const LIMITS = { name: 200, email: 254, subject: 200, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitForm(formData: FormData) {
  const name = field(formData, 'name');
  const email = field(formData, 'email');
  const subject = field(formData, 'subject');
  const message = field(formData, 'message');

  if (!name || !email || !message) {
    return { error: 'Veuillez remplir tous les champs obligatoires.' };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: 'Veuillez saisir une adresse email valide.' };
  }
  if (
    name.length > LIMITS.name ||
    email.length > LIMITS.email ||
    subject.length > LIMITS.subject ||
    message.length > LIMITS.message
  ) {
    return { error: 'Un des champs dépasse la longueur autorisée.' };
  }

  const submission = { name, email, subject, message };

  try {
    // 1. Save to D1 (through the submissions Worker)
    const result = await createSubmission(submission, await clientIp());
    if (result === 'rate_limited') {
      return { error: 'Trop de messages envoyés. Veuillez réessayer dans quelques minutes.' };
    }
  } catch (err) {
    // Log the failure, not the visitor's data.
    console.error('Form submission error:', err instanceof Error ? err.message : err);
    return { error: 'Une erreur est survenue lors de l\'envoi du message.' };
  }

  // 2. Send email notification via Resend. The message is already saved,
  // so a failed notification does not fail the submission.
  await notifyByEmail(submission);

  return { success: true };
}

async function notifyByEmail({ name, email, subject, message }: SubmissionInput) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: 'Halieutis Website <onboarding@resend.dev>',
      to: 'halieutis.club.fstt@gmail.com',
      subject: `Nouveau message de ${name} : ${subject || 'Contact Club'}`,
      html: `
        <h2>Nouveau message reçu via le site Halieutis</h2>
        <p><strong>Nom :</strong> ${escapeHtml(name)}</p>
        <p><strong>Email :</strong> ${escapeHtml(email)}</p>
        <p><strong>Sujet :</strong> ${escapeHtml(subject || 'Non spécifié')}</p>
        <p><strong>Message :</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
    });
    if (error) console.error('Resend notification failed:', error.name, error.message);
  } catch (err) {
    console.error('Resend notification failed:', err instanceof Error ? err.message : err);
  }
}

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

// Vercel sets x-real-ip / x-forwarded-for to the visitor's address.
async function clientIp(): Promise<string | null> {
  const requestHeaders = await headers();
  return (
    requestHeaders.get('x-real-ip') ??
    requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    null
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
