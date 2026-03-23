import styles from './SavedCards.module.css'

export function SavedCards({ saved, onClear }) {
  if (!saved.length) {
    return <div className={styles.empty}>No saved results yet. Run the agent and save individual cards.</div>
  }
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.count}>{saved.length} saved result{saved.length !== 1 ? 's' : ''}</span>
        <button className={styles.clearBtn} onClick={onClear}>Clear all</button>
      </div>
      {saved.map((r, i) => (
        <div key={i} className={styles.item}>
          <div>
            <div className={styles.itemTitle}>{r.title || `${r.platform} · ${r.creativeType}`}</div>
            <div className={styles.itemMeta}>
              {r.platform} · {r.creativeType} · {new Date(r.savedAt).toLocaleDateString()}
            </div>
          </div>
          <div className={styles.itemBadges}>
            <span className={styles.badge}>{r.platform}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
