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

export const TeleworkList = ({ days, onEdit, onDelete }: Props) => {
  if (days.length === 0) {
    return <p className={styles.empty}>No telework days logged this month.</p>
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this telework day?')) {
      onDelete(id)
    }
  }

  return (
    <ul className={styles.list}>
      {days.map((day) => (
        <li key={day.id} className={styles.item}>
          <div className={styles.info}>
            <span className={styles.date}>{formatDate(day.date)}</span>
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
