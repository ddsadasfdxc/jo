import GlassNavbar from '@/components/GlassNavbar';
import Hero from '@/components/Hero';
import ToolGrid from '@/components/ToolGrid';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-apple-bg">
      <GlassNavbar />
      <Hero />
      <ToolGrid />
      <Footer />
    </main>
  );
}
