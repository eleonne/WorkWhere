import styles from './month-selector.module.css'

type Props = {
  currentMonth: string
  onMonthChange: (month: string) => void
}

const addMonths = (month: string, delta: number): string => {
  const [year, m] = month.split('-').map(Number)
  const date = new Date(year, m - 1 + delta, 1)
  const y = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${mo}`
}

const formatLabel = (month: string): string => {
  const [year, m] = month.split('-').map(Number)
  return new Date(year, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export const MonthSelector = ({ currentMonth, onMonthChange }: Props) => {
  return (
    <div className={styles.container}>
      <button className={styles.btn} onClick={() => onMonthChange(addMonths(currentMonth, -1))}>
        ‹
      </button>
      <span className={styles.label}>{formatLabel(currentMonth)}</span>
      <button className={styles.btn} onClick={() => onMonthChange(addMonths(currentMonth, 1))}>
        ›
      </button>
    </div>
  )
}
