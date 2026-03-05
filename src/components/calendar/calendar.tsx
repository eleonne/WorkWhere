import type { TeleworkDay } from '../../types/telework'
import styles from './calendar.module.css'

type Props = {
  currentMonth: string
  days: TeleworkDay[]
  onDayClick: (date: string, teleworkDay: TeleworkDay | null) => void
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const toDateKey = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const buildGrid = (month: string): (Date | null)[] => {
  const [year, m] = month.split('-').map(Number)
  const firstDay = new Date(year, m - 1, 1)
  const lastDay = new Date(year, m, 0)

  // Monday = 0, Sunday = 6 (ISO week)
  const startOffset = (firstDay.getDay() + 6) % 7

  const grid: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) grid.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) grid.push(new Date(year, m - 1, d))

  return grid
}

export const Calendar = ({ currentMonth, days, onDayClick }: Props) => {
  const grid = buildGrid(currentMonth)
  const teleworkMap = new Map(days.map((d) => [d.date.slice(0, 10), d]))

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {WEEKDAYS.map((wd) => (
          <div key={wd} className={styles.weekday}>
            {wd}
          </div>
        ))}
        {grid.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className={styles.empty} />
          const key = toDateKey(date)
          const teleworkDay = teleworkMap.get(key) ?? null
          return (
            <button
              key={key}
              className={`${styles.day} ${teleworkDay ? styles.telework : ''}`}
              onClick={() => onDayClick(key, teleworkDay)}
              title={teleworkDay?.comment ?? undefined}
            >
              <span className={styles.dayNumber}>{date.getDate()}</span>
              {teleworkDay && <span className={styles.dot} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
