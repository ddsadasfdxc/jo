import { ArrowDown, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0 mesh-gradient" />
      <div className="pointer-events-none absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-apple-blue/20 blur-[120px] animate-pulse-slow" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-[600px] w-[600px] rounded-full bg-apple-purple/20 blur-[140px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="pointer-events-none absolute left-1/3 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-apple-pink/15 blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 shadow-apple backdrop-blur-md animate-in animate-delay-100">
          <Sparkles size={16} className="text-apple-blue" />
          <span className="text-sm font-medium text-apple-gray-dark/80">
            二次元风格 × Apple 级审美
          </span>
        </div>

        <h1 className="mt-8 text-balance text-5xl font-semibold tracking-tight text-apple-gray-dark sm:text-6xl md:text-7xl lg:text-8xl animate-in animate-delay-200">
          <span className="block">MAX 工具箱</span>
          <span className="mt-2 block bg-gradient-to-r from-apple-blue via-apple-purple to-apple-pink bg-clip-text text-transparent">
            畅爽每一刻
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-apple-gray sm:text-xl animate-in animate-delay-300">
          把 Bilibili 解析、抖音去水印、今天吃啥等有趣工具，装进一个流畅精美的主页。
          <br className="hidden sm:block" />
          少一点选择困难，多一点生活乐趣。
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-in animate-delay-400">
          <button className="group relative overflow-hidden rounded-full bg-apple-gray-dark px-8 py-4 text-base font-medium text-white shadow-apple-lg transition-all duration-300 hover:shadow-apple-hover hover:scale-105 active:scale-95">
            <span className="relative z-10">探索工具</span>
            <div className="absolute inset-0 -z-0 bg-gradient-to-r from-apple-blue to-apple-purple opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </button>
          <button className="rounded-full border border-apple-gray-light bg-white/80 px-8 py-4 text-base font-medium text-apple-gray-dark shadow-apple backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-apple-lg active:scale-95">
            查看源码
          </button>
        </div>

        <div className="mt-20 animate-in animate-delay-600">
          <a
            href="#tools"
            className="inline-flex flex-col items-center gap-2 text-sm font-medium text-apple-gray transition-colors hover:text-apple-gray-dark"
          >
            <span>向下滚动</span>
            <ArrowDown size={20} className="animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
}
