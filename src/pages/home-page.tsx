import { useState, useEffect, useCallback } from 'react'
import type { TeleworkDay, TeleworkMonthData, EventType } from '../types/telework'
import { fetchTeleworkDays, createTeleworkDay, updateTeleworkDay, deleteTeleworkDay } from '../services/telework-api'
import { fetchCurrentUser } from '../services/auth-api'
import type { UserInfo } from '../services/auth-api'
import { requestNotificationPermission, showNotification } from '../services/notifications'
import { MonthSelector } from '../components/month-selector/month-selector'
import { TeleworkSummary } from '../components/telework-summary/telework-summary'
import { Calendar } from '../components/calendar/calendar'
import { TeleworkForm } from '../components/telework-form/telework-form'
import { TeleworkList } from '../components/telework-list/telework-list'
import { UserBadge } from '../components/user-badge/user-badge'
import styles from './home-page.module.css'

const todayMonth = (): string => {
  const now = new Date()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${now.getFullYear()}-${m}`
}

export const HomePage = () => {
  const [currentMonth, setCurrentMonth] = useState(todayMonth)
  const [data, setData] = useState<TeleworkMonthData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    void fetchCurrentUser().then(setUser)
    void requestNotificationPermission()
  }, [])

  // null = closed | string = add mode (prefill date) | TeleworkDay = edit mode
  const [formState, setFormState] = useState<TeleworkDay | string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchTeleworkDays(currentMonth)
      setData(result)
    } catch {
      setError('Failed to load telework data.')
    } finally {
      setIsLoading(false)
    }
  }, [currentMonth])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleDayClick = (date: string, teleworkDay: TeleworkDay | null) => {
    setFormState(teleworkDay ?? date)
  }

  const handleFormSubmit = async (date: string, type: EventType, comment?: string) => {
    try {
      const isEdit = formState !== null && typeof formState === 'object'
      if (isEdit && typeof formState === 'object') {
        await updateTeleworkDay(formState.id, { date, type, comment })
      } else {
        await createTeleworkDay(date, type, comment)
      }
      setFormState(null)
      await loadData()
      const label = type === 'DAY_OFF' ? 'Day Off' : 'Telework day'
      const verb = isEdit ? 'updated' : 'saved'
      void showNotification(`${label} ${verb}`, date)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteTeleworkDay(id)
      await loadData()
      void showNotification('Event deleted')
    } catch {
      setError('Failed to delete telework day.')
    }
  }

  const remaining = data?.remaining ?? 12

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>WorkWhere</h1>
        {user && <UserBadge user={user} />}
      </div>

      <MonthSelector currentMonth={currentMonth} onMonthChange={setCurrentMonth} />

      {data && <TeleworkSummary total={data.total} remaining={data.remaining} />}

      {error && <p className={styles.error}>{error}</p>}

      {isLoading ? (
        <p className={styles.loading}>Loading…</p>
      ) : (
        <>
          <Calendar
            currentMonth={currentMonth}
            days={data?.days ?? []}
            onDayClick={handleDayClick}
          />
          <h2 className={styles.listTitle}>Logged Days</h2>
          <TeleworkList
            days={data?.days ?? []}
            onEdit={(day) => setFormState(day)}
            onDelete={(id) => void handleDelete(id)}
          />
        </>
      )}

      {formState !== null && (
        <TeleworkForm
          day={typeof formState === 'object' ? formState : undefined}
          prefillDate={typeof formState === 'string' ? formState : undefined}
          remaining={remaining}
          onSubmit={(date, type, comment) => void handleFormSubmit(date, type, comment)}
          onClose={() => setFormState(null)}
        />
      )}
    </main>
  )
}
