# CineTrack

A personal movie & TV watchlist tracker — track what you're watching, plan what's next, journal your thoughts, and see your stats. Built as a course project.

Movie/TV data comes from [TMDb](https://www.themoviedb.org/documentation/api); nothing is stored locally beyond what the user tracks.

## Tech Stack

- **Client:** Angular 18, Tailwind CSS, standalone components, Signals
- **Server:** Fastify 5, MongoDB (Mongoose), Zod validation, JWT auth
- **Repo layout:** `client/` and `server/` are independent apps — install and run each separately

## Prerequisites

- Node.js 18+ and npm 9+
- A MongoDB connection string (local MongoDB, or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)
- A [TMDb API key](https://www.themoviedb.org/settings/api) (free, instant signup)

## Setup

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Configure the server
cd ../server
cp .env.example .env
# then edit .env: fill in MONGODB_URI and TMDB_API_KEY
```

`.env` is gitignored — everyone on the team needs their own copy. Ask in the group chat if you need the shared Mongo/TMDB credentials.

## Running

Two terminals, both from a fresh clone:

```bash
# Terminal 1 — backend (http://localhost:3000)
cd server
npm run dev

# Terminal 2 — frontend (http://localhost:4200)
cd client
npm start
```

Open **http://localhost:4200**. The client dev server proxies `/api/*` to the backend automatically (see `client/proxy.conf.json`) — no extra config needed.

## What's working

Auth, TMDb search/discover/trending, Watchlist, Favorites, Journal, Collections, and Statistics all have real backend endpoints and are wired up on the frontend.

Two backend modules have no frontend yet: **Ratings** (endpoints exist, no UI calls them) and **Recommendations** (still a backend scaffold, health-check only).

Pages: Dashboard, Discover, Movie/TV details, Watchlist, Favorites, Journal, Collections, Stats, Calendar, Settings.

## Other useful commands

| | Client (`client/`) | Server (`server/`) |
|---|---|---|
| Build | `npm run build` | `npm run build` |
| Typecheck | — (build catches it) | `npm run typecheck` |
| Lint | — | `npm run lint` |

## More details

See [`client/README.md`](client/README.md) for the frontend's project structure, design system (colors, components, conventions).
