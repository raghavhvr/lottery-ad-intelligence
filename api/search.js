export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { queries } = req.body

  if (!process.env.SERPER_API_KEY) {
    return res.json({ results: '[SERPER_API_KEY not set in Vercel environment variables]' })
  }

  try {
    const results = await Promise.all(
      (queries || []).slice(0, 5).map(async q => {
        const r = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': process.env.SERPER_API_KEY,
          },
          body: JSON.stringify({ q, num: 5, gl: 'ae', hl: 'en' }),
        })
        if (!r.ok) return `Search failed for: ${q}`
        const data = await r.json()
        const organic = (data.organic || [])
          .map(item => `• ${item.title}: ${item.snippet}`)
          .join('\n')
        const topStories = (data.topStories || [])
          .map(item => `• [news] ${item.title}`)
          .join('\n')
        return [organic, topStories].filter(Boolean).join('\n')
      })
    )
    res.json({ results: results.join('\n\n') })
  } catch (err) {
    res.json({ results: `Search error: ${err.message}` })
  }
}
