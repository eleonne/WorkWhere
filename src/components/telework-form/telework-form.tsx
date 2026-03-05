import { useState } from 'react'
import type { TeleworkDay } from '../../types/telework'
import styles from './telework-form.module.css'

type Props = {
  day?: TeleworkDay
  prefillDate?: string
  remaining: number
  onSubmit: (date: string, comment?: string) => void
  onClose: () => void
}

export const TeleworkForm = ({ day, prefillDate, remaining, onSubmit, onClose }: Props) => {
  const isEdit = Boolean(day)
  const initialDate = day ? day.date.slice(0, 10) : (prefillDate ?? '')
  const initialComment = day?.comment ?? ''

  const [date, setDate] = useState(initialDate)
  const [comment, setComment] = useState(initialComment)

  const canSubmit = isEdit || remaining > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !canSubmit) return
    onSubmit(date, comment || undefined)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{isEdit ? 'Edit Telework Day' : 'Log Telework Day'}</h2>

        {!isEdit && remaining === 0 && (
          <p className={styles.limitError}>
            You have reached the 12-day limit for this month.
          </p>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.fieldLabel}>
            Date
            <input
              type="date"
              className={styles.input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <label className={styles.fieldLabel}>
            Comment <span className={styles.optional}>(optional)</span>
            <textarea
              className={styles.textarea}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Working from home on..."
            />
          </label>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={!canSubmit}>
              {isEdit ? 'Save changes' : 'Log day'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
