import { useState, useEffect } from 'react';
import { Box } from 'lucide-react';

export default function GlassNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-apple ${
        scrolled
          ? 'py-3 glass-strong shadow-apple'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 animate-in animate-delay-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-apple-blue to-apple-purple text-white shadow-glow-blue">
            <Box size={20} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-apple-gray-dark">
            MAX 工具箱
          </span>
        </div>

        <nav className="hidden items-center gap-1 rounded-full bg-white/60 p-1 shadow-apple backdrop-blur-md md:flex animate-in animate-delay-200">
          {['首页', '工具', '关于', '反馈'].map((item) => (
            <a
              key={item}
              href="#"
              className="rounded-full px-4 py-1.5 text-sm font-medium text-apple-gray-dark/80 transition-colors hover:bg-white hover:text-apple-gray-dark"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="animate-in animate-delay-300">
          <button className="rounded-full bg-apple-gray-dark px-5 py-2 text-sm font-medium text-white shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95">
            开始使用
          </button>
        </div>
      </div>
    </header>
  );
}
