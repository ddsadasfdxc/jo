import { Box, Github, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-apple-gray-light/60 bg-white/50 py-16 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-apple-blue to-apple-purple text-white">
              <Box size={18} strokeWidth={2.5} />
            </div>
            <span className="text-base font-semibold text-apple-gray-dark">
              MAX 工具箱
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-apple-gray">
            <a href="#" className="transition-colors hover:text-apple-gray-dark">
              关于我们
            </a>
            <a href="#" className="transition-colors hover:text-apple-gray-dark">
              使用条款
            </a>
            <a href="#" className="transition-colors hover:text-apple-gray-dark">
              隐私政策
            </a>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-apple-gray-dark shadow-apple transition-all hover:shadow-apple-lg"
          >
            <Github size={18} />
            <span>GitHub</span>
          </a>
        </div>

        <div className="mt-10 text-center text-xs text-apple-gray/70">
          <p className="flex items-center justify-center gap-1">
            Made with <Heart size={12} className="text-apple-pink" /> by MAX Team · {currentYear}
          </p>
          <p className="mt-2">
            本站所有工具仅供学习交流使用，请遵守相关法律法规。
          </p>
        </div>
      </div>
    </footer>
  );
}
