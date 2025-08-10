export default async function handler(req, res) {
  // Basic CORS headers (just in case)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');

    // Default model — DeepSeek via OpenRouter (free)
    const model = body.model || 'deepseek/deepseek-chat:free';

    const payload = {
      ...body,
      model,
      stream: false
    };

    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vercel.app',
        'X-Title': 'DeepSeek Proxy via Vercel'
      },
      body: JSON.stringify(payload)
    });

    // Forward the response as-is
    res.status(r.status);
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json');
    const buf = await r.arrayBuffer();
    return res.end(Buffer.from(buf));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Proxy error', details: String(err) });
  }
}
