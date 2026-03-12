import styles from './telework-summary.module.css'

type Props = {
  total: number
  remaining: number
}

export const TeleworkSummary = ({ total, remaining }: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.stat}>
        <span className={styles.value}>{total}</span>
        <span className={styles.label}>telework used</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.stat}>
        <span className={`${styles.value} ${remaining === 0 ? styles.zero : ''}`}>{remaining}</span>
        <span className={styles.label}>telework left</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.stat}>
        <span className={styles.value}>12</span>
        <span className={styles.label}>monthly limit</span>
      </div>
    </div>
  )
}
