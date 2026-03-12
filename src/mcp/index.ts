import dotenv from 'dotenv'
dotenv.config({ quiet: true })

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const MAX_TELEWORK_DAYS = 12

const server = new Server(
  { name: 'workwhere', version: '1.0.0' },
  { capabilities: { tools: {} } },
)

const tools: Tool[] = [
  {
    name: 'get_telework_days',
    description:
      'Get all telework days logged for a given month, including total count and remaining days available (max 12 per month).',
    inputSchema: {
      type: 'object',
      properties: {
        month: {
          type: 'string',
          description: 'Month in YYYY-MM format, e.g. 2026-03',
        },
      },
      required: ['month'],
    },
  },
  {
    name: 'log_telework_day',
    description:
      'Log a new telework (work from home) day. Maximum 12 days per month. Returns an error if the limit is reached.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format',
        },
        comment: {
          type: 'string',
          description: 'Optional note about what you worked on',
        },
      },
      required: ['date'],
    },
  },
  {
    name: 'update_telework_day',
    description: 'Update the date or comment of an existing telework day.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'ID of the telework day to update',
        },
        date: {
          type: 'string',
          description: 'New date in YYYY-MM-DD format (optional)',
        },
        comment: {
          type: 'string',
          description: 'New comment, or empty string to clear it (optional)',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_telework_day',
    description: 'Delete a logged telework day by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'ID of the telework day to delete',
        },
      },
      required: ['id'],
    },
  },
]

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case 'get_telework_days': {
        const month = String(args?.month)
        const [year, monthNum] = month.split('-').map(Number)
        const startDate = new Date(year, monthNum - 1, 1)
        const endDate = new Date(year, monthNum, 0, 23, 59, 59)

        const days = await prisma.teleworkDay.findMany({
          where: { date: { gte: startDate, lte: endDate } },
          orderBy: { date: 'asc' },
        })

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  days: days.map((d) => ({
                    id: d.id,
                    date: d.date.toISOString().slice(0, 10),
                    comment: d.comment,
                  })),
                  total: days.length,
                  remaining: MAX_TELEWORK_DAYS - days.length,
                },
                null,
                2,
              ),
            },
          ],
        }
      }

      case 'log_telework_day': {
        const date = new Date(String(args?.date))
        const year = date.getFullYear()
        const month = date.getMonth()
        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, month + 1, 0, 23, 59, 59)

        const count = await prisma.teleworkDay.count({
          where: { date: { gte: startDate, lte: endDate } },
        })

        if (count >= MAX_TELEWORK_DAYS) {
          return {
            content: [
              { type: 'text', text: 'Maximum 12 telework days per month reached.' },
            ],
            isError: true,
          }
        }

        const comment = args?.comment != null ? String(args.comment) : undefined
        const day = await prisma.teleworkDay.create({
          data: { date, comment },
        })

        return {
          content: [
            {
              type: 'text',
              text: `Logged: ${day.date.toISOString().slice(0, 10)} (ID: ${day.id})`,
            },
          ],
        }
      }

      case 'update_telework_day': {
        const id = Number(args?.id)
        const day = await prisma.teleworkDay.update({
          where: { id },
          data: {
            ...(args?.date != null && { date: new Date(String(args.date)) }),
            ...(args?.comment != null && { comment: String(args.comment) || null }),
          },
        })

        return {
          content: [
            {
              type: 'text',
              text: `Updated ID ${day.id}: ${day.date.toISOString().slice(0, 10)}`,
            },
          ],
        }
      }

      case 'delete_telework_day': {
        const id = Number(args?.id)
        await prisma.teleworkDay.delete({ where: { id } })
        return {
          content: [{ type: 'text', text: `Deleted telework day ID ${id}.` }],
        }
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        }
    } 
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true }
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport) 
}

main().catch(console.error)
