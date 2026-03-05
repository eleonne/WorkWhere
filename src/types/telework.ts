export type TeleworkDay = {
  id: number
  date: string
  comment: string | null
  createdAt: string
  updatedAt: string
}

export type TeleworkMonthData = {
  days: TeleworkDay[]
  total: number
  remaining: number
}
