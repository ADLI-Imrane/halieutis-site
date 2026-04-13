'use server'

import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitForm(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !message) {
    return { error: 'Veuillez remplir tous les champs obligatoires.' };
  }

  try {
    // 1. Save to Supabase
    const { error: supabaseError } = await supabase
      .from('submissions')
      .insert([{ name, email, subject, message }]);

    if (supabaseError) throw supabaseError;

    // 2. Send email notification via Resend
    await resend.emails.send({
      from: 'Halieutis Website <onboarding@resend.dev>',
      to: 'halieutis.club.fstt@gmail.com',
      subject: `Nouveau message de ${name} : ${subject || 'Contact Club'}`,
      html: `
        <h2>Nouveau message reçu via le site Halieutis</h2>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Sujet :</strong> ${subject || 'Non spécifié'}</p>
        <p><strong>Message :</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return { success: true };
  } catch (err) {
    console.error('Form submission error:', err);
    return { error: 'Une erreur est survenue lors de l\'envoi du message.' };
  }
}
