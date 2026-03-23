const API = '/api'

export function buildSearchQueries(filters) {
  const brands = filters.brand.has('all')
    ? ['Big Ticket Abu Dhabi', 'UAE Lottery', 'Mahzooz', 'Dubai Duty Free']
    : [...filters.brand]
  const markets = [...filters.market]
  const queries = []
  brands.forEach(b => queries.push(`${b} lottery advertising ${markets[0]} 2025 2026`))
  ;[...filters.platform].forEach(p => queries.push(`lottery ad creative specs ${p} Middle East 2026`))
  if (filters.focus.has('trends')) queries.push('lottery advertising trends Middle East 2026')
  queries.push('GCGRA UAE gaming regulation advertising 2025 2026')
  const seasons = [...filters.season].filter(s => s !== 'evergreen')
  if (seasons.length) queries.push(`lottery advertising ${seasons.join(' ')} Middle East campaign 2026`)
  return [...new Set(queries)].slice(0, 5)
}

export async function runSearch(queries, onLog) {
  onLog('Sending ' + queries.length + ' queries to Serper...', 'search')
  const res = await fetch(API + '/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ queries }),
  })
  const data = await res.json()
  onLog('Search complete -- ' + Math.round((data.results?.length || 0) / 100) * 100 + ' chars retrieved', 'check')
  return data.results || ''
}

export async function runGenerate(filters, searchContext, customQuery, onLog) {
  const p = [...filters.platform].join(', ')
  const t = [...filters.type].join(', ')
  const m = [...filters.market].join(', ')
  const b = filters.brand.has('all') ? 'all major ME lottery brands' : [...filters.brand].join(', ')
  const f = [...filters.focus].join(', ')
  const l = [...filters.lang].join(', ')
  const s = [...filters.season].join(', ')

  const systemPrompt = `You are a senior digital advertising strategist specialising in lottery and prize-draw brands in the Middle East.

KNOWLEDGE BASE:
- Big Ticket Abu Dhabi: est. 1992, AED 500/ticket, monthly draws at Zayed International Airport, 249K Instagram followers, dream car prizes
- The UAE Lottery: GCGRA-licensed Dec 2024, operated by The Game LLC, AED 50 Lucky Day tickets, scratch cards AED 5-50, first AED 100M jackpot Oct 2025
- Mahzooz: EWINGS operator, AED 35 entry via Al Emarat water bottle, weekly Saturday draws 9pm, Sharia-compliant
- Emirates Draw: MEGA7/EASY6 formats, paused UAE lottery ops Jan 2025
- Dubai Duty Free Millennium Millionaire: airport-based, international reach

PLATFORM POLICIES:
- Meta: requires gambling authorisation via Meta Business Suite, GCGRA licence proof required, no targeting under 18
- Google Ads: offline gambling blocked in UAE, KSA, Kuwait, Qatar, Egypt, Jordan, Oman
- TikTok: does not allow gambling/lottery ads in MENA
- Snapchat: lottery ads permitted with prior approval in UAE

CRITICAL OUTPUT RULE: Return ONLY a raw JSON array. No markdown. No code fences. No explanation. Start your response with [ and end with ]. Nothing before the [ and nothing after the ].

Each object in the array must have these exact keys:
- id: short kebab-case slug
- platform: string
- creativeType: string
- title: string max 8 words
- specs: object with keys dimensions, fileSize, duration, format
- compliance: string 1-2 sentences
- headlines: array of exactly 3 strings, include Arabic if market includes UAE/GCC/MENA
- visualDirection: string 2-3 sentences
- powerTactic: string 1-2 sentences
- targeting: object with keys age, interests, languages, geoNotes
- liveInsight: string 1 sentence from the search results`

  const userPrompt = `LIVE SEARCH RESULTS:
${searchContext}

---
Generate creative ad intelligence for:
- Platforms: ${p}
- Creative types: ${t}
- Markets: ${m}
- Brands: ${b}
- Languages: ${l}
- Season/moment: ${s}
- Output focus: ${f}
${customQuery ? `- Specific brief: ${customQuery}` : ''}

Produce one result object per platform + creativeType combination. Today is March 2026.

Remember: respond with ONLY the JSON array, starting with [ and ending with ]. No other text.`

  onLog('Sending to Gemini 2.5 Flash...', 'arrow')

  const res = await fetch(API + '/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userPrompt }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Generate request failed')
  }

  const data = await res.json()
  const raw = data.text || ''

  onLog('Response received -- parsing JSON...', 'arrow')

  if (!raw || !raw.trim()) throw new Error('Empty response from Gemini')

  let cleaned = raw.trim()
  // Strip any markdown fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  // Extract outermost JSON array
  const start = cleaned.indexOf('[')
  const end = cleaned.lastIndexOf(']')
  if (start !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1)
  }

  let results
  try {
    results = JSON.parse(cleaned)
  } catch (e) {
    onLog('Parse error: ' + e.message, 'error')
    onLog('Raw preview: ' + cleaned.slice(0, 200), 'error')
    throw new Error('Could not parse JSON -- check Agent log for the raw response')
  }

  if (!Array.isArray(results) || !results.length) {
    throw new Error('Response was valid JSON but not an array')
  }

  return results
}
