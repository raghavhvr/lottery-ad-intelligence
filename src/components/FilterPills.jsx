import { FILTER_GROUPS } from '../lib/filters'
import styles from './FilterPills.module.css'

export function FilterPills({ filters, onToggle }) {
  return (
    <div className={styles.wrapper}>
      {FILTER_GROUPS.map(group => (
        <div key={group.key} className={styles.row}>
          <span className={styles.label}>{group.label}</span>
          <div className={styles.pills}>
            {group.options.map(opt => (
              <button
                key={opt.value}
                className={`${styles.pill} ${filters[group.key]?.has(opt.value) ? styles.active : ''}`}
                onClick={() => onToggle(group.key, opt.value)}
              >
                <span className={styles.dot} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
