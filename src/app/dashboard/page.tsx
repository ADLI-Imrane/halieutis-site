import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  LogOut, 
  LayoutDashboard,
  User,
  Mail,
  Box
} from 'lucide-react';
import Link from 'next/link';
import { SESSION_COOKIE, isValidSession } from '@/lib/admin-session';
import { listSubmissions, type Submission } from '@/lib/submissions-api';

export default async function DashboardPage() {
  const cookieStore = await cookies();

  if (!isValidSession(cookieStore.get(SESSION_COOKIE)?.value)) {
    redirect('/dashboard/login');
  }

  // Fetch submissions from D1 (through the submissions Worker)
  let submissions: Submission[] | null = null;
  try {
    submissions = await listSubmissions();
  } catch (err) {
    console.error('Dashboard: loading submissions failed:', err instanceof Error ? err.message : err);
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-title">
          <div className="flex items-center gap-2 mb-2">
            <LayoutDashboard size={20} className="text-aqua" />
            <span className="text-aqua text-xs font-bold uppercase tracking-widest">Administration</span>
          </div>
          <h1>Tableau de Bord</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="admin-stats">
            <Users size={16} className="inline mr-2" />
            {submissions?.length || 0} Inscriptions
          </div>
          {/* No prefetch: prefetching this link would sign the admin out. */}
          <Link href="/auth/signout" prefetch={false} className="social-btn" style={{ background: 'rgba(255, 99, 71, 0.1)', color: '#ff6347', borderColor: 'rgba(255, 99, 71, 0.2)' }}>
            <LogOut size={16} />
            <span>Déconnexion</span>
          </Link>
        </div>
      </header>

      <main className="admin-grid">
        {!submissions ? (
          <div className="admin-card max-w-none p-12 text-center text-red-400">
            <Box size={48} className="mx-auto mb-4 opacity-20" />
            <p>Impossible de charger les inscriptions. Réessayez dans quelques instants.</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="admin-card max-w-none p-12 text-center text-white/40">
            <Box size={48} className="mx-auto mb-4 opacity-20" />
            <p>Aucune inscription reçue pour le moment.</p>
          </div>
        ) : (
          submissions.map((sub) => (
            <div key={sub.id} className="admin-leak-card">
              <div className="admin-leak-header">
                <div className="admin-leak-user">
                  <div className="w-10 h-10 bg-aqua/10 rounded-full flex items-center justify-center text-aqua">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-white">{sub.name}</div>
                    <div className="admin-leak-email flex items-center gap-1">
                      <Mail size={12} />
                      {sub.email}
                    </div>
                  </div>
                </div>
                <div className="admin-leak-time">
                  <Calendar size={12} className="inline mr-1" />
                  {new Date(sub.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <div className="admin-leak-subject">
                <MessageSquare size={12} className="inline mr-1" />
                {sub.subject}
              </div>

              <div className="admin-leak-message">
                "{sub.message}"
              </div>
            </div>
          ))
        )}
      </main>

      <footer className="mt-12 text-center opacity-30 text-xs text-white">
        &copy; {new Date().getFullYear()} Halieutis Club FSTT - Système de Gestion des Leads
      </footer>
    </div>
  );
}
