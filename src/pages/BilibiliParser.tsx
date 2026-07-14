import { useState } from 'react';
import { ArrowLeft, Copy, Download, ExternalLink, Loader2, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ParseResult {
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  bvid: string;
  url: string;
  previewURL: string;
  downloadURL: string;
}

export default function BilibiliParser() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiBase}/api/bilibili/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const json = await response.json();
      if (!json.success) {
        throw new Error(json.error || '解析失败');
      }
      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <main className="min-h-screen bg-apple-bg">
      <div className="container mx-auto px-4 py-16">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-apple-gray transition-colors hover:text-apple-gray-dark"
        >
          <ArrowLeft size={18} />
          返回首页
        </Link>

        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg">
            <Play size={32} strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-apple-gray-dark sm:text-4xl">
            Bilibili 视频解析
          </h1>
          <p className="mt-3 text-apple-gray">
            粘贴 b23.tv 短链或 bilibili.com 视频链接，获取视频信息与下载直链
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <form onSubmit={handleSubmit} className="overflow-hidden rounded-apple bg-white p-2 shadow-apple">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="例如：https://b23.tv/C0hi4Yx"
                className="flex-1 rounded-xl border-0 bg-apple-bg px-5 py-3.5 text-apple-gray-dark placeholder:text-apple-gray/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-apple-blue/20"
              />
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-apple-gray-dark px-6 py-3.5 font-medium text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {loading ? '解析中...' : '开始解析'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-5 py-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-8 overflow-hidden rounded-apple bg-white shadow-apple animate-in">
              <div className="aspect-video w-full overflow-hidden bg-apple-bg">
                <img
                  src={result.thumbnail}
                  alt={result.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-apple-gray-dark">{result.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-apple-gray">{result.description}</p>

                <div className="mt-5 flex flex-wrap gap-3 text-sm">
                  <span className="rounded-full bg-apple-bg px-3 py-1 text-apple-gray-dark">
                    BV号：{result.bvid}
                  </span>
                  <span className="rounded-full bg-apple-bg px-3 py-1 text-apple-gray-dark">
                    时长：{formatDuration(result.duration)}
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="rounded-xl bg-apple-bg p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-apple-gray-dark">下载直链（默认 360P）</span>
                      <button
                        onClick={() => copyToClipboard(result.downloadURL)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-apple-blue transition-colors hover:text-apple-blue/80"
                      >
                        <Copy size={14} />
                        {copied ? '已复制' : '复制'}
                      </button>
                    </div>
                    <a
                      href={result.downloadURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-xs text-apple-gray hover:text-apple-blue hover:underline"
                    >
                      {result.downloadURL}
                    </a>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a
                      href={result.downloadURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-apple-gray-dark py-3 font-medium text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Download size={18} />
                      下载视频
                    </a>
                    <a
                      href={result.previewURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3 font-medium text-apple-gray-dark shadow-apple transition-all hover:shadow-apple-lg"
                    >
                      <Play size={18} />
                      在线预览
                    </a>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3 font-medium text-apple-gray-dark shadow-apple transition-all hover:shadow-apple-lg"
                    >
                      <ExternalLink size={18} />
                      访问 B 站
                    </a>
                  </div>
                </div>

                <p className="mt-4 text-xs text-apple-gray/70">
                  提示：下载直链含有效期，建议尽快下载；高画质需要登录 Cookie，当前为公开可获取的默认画质。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
