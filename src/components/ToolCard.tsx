import {
  Play,
  Smartphone,
  UtensilsCrossed,
  QrCode,
  ShieldCheck,
  ArrowLeftRight,
  Smile,
  Sparkles,
  LucideIcon,
} from 'lucide-react';
import { Tool } from '@/data/tools';

const iconMap: Record<string, LucideIcon> = {
  Play,
  Smartphone,
  UtensilsCrossed,
  QrCode,
  ShieldCheck,
  ArrowLeftRight,
  Smile,
  Sparkles,
};

interface ToolCardProps {
  tool: Tool;
  index: number;
  onClick?: () => void;
}

export default function ToolCard({ tool, index, onClick }: ToolCardProps) {
  const Icon = iconMap[tool.icon] || Sparkles;

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-apple bg-apple-card p-6 shadow-apple transition-all duration-500 ease-apple hover:-translate-y-2 hover:shadow-apple-hover animate-in"
      style={{ animationDelay: `${index * 80 + 200}ms` }}
    >
      {/* Background gradient glow */}
      <div
        className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${tool.gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30`}
      />

      {/* Badge */}
      {tool.badge && (
        <span className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-apple-blue/10 to-apple-purple/10 px-2.5 py-1 text-xs font-semibold text-apple-blue">
          {tool.badge}
        </span>
      )}

      {/* Icon */}
      <div
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.gradient} text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
      >
        <Icon size={26} strokeWidth={2} />
      </div>

      {/* Content */}
      <h3 className="mb-2 text-xl font-semibold tracking-tight text-apple-gray-dark">
        {tool.name}
      </h3>
      <p className="text-sm leading-relaxed text-apple-gray">
        {tool.description}
      </p>

      {/* Hover arrow */}
      <div className="mt-5 flex items-center gap-2 text-sm font-medium text-apple-gray-dark/0 transition-all duration-300 group-hover:text-apple-blue">
        <span>打开工具</span>
        <svg
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </div>
  );
}
