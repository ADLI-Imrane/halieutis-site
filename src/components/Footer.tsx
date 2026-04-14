import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-logo">
          <img src="/logo.png" alt="Halieutis Logo" />
          <span>Halieutis Club</span>
        </div>
        <p className="footer-text">
          © {new Date().getFullYear()} Halieutis Club - FST Tanger. Tous droits réservés.<br />
          Dédié à la science, la passion et la conservation de nos océans.
        </p>
        <div className="footer-links">
          <Link href="#about">À propos</Link>
          <Link href="#activites">Activités</Link>
          <Link href="#mission">Mission</Link>
          <Link href="#contact">Contact</Link>
          <Link href="/dashboard">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
