import { useState } from 'react'
import type { TeleworkDay, EventType } from '../../types/telework'
import styles from './telework-form.module.css'

type Props = {
  day?: TeleworkDay
  prefillDate?: string
  remaining: number
  onSubmit: (date: string, type: EventType, comment?: string) => void
  onClose: () => void
}

export const TeleworkForm = ({ day, prefillDate, remaining, onSubmit, onClose }: Props) => {
  const isEdit = Boolean(day)
  const initialDate = day ? day.date.slice(0, 10) : (prefillDate ?? '')
  const initialType: EventType = day?.type ?? 'TELEWORK'
  const initialComment = day?.comment ?? ''

  const [date, setDate] = useState(initialDate)
  const [type, setType] = useState<EventType>(initialType)
  const [comment, setComment] = useState(initialComment)

  const teleworkLimitReached = !isEdit && type === 'TELEWORK' && remaining === 0
  const canSubmit = !teleworkLimitReached

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !canSubmit) return
    onSubmit(date, type, comment || undefined)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{isEdit ? 'Edit Event' : 'Log Event'}</h2>

        {teleworkLimitReached && (
          <p className={styles.limitError}>
            You have reached the 12-day telework limit for this month.
          </p>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldLabel}>
            Event type
            <div className={styles.typeToggle}>
              <label className={`${styles.typeOption} ${type === 'TELEWORK' ? styles.typeActive : ''}`}>
                <input
                  type="radio"
                  name="eventType"
                  value="TELEWORK"
                  checked={type === 'TELEWORK'}
                  onChange={() => setType('TELEWORK')}
                  className={styles.radioHidden}
                />
                Telework
              </label>
              <label className={`${styles.typeOption} ${type === 'DAY_OFF' ? styles.typeActiveDayOff : ''}`}>
                <input
                  type="radio"
                  name="eventType"
                  value="DAY_OFF"
                  checked={type === 'DAY_OFF'}
                  onChange={() => setType('DAY_OFF')}
                  className={styles.radioHidden}
                />
                Day Off
              </label>
            </div>
          </div>

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
              placeholder={type === 'TELEWORK' ? 'Working from home on...' : 'Reason for day off...'}
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
