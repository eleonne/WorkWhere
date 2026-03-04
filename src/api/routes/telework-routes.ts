import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const MAX_TELEWORK_DAYS = 12

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

    return res.json({
      days,
      total: days.length,
      remaining: MAX_TELEWORK_DAYS - days.length,
    })
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/telework
teleworkRouter.post('/', async (req: Request, res: Response) => {
  const { date, comment } = req.body as { date: string; comment?: string }

  if (!date) {
    return res.status(400).json({ error: 'date is required' })
  }

  const dateObj = new Date(date)
  const year = dateObj.getFullYear()
  const month = dateObj.getMonth()
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0, 23, 59, 59)

  try {
    const count = await prisma.teleworkDay.count({
      where: { date: { gte: startDate, lte: endDate } },
    })

    if (count >= MAX_TELEWORK_DAYS) {
      return res.status(400).json({ error: 'Maximum telework days for this month reached (12)' })
    }

    const day = await prisma.teleworkDay.create({
      data: { date: dateObj, comment },
    })

    return res.status(201).json(day)
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /api/telework/:id
teleworkRouter.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const { date, comment } = req.body as { date?: string; comment?: string }

  try {
    const day = await prisma.teleworkDay.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
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
