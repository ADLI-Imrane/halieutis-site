'use client'

import { useState } from 'react';
import { MapPin, Mail, Phone, Clock, Send, CheckCircle, AlertCircle, Instagram, Linkedin, Music } from 'lucide-react';
import { submitForm } from '@/app/actions';

export default function ContactForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setMessage(null);
    
    const result = await submitForm(formData);
    
    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Votre message a été envoyé avec succès !' });
      (document.getElementById('contact-form') as HTMLFormElement).reset();
    }
    setPending(false);
  }

  return (
    <section id="contact" className="contact">
      <div className="container">
        <p className="section-label">Restons en contact</p>
        <h2 className="section-title">Une question ? <em>Écrivez-nous</em></h2>
        
        <div className="contact-grid">
          <div className="contact-info">
            <div className="c-item">
              <div className="c-icon"><MapPin className="w-5 h-5 text-aqua" /></div>
              <div>
                <h4>Localisation</h4>
                <p>Faculté des Sciences et Techniques, Tanger, Maroc</p>
              </div>
            </div>
            <div className="c-item">
              <div className="c-icon"><Mail className="w-5 h-5 text-aqua" /></div>
              <div>
                <h4>Email</h4>
                <a href="mailto:halieutis.club.fstt@gmail.com">halieutis.club.fstt@gmail.com</a>
              </div>
            </div>
            <div className="c-item">
              <div className="c-icon"><Phone className="w-5 h-5 text-aqua" /></div>
              <div>
                <h4>Téléphone</h4>
                <p>+212 6XX XX XX XX</p>
              </div>
            </div>
            <div className="c-item">
              <div className="c-icon"><Clock className="w-5 h-5 text-aqua" /></div>
              <div>
                <h4>Disponibilité</h4>
                <p>Lun - Ven: 09:00 - 18:00</p>
              </div>
            </div>

            <div className="social-row">
              <a href="https://www.instagram.com/halieutis.club/" target="_blank" rel="noopener noreferrer" className="social-btn">
                <Instagram size={18} />
                <span>Instagram</span>
              </a>
              <a href="https://www.linkedin.com/company/halieutis-club/" target="_blank" rel="noopener noreferrer" className="social-btn">
                <Linkedin size={18} />
                <span>LinkedIn</span>
              </a>
              <a href="https://www.tiktok.com/@halieutis.club.fstt" target="_blank" rel="noopener noreferrer" className="social-btn">
                <Music size={18} />
                <span>TikTok</span>
              </a>
            </div>
          </div>

          <div className="contact-form-container">
            <form id="contact-form" action={handleSubmit} className="contact-form">
              <div className="f-row">
                <input type="text" name="name" placeholder="Votre nom complet" className="finput" required />
                <input type="email" name="email" placeholder="Votre email" className="finput" required />
              </div>
              <input type="text" name="subject" placeholder="Sujet du message" className="finput" />
              <textarea name="message" placeholder="Votre message..." className="finput" required></textarea>
              
              <button type="submit" disabled={pending} className="fsub">
                {pending ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>

              {message && (
                <div className={`mt-4 p-4 rounded flex items-center gap-2 ${message.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-900/50' : 'bg-red-900/20 text-red-400 border border-red-900/50'}`}>
                  {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span className="text-sm font-medium">{message.text}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
