import { categories, ToolCategory } from '@/data/tools';

interface CategoryFilterProps {
  active: ToolCategory;
  onChange: (category: ToolCategory) => void;
}

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 animate-in animate-delay-200">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onChange(category.id)}
          className={`relative rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
            active === category.id
              ? 'bg-apple-gray-dark text-white shadow-lg'
              : 'bg-white/70 text-apple-gray-dark/70 shadow-apple backdrop-blur-sm hover:bg-white hover:text-apple-gray-dark hover:shadow-apple-lg'
          }`}
        >
          {category.label}
          {active === category.id && (
            <span className="absolute inset-0 -z-10 rounded-full bg-apple-gray-dark" />
          )}
        </button>
      ))}
    </div>
  );
}
