# PCB MVT Frontend

Next.js landing page and web client for the PCB MVT platform. This repository is intentionally separate from the Django backend.

## Prerequisites

- Node.js 20+
- A running Django backend (see the `pcb_mvt` backend repository)

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). API requests to `/api/*` and `/media/*` are proxied to Django via `DJANGO_API_ORIGIN` (default `http://localhost:8000`).

## Docker

```bash
cp .env.example .env
# Set DJANGO_API_ORIGIN to your backend URL (use host.docker.internal on macOS/Windows for local Django).
docker compose up --build
```

## Production notes

- Deploy this app independently from the backend (separate server, subdomain, or CDN).
- Set `DJANGO_API_ORIGIN` to the backend base URL reachable from the Next.js server.
- If the browser must call the API on a different domain, configure CORS on the backend and set `NEXT_PUBLIC_API_URL`.

## Backend repository

Clone and run the Django API separately:

```bash
git clone https://github.com/mejomba/pcb_mvt.git
cd pcb_mvt
# follow backend README / docker-compose instructions
```
