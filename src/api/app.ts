import path from 'path'
import express from 'express'
import cors from 'cors'
import { teleworkRouter } from './routes/telework-routes'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/telework', teleworkRouter)

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist')
  app.use(express.static(distPath))
  app.use((_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

export { app }
