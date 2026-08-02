# CineTrack Frontend

Angular 18 + Tailwind CSS frontend for the CineTrack movie/TV tracking platform.

## Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Angular CLI** installed globally:
  ```bash
  npm install -g @angular/cli@18
  ```
- **CineTrack Backend** running on `http://localhost:3000`

## Setup Steps

### 1. Create the frontend folder

```bash
# From your project root (next to the backend folder)
mkdir frontend
cd frontend
```

### 2. Copy all project files

Copy the entire contents of this folder into your `frontend` directory, preserving the structure:

```
frontend/
├── angular.json
├── package.json
├── postcss.config.js
├── proxy.conf.json
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.scss
    ├── assets/
    │   └── no-poster.svg
    ├── environments/
    │   ├── environment.ts
    │   └── environment.prod.ts
    └── app/
        ├── app.component.ts
        ├── app.config.ts
        ├── app.routes.ts
        ├── core/
        │   ├── guards/
        │   │   └── auth.guard.ts
        │   ├── interceptors/
        │   │   └── auth.interceptor.ts
        │   ├── models/
        │   │   ├── api-response.model.ts
        │   │   ├── movie.model.ts
        │   │   └── user.model.ts
        │   └── services/
        │       ├── api.service.ts
        │       ├── auth.service.ts
        │       ├── favorites.service.ts
        │       ├── tmdb.service.ts
        │       ├── toast.service.ts
        │       └── watchlist.service.ts
        ├── shared/
        │   ├── components/
        │   │   ├── layout/
        │   │   │   └── layout.component.ts
        │   │   ├── movie-card/
        │   │   │   └── movie-card.component.ts
        │   │   ├── navbar/
        │   │   │   └── navbar.component.ts
        │   │   ├── rating-stars/
        │   │   │   └── rating-stars.component.ts
        │   │   ├── sidebar/
        │   │   │   └── sidebar.component.ts
        │   │   ├── skeleton-loader/
        │   │   │   └── skeleton-loader.component.ts
        │   │   └── toast/
        │   │       └── toast.component.ts
        │   └── pipes/
        │       └── truncate.pipe.ts
        └── features/
            ├── auth/
            │   ├── login/
            │   │   └── login.component.ts
            │   └── register/
            │       └── register.component.ts
            ├── collections/
            │   └── collections.component.ts
            ├── dashboard/
            │   └── dashboard.component.ts
            ├── discover/
            │   └── discover.component.ts
            ├── favorites/
            │   └── favorites.component.ts
            ├── journal/
            │   └── journal.component.ts
            ├── movie-details/
            │   └── movie-details.component.ts
            ├── settings/
            │   └── settings.component.ts
            ├── statistics/
            │   └── statistics.component.ts
            ├── tv-details/
            │   └── tv-details.component.ts
            └── watchlist/
                └── watchlist.component.ts
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the backend

In a separate terminal:

```bash
cd ../backend   # or wherever your CineTrack backend is
npm run dev
```

Make sure it's running on port **3000** (the default).

### 5. Start the frontend

```bash
ng serve
```

Open **http://localhost:4200** in your browser.

## Project Structure

| Folder | Purpose |
|--------|---------|
| `core/models/` | TypeScript interfaces matching backend data shapes |
| `core/services/` | API communication (auth, TMDb, watchlist, favorites, toast) |
| `core/guards/` | Route guards (auth required / guest only) |
| `core/interceptors/` | HTTP interceptor for JWT token attachment |
| `shared/components/` | Reusable UI (layout, navbar, sidebar, movie card, etc.) |
| `shared/pipes/` | Custom pipes (truncate) |
| `features/` | Page components (one per route) |

## Design System

### Colors (defined in `tailwind.config.js`)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#FFC107` | Brand color, CTAs, highlights |
| `primary-dark` / `accent-gold` | `#D4A017` | Hover states, icons |
| `surface-deep` | `#121212` | App background |
| `surface-dark` | `#1E1E1E` | Secondary surfaces |
| `surface-card` | `#2C2C2E` | Cards, elevated surfaces |
| `surface-elevated` | `#3A3A3C` | Borders, inputs |
| `text-primary` | `#FFFFFF` | Headings, body |
| `text-secondary` | `#A1A1AA` | Descriptions |
| `text-muted` | `#71717A` | Placeholders, meta |

### Reusable CSS classes (defined in `styles.scss`)

- `.btn-primary`, `.btn-outline`, `.btn-ghost` — buttons
- `.input-field` — text inputs, selects, textareas
- `.card`, `.card-hover` — card containers
- `.badge-primary`, `.badge-watching`, `.badge-completed`, `.badge-plan`, `.badge-dropped` — status badges
- `.page-container` — standard page padding
- `.glass` — glassmorphism effect
- `.text-gradient` — gold gradient text

## API Proxy

During development, all requests to `/api/*` are proxied to `http://localhost:3000` via `proxy.conf.json`. In production, configure your reverse proxy or set `environment.prod.ts` to point to your backend URL.

## Notes

- All components are **standalone** (no NgModules)
- State is managed with **Angular Signals**
- Routes use **lazy loading** for code splitting
- Authentication uses **JWT** stored in localStorage
- Movie/TV metadata comes from **TMDb** via the backend — nothing is stored locally
