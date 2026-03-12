import type { TeleworkDay, TeleworkMonthData, EventType } from '../types/telework'

const BASE = '/api/telework'

export const fetchTeleworkDays = async (month: string): Promise<TeleworkMonthData> => {
  const res = await fetch(`${BASE}?month=${month}`)
  if (!res.ok) throw new Error('Failed to fetch telework days')
  return res.json() as Promise<TeleworkMonthData>
}

export const createTeleworkDay = async (
  date: string,
  type: EventType = 'TELEWORK',
  comment?: string,
): Promise<TeleworkDay> => {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, type, comment }),
  })
  if (!res.ok) {
    const body = await res.json() as { error: string }
    throw new Error(body.error)
  }
  return res.json() as Promise<TeleworkDay>
}

export const updateTeleworkDay = async (
  id: number,
  data: { date?: string; type?: EventType; comment?: string },
): Promise<TeleworkDay> => {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update telework day')
  return res.json() as Promise<TeleworkDay>
}

export const deleteTeleworkDay = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete telework day')
}
