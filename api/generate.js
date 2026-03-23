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
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    })
    const result = await model.generateContent(userPrompt)
    const text = result.response.text()
    res.json({ text })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
