import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Activities from '@/components/Activities';
import Mission from '@/components/Mission';
import Join from '@/components/Join';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Halieutis Club - FST Tanger | Sciences Halieutiques & Conservation Marine',
  description: 'Le premier club estudiantin de la FST Tanger dédié aux sciences de la mer, à la pêche durable et à la protection de la biodiversité marine.',
  keywords: 'Halieutis, Club, FST Tanger, Sciences Halieutiques, Mer, Conservation Marine, Maroc, Océans',
};

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <About />
      <Activities />
      <Mission />
      <Join />
      <ContactForm />
      <Footer />
    </main>
  );
}
