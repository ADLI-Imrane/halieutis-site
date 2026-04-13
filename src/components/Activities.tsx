import { Beaker, Compass, Ship, Shell } from 'lucide-react';

export default function Activities() {
  const acts = [
    {
      icon: <Beaker className="w-8 h-8 text-aqua" />,
      title: "Recherche Scientifique",
      desc: "Étude des populations de poissons et analyse de la qualité de l'eau dans la région Nord."
    },
    {
      icon: <Compass className="w-8 h-8 text-aqua" />,
      title: "Sorties de Terrain",
      desc: "Exploration des zones côtières et des ports pour comprendre les enjeux du secteur halieutique."
    },
    {
      icon: <Ship className="w-8 h-8 text-aqua" />,
      title: "Sorties en Bateau",
      desc: "Initiation aux techniques de navigation et observation directe de la vie marine."
    },
    {
      icon: <Shell className="w-8 h-8 text-aqua" />,
      title: "Biodiversité Marine",
      desc: "Sensibilisation et protection des espèces endémiques de la Méditerranée et de l'Atlantique."
    }
  ];

  return (
    <section id="activites" className="activites">
      <div className="container">
        <div className="acts-header">
          <p className="section-label">Nos Actions</p>
          <h2 className="section-title">Engagés sur tous les <em>Fronts</em></h2>
          <p className="section-body">
            Nous combinons rigueur scientifique et passion pour offrir des expériences uniques à nos membres.
          </p>
        </div>
        <div className="acts-grid">
          {acts.map((act, index) => (
            <div key={index} className="act-card">
              <div className="act-icon">{act.icon}</div>
              <h3 className="act-title">{act.title}</h3>
              <p className="act-desc">{act.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
