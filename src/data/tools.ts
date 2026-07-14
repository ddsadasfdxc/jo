export type ToolCategory = 'all' | 'video' | 'life' | 'utility' | 'fun';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: Exclude<ToolCategory, 'all'>;
  icon: string;
  color: string;
  gradient: string;
  badge?: string;
}

export const categories: { id: ToolCategory; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'video', label: '视频' },
  { id: 'life', label: '生活' },
  { id: 'utility', label: '效率' },
  { id: 'fun', label: '趣味' },
];

export const tools: Tool[] = [
  {
    id: 'bilibili',
    name: 'Bilibili 解析',
    description: '一键解析 B 站视频，提取封面、标题与播放链接',
    category: 'video',
    icon: 'Play',
    color: '#FF2D55',
    gradient: 'from-rose-400 to-pink-500',
    badge: '热门',
  },
  {
    id: 'douyin',
    name: '抖音解析',
    description: '去除水印，快速下载抖音无水印视频',
    category: 'video',
    icon: 'Smartphone',
    color: '#1D1D1F',
    gradient: 'from-zinc-700 to-zinc-900',
  },
  {
    id: 'eat-today',
    name: '今天吃啥',
    description: '选择困难症克星，随机推荐今日菜单',
    category: 'life',
    icon: 'UtensilsCrossed',
    color: '#FF9500',
    gradient: 'from-amber-400 to-orange-500',
    badge: '治愈',
  },
  {
    id: 'qrcode',
    name: '二维码生成',
    description: '将任意文本或链接转换为高清二维码',
    category: 'utility',
    icon: 'QrCode',
    color: '#34C759',
    gradient: 'from-emerald-400 to-green-500',
  },
  {
    id: 'password',
    name: '强密码生成',
    description: '生成高强度随机密码，支持自定义长度',
    category: 'utility',
    icon: 'ShieldCheck',
    color: '#5856D6',
    gradient: 'from-indigo-400 to-violet-500',
  },
  {
    id: 'converter',
    name: '单位换算',
    description: '长度、重量、温度、汇率快速换算',
    category: 'utility',
    icon: 'ArrowLeftRight',
    color: '#0071E3',
    gradient: 'from-sky-400 to-blue-500',
  },
  {
    id: 'meme',
    name: '表情包合成',
    description: '一键生成热门表情包，斗图不求人',
    category: 'fun',
    icon: 'Smile',
    color: '#5AC8FA',
    gradient: 'from-cyan-400 to-teal-500',
  },
  {
    id: 'name-generator',
    name: '二次元取名',
    description: '根据关键词生成专属二次元风格昵称',
    category: 'fun',
    icon: 'Sparkles',
    color: '#AF52DE',
    gradient: 'from-purple-400 to-fuchsia-500',
  },
];
