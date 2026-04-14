import { Anchor, Droplets, Shield } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-content">
            <p className="section-label">Notre Héritage</p>
            <h2 className="section-title">Passionnément <em>Marin</em>, Résolument Scientifique</h2>
            <p className="section-body">
              Fondé au sein de la Faculté des Sciences et Techniques de Tanger, le Club Halieutis est une communauté dynamique d'étudiants unis par une mission commune : explorer, comprendre et protéger nos ressources marines.
            </p>
            <div className="about-badges">
              <div className="badge">
                <Anchor className="w-4 h-4" />
                <span>Expertise Halieutique</span>
              </div>
              <div className="badge">
                <Droplets className="w-4 h-4" />
                <span>Conservation Marine</span>
              </div>
              <div className="badge">
                <Shield className="w-4 h-4" />
                <span>Engagement Écologique</span>
              </div>
            </div>
          </div>
          <div className="about-visual">
            <div className="about-logo-wrap">
              <img src="/logo.png" alt="Logo Halieutis" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
