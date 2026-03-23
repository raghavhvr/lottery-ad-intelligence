import { GoogleGenerativeAI } from '@google/generative-ai'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!process.env.GEMINI_API_KEY) {
    return res.status(400).json({ error: 'GEMINI_API_KEY not set in Vercel environment variables' })
  }

  const { systemPrompt, userPrompt } = req.body

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const fullPrompt = `${systemPrompt}

CRITICAL: Your entire response must be a single valid JSON array. Start with [ and end with ]. No markdown, no code fences, no explanation text before or after. Just the raw JSON array.

${userPrompt}`

    const result = await model.generateContent(fullPrompt)
    let text = result.response.text()

    // Strip any markdown fences Gemini adds despite instructions
    text = text.trim()
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    }

    // Find the JSON array boundaries in case there's surrounding text
    const start = text.indexOf('[')
    const end = text.lastIndexOf(']')
    if (start !== -1 && end !== -1 && end > start) {
      text = text.slice(start, end + 1)
    }

    // Validate it parses before sending to client
    JSON.parse(text)

    res.json({ text })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
