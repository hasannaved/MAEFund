# MAEF Backend

This lightweight Express + SQLite backend persists the simulator state so it can
be shared across devices and users. It exposes a simple JSON API and stores the
latest state in a single-row SQLite table.

## Requirements

- Node.js 18+

## Setup

```bash
cd server
npm install
npm start
```

The API will be available at `http://localhost:5174`.

## API

- `GET /api/state` → returns `{ state }`
- `PUT /api/state` with `{ state }` JSON → stores the latest state
- `GET /health` → basic health check

To use the backend with the frontend, run the backend on the same origin or
configure a reverse proxy so `/api/state` routes to this server.

## Configuration

- `PORT` (optional): defaults to `5174`.
- `CORS_ORIGIN` (optional): comma-separated list of allowed origins.

Example:

```bash
CORS_ORIGIN="https://example.com,https://www.example.com" npm start
```
