import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { tools, ToolCategory } from '@/data/tools';
import CategoryFilter from './CategoryFilter';
import ToolCard from './ToolCard';

export default function ToolGrid() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');
  const navigate = useNavigate();

  const filteredTools = useMemo(() => {
    if (activeCategory === 'all') return tools;
    return tools.filter((tool) => tool.category === activeCategory);
  }, [activeCategory]);

  const handleToolClick = (toolId: string) => {
    if (toolId === 'bilibili') {
      navigate('/tool/bilibili');
    } else {
      alert(`「${tools.find((t) => t.id === toolId)?.name}」功能开发中，敬请期待！`);
    }
  };

  return (
    <section id="tools" className="relative py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-apple-gray-dark sm:text-4xl animate-in animate-delay-100">
            精选工具
          </h2>
          <p className="mt-4 text-apple-gray animate-in animate-delay-200">
            8 个实用又有趣的小工具，持续更新中
          </p>
        </div>

        <div className="mb-12">
          <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTools.map((tool, index) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              index={index}
              onClick={() => handleToolClick(tool.id)}
            />
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="py-20 text-center text-apple-gray animate-in">
            <p>该分类下暂时没有工具</p>
          </div>
        )}
      </div>
    </section>
  );
}
