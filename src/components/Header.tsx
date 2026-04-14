import Link from 'next/link';

export default function Header() {
  return (
    <nav>
      <div className="nav-brand">
        <img className="nav-logo-img" src="/logo.png" alt="Halieutis Logo" />
        <span className="nav-name">Halieutis</span>
      </div>
      <div className="nav-links">
        <Link href="#about">À propos</Link>
        <Link href="#activites">Activités</Link>
        <Link href="#mission">Mission</Link>
        <Link href="#rejoindre">Rejoindre</Link>
        <Link href="#contact">Contact</Link>
        <a href="mailto:halieutis.club.fstt@gmail.com" className="nav-cta">Nous écrire</a>
      </div>
    </nav>
  );
}
