import express from 'express'
import cors from 'cors'
import { teleworkRouter } from './routes/telework-routes'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/telework', teleworkRouter)

export { app }
