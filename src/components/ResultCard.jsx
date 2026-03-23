import styles from './ResultCard.module.css'

const isArabic = str => /[\u0600-\u06FF]/.test(str)

export function ResultCard({ result, onSave, onDeepDive }) {
  const { title, platform, creativeType, specs, compliance, headlines, visualDirection, powerTactic, targeting, liveInsight } = result

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{title || `${platform} · ${creativeType}`}</h3>
          <p className={styles.meta}>{platform} · {creativeType}</p>
        </div>
        <div className={styles.badges}>
          <span className={styles.badgeBlue}>{platform}</span>
          <span className={styles.badgeGray}>{creativeType}</span>
          {headlines?.some(isArabic) && <span className={styles.badgeGreen}>Arabic</span>}
        </div>
      </div>

      {liveInsight && (
        <div className={styles.liveInsight}>
          <span className={styles.liveLabel}>Live insight</span> {liveInsight}
        </div>
      )}

      {specs && (
        <div className={styles.specGrid}>
          <div className={styles.specCell}>
            <div className={styles.specKey}>Dimensions</div>
            <div className={styles.specVal}>{specs.dimensions || '—'}</div>
          </div>
          <div className={styles.specCell}>
            <div className={styles.specKey}>File / format</div>
            <div className={styles.specVal}>{specs.fileSize || '—'} · {specs.format || '—'}</div>
          </div>
          <div className={styles.specCell}>
            <div className={styles.specKey}>Duration</div>
            <div className={styles.specVal}>{specs.duration || '—'}</div>
          </div>
        </div>
      )}

      {compliance && (
        <div className={styles.compliance}>
          <span className={styles.complianceLabel}>Compliance</span> {compliance}
        </div>
      )}

      {headlines?.length > 0 && (
        <div>
          <div className={styles.sectionLabel}>Headline suggestions</div>
          {headlines.map((h, i) => (
            <div key={i} className={styles.headline} dir={isArabic(h) ? 'rtl' : 'ltr'}>{h}</div>
          ))}
        </div>
      )}

      {visualDirection && (
        <div>
          <div className={styles.sectionLabel}>Visual direction</div>
          <p className={styles.body}>{visualDirection}</p>
        </div>
      )}

      {targeting && (
        <div className={styles.specGrid}>
          <div className={styles.specCell}>
            <div className={styles.specKey}>Age range</div>
            <div className={styles.specVal}>{targeting.age || '—'}</div>
          </div>
          <div className={styles.specCell}>
            <div className={styles.specKey}>Languages</div>
            <div className={styles.specVal}>{targeting.languages || '—'}</div>
          </div>
          <div className={styles.specCell}>
            <div className={styles.specKey}>Geo notes</div>
            <div className={styles.specVal}>{targeting.geoNotes || '—'}</div>
          </div>
        </div>
      )}

      {powerTactic && (
        <div className={styles.powerTactic}>
          <div className={styles.powerLabel}>Power tactic</div>
          <div className={styles.powerBody}>{powerTactic}</div>
        </div>
      )}

      <div className={styles.footer}>
        <span className={styles.timestamp}>Generated {new Date().toLocaleString()}</span>
        <div className={styles.actions}>
          <button className={styles.btnSecondary} onClick={onSave}>Save</button>
          <button className={styles.btnPrimary} onClick={onDeepDive}>Deep dive →</button>
        </div>
      </div>
    </div>
  )
}
