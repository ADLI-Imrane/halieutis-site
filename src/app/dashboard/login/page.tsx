'use client'

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Lock, Loader2, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Identifiants invalides. Vérifiez votre email et mot de passe.");
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-card">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-aqua/10 border border-aqua/20 rounded-full flex items-center justify-center">
            <Lock className="text-aqua w-8 h-8" />
          </div>
        </div>
        
        <h1 className="text-white font-bold mb-2">Halieutis Admin</h1>
        <p className="section-body mb-8" style={{ marginTop: 0 }}>Connectez-vous pour gérer les inscriptions</p>

        <form onSubmit={handleLogin}>
          <div className="admin-input-group">
            <label className="admin-label">Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="admin-input"
                style={{ paddingLeft: '44px' }}
                required
              />
              <User size={18} className="text-aqua/40" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="admin-input-group">
            <label className="admin-label">Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="admin-input"
                style={{ paddingLeft: '44px' }}
                required
              />
              <Lock size={18} className="text-aqua/40" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs font-medium bg-red-900/10 p-2 rounded border border-red-900/30 mb-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="admin-btn"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Se connecter'}
          </button>
        </form>

        <div className="mt-12">
          <Link href="/" className="social-btn" style={{ justifyContent: 'center' }}>
            <ArrowLeft size={14} />
            <span>Retour au site public</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
