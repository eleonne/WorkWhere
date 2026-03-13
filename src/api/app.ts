import path from 'path'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { teleworkRouter } from './routes/telework-routes'

const app = express()

app.use(cors())
app.use(express.json())

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
})

app.use('/api', apiLimiter)
app.use('/api/telework', teleworkRouter)

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist')
  app.use(express.static(distPath))
  app.use((_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

export { app }
