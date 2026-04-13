import { Target, Users, Globe } from 'lucide-react';

export default function Mission() {
  const missions = [
    {
      num: "01",
      title: "Inclusion & Savoir",
      text: "Démocratiser l'accès aux connaissances halieutiques par des ateliers et des conférences de haut niveau."
    },
    {
      num: "02",
      title: "Communauté Unie",
      text: "Bâtir un réseau solide d'étudiants, d'experts et de passionnés pour agir ensemble pour l'océan."
    },
    {
      num: "03",
      title: "Impact Durable",
      text: "Réaliser des actions concrètes de conservation avec un impact mesurable sur nos côtes."
    }
  ];

  return (
    <section id="mission" className="mission">
      <div className="container">
        <div className="acts-header">
          <p className="section-label">Pourquoi nous ?</p>
          <h2 className="section-title">Une <em>Mission</em> Claire</h2>
        </div>
        <div className="mission-grid">
          {missions.map((m, i) => (
            <div key={i} className="mission-card">
              <div className="mission-num">{m.num}</div>
              <h3 className="mission-title">{m.title}</h3>
              <p className="mission-text">{m.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
