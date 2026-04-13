import { createServerClient } from '@supabase/ssr';
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

export default async function DashboardPage() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // sessions.
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/dashboard/login');
  }

  // Fetch submissions
  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false });

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
          <Link href="/auth/signout" className="social-btn" style={{ background: 'rgba(255, 99, 71, 0.1)', color: '#ff6347', borderColor: 'rgba(255, 99, 71, 0.2)' }}>
            <LogOut size={16} />
            <span>Déconnexion</span>
          </Link>
        </div>
      </header>

      <main className="admin-grid">
        {!submissions || submissions.length === 0 ? (
          <div className="admin-card max-w-none p-12 text-center text-white/40">
            <Box size={48} className="mx-auto mb-4 opacity-20" />
            <p>Aucune inscription reçue pour le moment.</p>
          </div>
        ) : (
          submissions.map((sub: any) => (
            <div key={sub.id} className="admin-leak-card">
              <div className="admin-leak-header">
                <div className="admin-leak-user">
                  <div className="w-10 h-10 bg-aqua/10 rounded-full flex items-center justify-center text-aqua">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-white">{sub.full_name}</div>
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
