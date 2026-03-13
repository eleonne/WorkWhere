# WorkWhere

A PWA for tracking telework and day-off events. Displays a monthly calendar, enforces a 12-day telework limit per month, and exposes an MCP server for AI agent integration.

---

## Features

- Log **Telework** and **Day Off** events (one per day)
- Monthly calendar with color-coded events (blue = telework, amber = day off)
- Enforces a maximum of **12 telework days per month**
- Month navigation
- Optional comments on each event
- Azure Easy Auth integration — shows logged-in user
- **PWA** — installable on iPhone/Android (iOS 16.4+)
- **Push notifications** to the system notification center on save, update, and delete
- **MCP server** for AI agent access via Claude Desktop or compatible clients

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, CSS Modules |
| Backend | Node.js, Express 5 |
| Database | SQLite via Prisma |
| PWA | vite-plugin-pwa (Workbox) |
| AI integration | Model Context Protocol (MCP) SDK |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Configure environment

```bash
cp .env.example .env
```

`.env` variables:

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | Prisma SQLite connection string |
| `PORT` | `3001` | API server port |
| `MCP_PORT` | `3002` | MCP server port |

### Initialize the database

```bash
npx prisma migrate dev
```

### Run in development

```bash
npm run dev
```

This starts the Vite dev server (frontend) and the Express API concurrently. The frontend proxies `/api` requests to `http://localhost:3001`.

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start frontend + API in watch mode |
| `npm run build` | Production build (Prisma generate → Vite → tsc) |
| `npm start` | Run migrations and start production server |
| `npm test` | Run Jest integration tests |
| `npm run lint` | ESLint check |
| `npm run mcp` | Start the MCP server standalone |
| `npm run zip` | Package source for deployment (excludes node_modules, dist, build, .env, db) |

---

## Project Structure

```
src/
├── api/               # Express backend
│   ├── app.ts         # Express app (CORS, routes, static serving)
│   ├── index.ts       # Server entry point
│   └── routes/
│       └── telework-routes.ts
├── components/        # React UI components (co-located CSS Modules)
│   ├── calendar/
│   ├── month-selector/
│   ├── telework-form/
│   ├── telework-list/
│   ├── telework-summary/
│   └── user-badge/
├── mcp/
│   └── index.ts       # MCP server (Streamable HTTP transport)
├── pages/
│   └── home-page.tsx
├── services/
│   ├── auth-api.ts        # Azure Easy Auth (/.auth/me)
│   ├── notifications.ts   # Web Push / service worker notifications
│   └── telework-api.ts    # REST client for the API
└── types/
    └── telework.ts
prisma/
├── schema.prisma
└── migrations/
public/                # PWA icons and assets
```

---

## API

Base URL: `http://localhost:3001`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/telework?month=YYYY-MM` | List events for a month, includes `total` and `remaining` telework days |
| `POST` | `/api/telework` | Create an event |
| `PUT` | `/api/telework/:id` | Update an event |
| `DELETE` | `/api/telework/:id` | Delete an event |

**POST / PUT body:**

```json
{
  "date": "2026-03-12",
  "type": "TELEWORK",
  "comment": "optional note"
}
```

`type` is `"TELEWORK"` (default) or `"DAY_OFF"`. Creating a `TELEWORK` event when the monthly limit is reached returns HTTP 400.

---

## MCP Server

The MCP server exposes the telework data to AI agents (Claude Desktop, etc.) over HTTP.

### Start

```bash
npm run mcp
# or with a custom port:
MCP_PORT=3002 npm run mcp
```

Endpoint: `POST http://<host>:3002/mcp`

### Tools

| Tool | Description |
|---|---|
| `get_telework_days` | Get all events for a month (YYYY-MM), with totals and remaining days |
| `log_telework_day` | Log a new event (date, type, optional comment) |
| `update_telework_day` | Update date, type, or comment of an existing event by ID |
| `delete_telework_day` | Delete an event by ID |

### Claude Desktop configuration

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "workwhere": {
      "type": "http",
      "url": "http://<host>:3002/mcp"
    }
  }
}
```

Replace `<host>` with `localhost` for local use or the remote hostname (e.g. `lab.local`) for a server on the same network.

---

## Deployment

### Azure Web App (recommended)

1. Build and package:

```bash
npm run build
npm run zip
```

2. Deploy via ZipDeploy:

```bash
az webapp deployment source config-zip \
  --resource-group <rg> \
  --name <app-name> \
  --src deploy.zip
```

3. Set the startup command in Azure:

```
npm start
```

4. Add application settings in the Azure portal:

| Setting | Value |
|---|---|
| `DATABASE_URL` | `file:/home/site/wwwroot/data/prod.db` (or an absolute path) |
| `NODE_ENV` | `production` |

5. For SSO, enable **Authentication** in the Azure portal (Easy Auth). The app automatically reads user info from `/.auth/me` and displays it in the header.

### Raspberry Pi / Debian (self-hosted)

```bash
# On the server
git clone <repo> workwhere && cd workwhere
npm install
npm run build

# Configure environment
cp .env.example .env
# Edit .env: set DATABASE_URL to an absolute path for production

# Run migrations and start
npm start
```

To keep the process running, use a process manager such as PM2:

```bash
npm install -g pm2
pm2 start "npm start" --name workwhere
pm2 save && pm2 startup
```

The server listens on port `3001` by default. Put Nginx or Caddy in front for HTTPS (required for PWA push notifications on iOS).

---

## PWA & Notifications

The app is installable as a PWA on iOS and Android.

**iOS setup:**
1. Open the app URL in Safari
2. Tap **Share → Add to Home Screen**
3. Open the installed app — the system will prompt for notification permission

Notifications (save, update, delete) are delivered to the system notification center via the service worker. This requires:
- iOS 16.4+
- App installed to the home screen (not opened in Safari)
- HTTPS

---

## Development Notes

- Strict TypeScript — no `any`
- Named exports only
- kebab-case file names
- CSS Modules for all styles
- One component per file, styles co-located
- After changing `prisma/schema.prisma`, run `npx prisma migrate dev` then `npx prisma generate`
- On Windows, stop the dev server before running `npx prisma generate` (file lock on the native query engine)
