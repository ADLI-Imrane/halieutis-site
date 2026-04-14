'use client'

import { useEffect, useRef } from 'react';
import { GraduationCap, ArrowRight, Play } from 'lucide-react';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    const createParticle = () => {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 3 + 1;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${Math.random() * 100}%`;
      p.style.animationDuration = `${Math.random() * 3 + 2}s`;
      p.style.opacity = (Math.random() * 0.5 + 0.2).toString();
      container.appendChild(p);
      
      setTimeout(() => p.remove(), 5000);
    };

    const interval = setInterval(createParticle, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero">
      <div className="hero-particles" ref={containerRef}></div>
      
      <div className="hero-fst-wrapper">
        <img className="hero-fst-logo" src="/fst-logo.png" alt="FST Tanger Logo" />
      </div>
      <img className="hero-logo" src="/logo.png" alt="Halieutis Logo" />
      
      <div className="hero-univ">
        <GraduationCap className="w-5 h-5 text-aqua" />
        <span>FST - Université Abdelmalek Essaâdi</span>
      </div>

      <div className="hero-tag">Explorateurs des Océans</div>
      
      <h1>Halieutis <em>Club</em></h1>
      
      <p className="hero-desc">
        Le premier club estudiantin dédié aux sciences halieutiques et à la protection des écosystèmes marins.
      </p>

      <div className="hero-btns">
        <a href="#about" className="btn-p">Découvrir le club</a>
        <a href="#contact" className="btn-o">Nous rejoindre</a>
      </div>

      <div className="hero-stats">
        <div className="stat">
          <span className="stat-n">150+</span>
          <span className="stat-l">Membres Actifs</span>
        </div>
        <div className="stat">
          <span className="stat-n">12+</span>
          <span className="stat-l">Projets Annuels</span>
        </div>
        <div className="stat">
          <span className="stat-n">05</span>
          <span className="stat-l">Partenaires</span>
        </div>
      </div>

      <div className="hero-waves">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#0d2a47" fillOpacity="1" d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,186.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
}
