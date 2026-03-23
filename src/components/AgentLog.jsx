import styles from './AgentLog.module.css'

export function AgentLog({ logs }) {
  if (!logs.length) {
    return <div className={styles.empty}>Agent log will appear here when you run.</div>
  }
  return (
    <div className={styles.log}>
      {logs.map((entry, i) => (
        <div key={i} className={styles.line}>
          <span className={styles.icon}>{entry.icon}</span>
          <span className={styles.ts}>{entry.ts}</span>
          <span className={styles.msg}>{entry.msg}</span>
        </div>
      ))}
    </div>
  )
}
