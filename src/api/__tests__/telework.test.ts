import request from 'supertest'
import { app } from '../app'

describe('GET /api/telework', () => {
  it('returns 400 when month param is missing', async () => {
    const res = await request(app).get('/api/telework')
    expect(res.status).toBe(400)
  })

  it('returns days, total, and remaining for a valid month', async () => {
    const res = await request(app).get('/api/telework?month=2026-01')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('days')
    expect(res.body).toHaveProperty('total')
    expect(res.body).toHaveProperty('remaining')
  })
})

describe('POST /api/telework', () => {
  it('returns 400 when date is missing', async () => {
    const res = await request(app).post('/api/telework').send({})
    expect(res.status).toBe(400)
  })
})
