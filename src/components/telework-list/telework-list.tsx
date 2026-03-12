import type { TeleworkDay } from '../../types/telework'
import styles from './telework-list.module.css'

type Props = {
  days: TeleworkDay[]
  onEdit: (day: TeleworkDay) => void
  onDelete: (id: number) => void
}

const formatDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const TYPE_LABELS: Record<string, string> = {
  TELEWORK: 'Telework',
  DAY_OFF: 'Day Off',
}

export const TeleworkList = ({ days, onEdit, onDelete }: Props) => {
  if (days.length === 0) {
    return <p className={styles.empty}>No events logged this month.</p>
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this event?')) {
      onDelete(id)
    }
  }

  return (
    <ul className={styles.list}>
      {days.map((day) => (
        <li key={day.id} className={styles.item}>
          <div className={styles.info}>
            <div className={styles.dateRow}>
              <span className={styles.date}>{formatDate(day.date)}</span>
              <span className={`${styles.badge} ${day.type === 'DAY_OFF' ? styles.badgeDayOff : styles.badgeTelework}`}>
                {TYPE_LABELS[day.type] ?? day.type}
              </span>
            </div>
            {day.comment && <span className={styles.comment}>{day.comment}</span>}
          </div>
          <div className={styles.actions}>
            <button className={styles.editBtn} onClick={() => onEdit(day)}>
              Edit
            </button>
            <button className={styles.deleteBtn} onClick={() => handleDelete(day.id)}>
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
