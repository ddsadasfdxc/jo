import express from 'express';
import cors from 'cors';
import { extract } from 'mebox-extractor';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

/**
 * Resolve a b23.tv short link to the real Bilibili URL.
 */
async function resolveBilibiliUrl(input: string): Promise<string> {
  const trimmed = input.trim();

  // Already a bilibili.com URL
  if (/bilibili\.com\/video\/(BV\w+)/.test(trimmed)) {
    return trimmed;
  }

  // b23.tv short link
  const b23Match = trimmed.match(/(https?:\/\/b23\.tv\/\w+)/);
  if (b23Match) {
    const shortUrl = b23Match[1];
    const response = await fetch(shortUrl, {
      method: 'HEAD',
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const location = response.headers.get('location');
    if (location) {
      return location.startsWith('http') ? location : `https:${location}`;
    }

    // Fallback: follow redirects
    const finalResponse = await fetch(shortUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    return finalResponse.url;
  }

  // BV id directly
  const bvMatch = trimmed.match(/(BV\w+)/);
  if (bvMatch) {
    return `https://www.bilibili.com/video/${bvMatch[1]}`;
  }

  throw new Error('无法识别链接格式，请输入 b23.tv、哔哩哔哩视频页或 BV 号');
}

app.post('/api/bilibili/parse', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: '缺少 url 参数' });
    }

    const resolvedUrl = await resolveBilibiliUrl(url);
    const result = await extract(resolvedUrl);

    return res.json({
      success: true,
      data: {
        title: result.title,
        description: result.description,
        thumbnail: result.thumbnail,
        duration: result.duration,
        bvid: result.videoId,
        url: result.url,
        previewURL: result.previewURL,
        downloadURL: result.downloadURL,
      },
    });
  } catch (error) {
    console.error('Parse error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '解析失败',
    });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`MAX toolbox API server running on port ${PORT}`);
});
