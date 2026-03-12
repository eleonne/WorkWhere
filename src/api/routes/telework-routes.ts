import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const MAX_TELEWORK_DAYS = 12
const VALID_TYPES = ['TELEWORK', 'DAY_OFF'] as const
type EventType = (typeof VALID_TYPES)[number]

export const teleworkRouter = Router()

// GET /api/telework?month=YYYY-MM
teleworkRouter.get('/', async (req: Request, res: Response) => {
  const { month } = req.query

  if (!month || typeof month !== 'string') {
    return res.status(400).json({ error: 'month query parameter is required (YYYY-MM)' })
  }

  const [year, monthNum] = month.split('-').map(Number)
  const startDate = new Date(year, monthNum - 1, 1)
  const endDate = new Date(year, monthNum, 0, 23, 59, 59)

  try {
    const days = await prisma.teleworkDay.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' },
    })

    const teleworkCount = days.filter((d) => d.type === 'TELEWORK').length

    return res.json({
      days,
      total: teleworkCount,
      remaining: MAX_TELEWORK_DAYS - teleworkCount,
    })
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/telework
teleworkRouter.post('/', async (req: Request, res: Response) => {
  const { date, type: rawType, comment } = req.body as {
    date: string
    type?: string
    comment?: string
  }

  if (!date) {
    return res.status(400).json({ error: 'date is required' })
  }

  const type: EventType = VALID_TYPES.includes(rawType as EventType)
    ? (rawType as EventType)
    : 'TELEWORK'

  const dateObj = new Date(date)
  const year = dateObj.getFullYear()
  const month = dateObj.getMonth()
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0, 23, 59, 59)

  try {
    if (type === 'TELEWORK') {
      const teleworkCount = await prisma.teleworkDay.count({
        where: { date: { gte: startDate, lte: endDate }, type: 'TELEWORK' },
      })

      if (teleworkCount >= MAX_TELEWORK_DAYS) {
        return res.status(400).json({ error: 'Maximum telework days for this month reached (12)' })
      }
    }

    const day = await prisma.teleworkDay.create({
      data: { date: dateObj, type, comment },
    })

    return res.status(201).json(day)
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /api/telework/:id
teleworkRouter.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const { date, type: rawType, comment } = req.body as {
    date?: string
    type?: string
    comment?: string
  }

  const type: EventType | undefined = VALID_TYPES.includes(rawType as EventType)
    ? (rawType as EventType)
    : undefined

  try {
    const day = await prisma.teleworkDay.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(type && { type }),
        comment,
      },
    })

    return res.json(day)
  } catch (error) {
    return res.status(404).json({ error: 'Telework day not found' })
  }
})

// DELETE /api/telework/:id
teleworkRouter.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id)

  try {
    await prisma.teleworkDay.delete({ where: { id } })
    return res.status(204).send()
  } catch (error) {
    return res.status(404).json({ error: 'Telework day not found' })
  }
})
