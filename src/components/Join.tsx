export default function Join() {
  return (
    <section id="rejoindre" className="rejoindre">
      <div className="container">
        <div className="rejoindre-grid">
          <div className="rejoindre-info">
            <p className="section-label">Faire partie de l'aventure</p>
            <h2 className="section-title">Prêt à <em>Embarquer</em> avec Nous ?</h2>
            <div className="steps">
              <div className="step">
                <div className="step-num">1</div>
                <div className="step-text">
                  <h4>Inscrivez-vous</h4>
                  <p>Remplissez le formulaire de pré-inscription en ligne pour nous faire part de votre intérêt.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <div className="step-text">
                  <h4>Entretien</h4>
                  <p>Rencontrez notre bureau pour discuter de vos motivations et de ce que vous pouvez apporter.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <div className="step-text">
                  <h4>Intégration</h4>
                  <p>Bienvenue à bord ! Participez à votre première mission officielle en tant qu'Explorateur.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="rejoindre-card">
            <div className="join-card">
              <span className="stat-n">2026</span>
              <p>Rejoignez la promotion de cette année et devenez un gardien de nos écosystèmes marins.</p>
              <a href="#contact" className="btn-p">Commencer l'inscription</a>
              <p className="join-highlight">Ouvert à tous les étudiants de la FST Tanger</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
