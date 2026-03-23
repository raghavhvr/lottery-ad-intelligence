import styles from './SavedCards.module.css'

function FilterSnapshot({ filters, query }) {
  if (!filters) return null
  const pills = Object.entries(filters).flatMap(([, vals]) => vals)
  return (
    <div className={styles.snapshot}>
      {query && <div className={styles.snapshotQuery}>"{query}"</div>}
      <div className={styles.snapshotPills}>
        {pills.map((v, i) => (
          <span key={i} className={styles.snapshotPill}>{v}</span>
        ))}
      </div>
    </div>
  )
}

export function SavedCards({ saved, onClear }) {
  if (!saved.length) {
    return (
      <div className={styles.empty}>
        No saved results yet. Run the agent and click Save on any card.
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.count}>{saved.length} saved card{saved.length !== 1 ? 's' : ''}</span>
        <button className={styles.clearBtn} onClick={onClear}>Clear all</button>
      </div>

      {saved.map((r, i) => (
        <div key={i} className={styles.item}>
          <div className={styles.itemTop}>
            <div>
              <div className={styles.itemTitle}>{r.title || `${r.platform} · ${r.creativeType}`}</div>
              <div className={styles.itemMeta}>
                {r.platform} · {r.creativeType}
                {r.savedAt && (
                  <> · saved {new Date(r.savedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} {new Date(r.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                )}
              </div>
            </div>
            <span className={styles.badge}>{r.platform}</span>
          </div>

          {r.runTs && (
            <div className={styles.runTs}>
              Run on {new Date(r.runTs).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(r.runTs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}

          <FilterSnapshot filters={r.runFilters} query={r.runQuery} />

          {r.specs && (
            <div className={styles.specRow}>
              {r.specs.dimensions && <span className={styles.specChip}>{r.specs.dimensions}</span>}
              {r.specs.format && <span className={styles.specChip}>{r.specs.format}</span>}
              {r.specs.duration && r.specs.duration !== '—' && <span className={styles.specChip}>{r.specs.duration}</span>}
            </div>
          )}

          {r.powerTactic && (
            <div className={styles.tactic}>{r.powerTactic}</div>
          )}
        </div>
      ))}
    </div>
  )
}
