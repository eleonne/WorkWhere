export type EventType = 'TELEWORK' | 'DAY_OFF'

export type TeleworkDay = {
  id: number
  date: string
  type: EventType
  comment: string | null
  createdAt: string
  updatedAt: string
}

export type TeleworkMonthData = {
  days: TeleworkDay[]
  total: number      // telework days only
  remaining: number  // 12 - total
}
