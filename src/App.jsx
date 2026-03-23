import { useState, useEffect, useCallback } from 'react'
import { FilterPills } from './components/FilterPills'
import { ResultCard } from './components/ResultCard'
import { AgentLog } from './components/AgentLog'
import { SavedCards } from './components/SavedCards'
import { useFilters } from './hooks/useFilters'
import { useStorage } from './hooks/useStorage'
import { buildSearchQueries, runSearch, runGenerate } from './lib/agent'
import styles from './App.module.css'

const TABS = ['Results', 'Agent log', 'Saved']

export default function App() {
  const { filters, toggle } = useFilters()
  const { save, load, remove } = useStorage()
  const [customQuery, setCustomQuery] = useState('')
  const [results, setResults] = useState([])
  const [logs, setLogs] = useState([])
  const [saved, setSaved] = useState([])
  const [activeTab, setActiveTab] = useState('Results')
  const [status, setStatus] = useState({ text: 'Ready', mode: 'idle' })
  const [running, setRunning] = useState(false)

  useEffect(() => {
    const lastRun = load('last_run')
    if (lastRun?.results) setResults(lastRun.results)
    setSaved(load('saved_cards', []))
  }, [])

  const addLog = useCallback((msg, icon = '→') => {
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setLogs(prev => [...prev, { msg, icon, ts }])
  }, [])

  const runAgent = useCallback(async () => {
    if (running) return
    setRunning(true)
    setLogs([])
    setActiveTab('Agent log')
    setStatus({ text: 'Searching web…', mode: 'search' })

    addLog('Agent started', '▶')
    addLog('Building search queries from filters', '→')

    const queries = buildSearchQueries(filters)
    queries.forEach(q => addLog(`Search: "${q}"`, '⌕'))

    let searchContext = ''
    try {
      searchContext = await runSearch(queries, addLog)
    } catch (e) {
      addLog('Search failed: ' + e.message, '✗')
      searchContext = 'Search unavailable — using trained knowledge base only.'
    }

    setStatus({ text: 'Generating…', mode: 'live' })
    addLog('Sending to Gemini 2.5 Flash with live context…', '→')

    try {
      const newResults = await runGenerate(filters, searchContext, customQuery, addLog)
      setResults(newResults)
      save('last_run', { ts: new Date().toISOString(), results: newResults })
      addLog(`${newResults.length} results generated`, '✓')
      addLog('Saved to localStorage', '✓')
      setStatus({ text: 'Updated ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), mode: 'idle' })
      setActiveTab('Results')
    } catch (e) {
      addLog('Generation failed: ' + e.message, '✗')
      setStatus({ text: 'Error', mode: 'error' })
    }

    setRunning(false)
  }, [running, filters, customQuery, addLog, save])

  const saveCard = useCallback((result) => {
    const entry = { ...result, savedAt: new Date().toISOString() }
    const next = [entry, ...saved].slice(0, 30)
    setSaved(next)
    save('saved_cards', next)
    addLog('Card saved: ' + result.title, '✓')
  }, [saved, save, addLog])

  const clearSaved = useCallback(() => {
    setSaved([])
    remove('saved_cards')
  }, [remove])

  const statusClass = {
    idle: styles.statusIdle,
    live: styles.statusLive,
    search: styles.statusSearch,
    error: styles.statusError,
  }[status.mode] || styles.statusIdle

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.appTitle}>Lottery ad intelligence</h1>
          <p className={styles.appSub}>Middle East · Gemini 2.5 Flash + Serper · Persistent</p>
        </div>
        <div className={styles.headerRight}>
          <div className={`${styles.statusChip} ${statusClass}`}>
            <span className={styles.statusDot} />
            {status.text}
          </div>
          <button
            className={styles.runBtn}
            onClick={runAgent}
            disabled={running}
          >
            {running ? 'Running…' : 'Run agent →'}
          </button>
        </div>
      </header>

      <div className={styles.divider} />

      <FilterPills filters={filters} onToggle={toggle} />

      <div className={styles.queryRow}>
        <input
          type="text"
          className={styles.queryInput}
          placeholder="Optional: specific brief or angle (e.g. Ramadan campaign, jackpot countdown formats)…"
          value={customQuery}
          onChange={e => setCustomQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && runAgent()}
        />
      </div>

      <div className={styles.divider} />

      <div className={styles.tabs}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === 'Results' && results.length > 0 && (
              <span className={styles.tabBadge}>{results.length}</span>
            )}
            {tab === 'Saved' && saved.length > 0 && (
              <span className={styles.tabBadge}>{saved.length}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'Results' && (
        <div className={styles.resultsArea} id="results-area">
          {results.length === 0 ? (
            <div className={styles.empty}>
              Select your filters and hit <strong>Run agent</strong>.<br />
              It will search Serper for live data, then generate tailored creative specs via Gemini.
            </div>
          ) : (
            results.map((r, i) => (
              <ResultCard
                key={r.id || i}
                result={r}
                onSave={() => saveCard(r)}
                onDeepDive={() => console.log('Deep dive:', r)}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'Agent log' && <AgentLog logs={logs} />}

      {activeTab === 'Saved' && <SavedCards saved={saved} onClear={clearSaved} />}
    </div>
  )
}
