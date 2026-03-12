import dotenv from 'dotenv'
dotenv.config({ quiet: true })

import express from 'express'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()
const MAX_TELEWORK_DAYS = 12
const PORT = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT) : 3001

function createServer(): McpServer {
  const server = new McpServer({ name: 'workwhere', version: '1.0.0' })

  server.registerTool(
    'get_telework_days',
    {
      description:
        'Get all events logged for a given month (Telework and Day Off), including telework count and remaining telework days available (max 12 per month).',
      inputSchema: { month: z.string().describe('Month in YYYY-MM format, e.g. 2026-03') },
    },
    async ({ month }) => {
      const [year, monthNum] = month.split('-').map(Number)
      const startDate = new Date(year, monthNum - 1, 1)
      const endDate = new Date(year, monthNum, 0, 23, 59, 59)

      const days = await prisma.teleworkDay.findMany({
        where: { date: { gte: startDate, lte: endDate } },
        orderBy: { date: 'asc' },
      })

      const teleworkCount = days.filter((d) => d.type === 'TELEWORK').length

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                days: days.map((d) => ({
                  id: d.id,
                  date: d.date.toISOString().slice(0, 10),
                  type: d.type,
                  comment: d.comment,
                })),
                total: teleworkCount,
                remaining: MAX_TELEWORK_DAYS - teleworkCount,
              },
              null,
              2,
            ),
          },
        ],
      }
    },
  )

  server.registerTool(
    'log_telework_day',
    {
      description:
        'Log a new event for a day. Type can be TELEWORK (default, max 12/month) or DAY_OFF (unlimited). Returns an error if the telework limit is reached.',
      inputSchema: {
        date: z.string().describe('Date in YYYY-MM-DD format'),
        type: z
          .enum(['TELEWORK', 'DAY_OFF'])
          .optional()
          .describe('Event type: TELEWORK (default) or DAY_OFF'),
        comment: z.string().optional().describe('Optional note'),
      },
    },
    async ({ date: dateStr, type = 'TELEWORK', comment }) => {
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = date.getMonth()
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0, 23, 59, 59)

      if (type === 'TELEWORK') {
        const teleworkCount = await prisma.teleworkDay.count({
          where: { date: { gte: startDate, lte: endDate }, type: 'TELEWORK' },
        })

        if (teleworkCount >= MAX_TELEWORK_DAYS) {
          return {
            content: [{ type: 'text', text: 'Maximum 12 telework days per month reached.' }],
            isError: true,
          }
        }
      }

      const day = await prisma.teleworkDay.create({ data: { date, type, comment } })

      return {
        content: [
          {
            type: 'text',
            text: `Logged ${day.type}: ${day.date.toISOString().slice(0, 10)} (ID: ${day.id})`,
          },
        ],
      }
    },
  )

  server.registerTool(
    'update_telework_day',
    {
      description: 'Update the date, type, or comment of an existing event.',
      inputSchema: {
        id: z.number().describe('ID of the event to update'),
        date: z.string().optional().describe('New date in YYYY-MM-DD format (optional)'),
        type: z
          .enum(['TELEWORK', 'DAY_OFF'])
          .optional()
          .describe('New event type (optional)'),
        comment: z
          .string()
          .optional()
          .describe('New comment, or empty string to clear it (optional)'),
      },
    },
    async ({ id, date: dateStr, type, comment }) => {
      const day = await prisma.teleworkDay.update({
        where: { id },
        data: {
          ...(dateStr != null && { date: new Date(dateStr) }),
          ...(type != null && { type }),
          ...(comment != null && { comment: comment || null }),
        },
      })

      return {
        content: [
          {
            type: 'text',
            text: `Updated ID ${day.id}: ${day.type} on ${day.date.toISOString().slice(0, 10)}`,
          },
        ],
      }
    },
  )

  server.registerTool( 
    'delete_telework_day',
    {
      description: 'Delete a logged telework day by its ID.',
      inputSchema: { id: z.number().describe('ID of the telework day to delete') },
    },
    async ({ id }) => {
      await prisma.teleworkDay.delete({ where: { id } })
      return { content: [{ type: 'text', text: `Deleted telework day ID ${id}.` }] }
    },
  )

  return server
}

const app = express()
app.use(express.json())

app.post('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
  const server = createServer()
  res.on('close', () => void server.close())
  await server.connect(transport)
  await transport.handleRequest(req, res, req.body)
})

app.listen(PORT, '0.0.0.0', () => {
  console.error(`WorkWhere MCP server listening on http://0.0.0.0:${PORT}/mcp`)
})
