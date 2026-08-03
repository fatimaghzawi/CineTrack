# CineTrack Frontend

Angular 18 + Tailwind CSS frontend for the CineTrack movie/TV tracking platform.

## Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Angular CLI** installed globally:
  ```bash
  npm install -g @angular/cli@18
  ```
- **CineTrack Backend** running on `http://localhost:3000`

## Getting started

```bash
npm install
```

Start the backend in a separate terminal (it must be on port **3000**):

```bash
cd ../server
npm run dev
```

Then start the frontend:

```bash
npm start        # or: ng serve
```

Open **http://localhost:4200**.

## Project Structure

```
src/
├── index.html            # font links (Inter + Plus Jakarta Sans)
├── main.ts
├── styles.scss           # design system: base, components, utilities
├── assets/
│   └── no-poster.svg
├── environments/
└── app/
    ├── app.component.ts
    ├── app.config.ts
    ├── app.routes.ts
    ├── core/
    │   ├── guards/          # authGuard / guestGuard
    │   ├── interceptors/    # JWT attach + 401 handling
    │   ├── models/          # API + TMDb interfaces
    │   └── services/        # api, auth, tmdb, watchlist, favorites, toast
    ├── shared/
    │   ├── components/
    │   │   ├── icon/            # the entire outline icon set
    │   │   ├── logo/            # brand lockup
    │   │   ├── layout/          # app shell (sidebar + topbar)
    │   │   ├── navbar/
    │   │   ├── sidebar/
    │   │   ├── movie-card/      # 2:3 poster tile
    │   │   ├── media-tile/      # 16:9 continue-watching tile
    │   │   ├── stat-tile/
    │   │   ├── section-header/
    │   │   ├── empty-state/
    │   │   ├── rating-stars/
    │   │   ├── skeleton-loader/
    │   │   └── toast/
    │   └── pipes/
    └── features/            # one folder per route
        ├── auth/{login,register}/
        ├── collections/  dashboard/  discover/  favorites/
        ├── journal/      movie-details/  settings/
        ├── statistics/   tv-details/     watchlist/
```

| Folder | Purpose |
|--------|---------|
| `core/models/` | TypeScript interfaces matching backend data shapes |
| `core/services/` | API communication (auth, TMDb, watchlist, favorites, toast) |
| `core/guards/` | Route guards (auth required / guest only) |
| `core/interceptors/` | HTTP interceptor for JWT token attachment |
| `shared/components/` | Design-system building blocks |
| `shared/pipes/` | Custom pipes (truncate) |
| `features/` | Page components (one per route) |

## Design System

The UI follows a single reference design. Treat the palette below as fixed — do
not introduce new hues. The only exception is red, reserved strictly for
destructive signals (delete, log out, spoiler warnings).

### Colors (defined in `tailwind.config.js`)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#FFC107` | Brand colour, CTAs, active nav, progress, stars |
| `primary-hover` / `accent-gold` | `#D4A017` | Hover / pressed states, secondary accents |
| `surface-deep` | `#121212` | App background, text on primary |
| `surface-dark` | `#1E1E1E` | Sidebar, topbar, section panels |
| `surface-card` | `#2C2C2E` | Cards, stat tiles, inputs, chips |
| `surface-elevated` | `#3A3A3C` | Borders, tracks, dashed placeholders |
| `hairline` | `rgba(255,255,255,.07)` | 1px separators on dark surfaces |
| `text-primary` | `#FFFFFF` | Headings, body |
| `text-secondary` | `#A1A1AA` | Descriptions, labels |
| `text-muted` | `#71717A` | Placeholders, meta |

### Typography

- **Display** (`font-display`) — Plus Jakarta Sans 700/800, tight tracking. Page
  titles, hero copy, stat values, the wordmark.
- **Body** (`font-body`, default) — Inter. Body copy sits at 13–14px, secondary
  meta at 11–12px (`text-2xs`).

### Radii & elevation

`rounded-lg` 10px (buttons, controls) · `rounded-xl` 14px (cards, posters,
tiles) · `rounded-2xl` 18px (section panels) · `rounded-3xl` 24px (modals).
Shadows: `shadow-card`, `shadow-panel`, `shadow-pop`, `shadow-glow` (yellow CTA).

### Reusable CSS classes (defined in `styles.scss`)

| Group | Classes |
|-------|---------|
| Surfaces | `.panel` (#1E1E1E section), `.card` (#2C2C2E tile), `.card-hover`, `.glass` |
| Buttons | `.btn-primary`, `.btn-outline`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-sm`, `.btn-icon`, `.btn-round`, `.play-fab` |
| Forms | `.label`, `.input-field`, `.select-field`, `.search-field` |
| Pills | `.chip`, `.chip-active`, `.chip-idle`, `.badge-primary`, `.badge-neutral`, `.badge-watching`, `.badge-completed`, `.badge-plan`, `.badge-dropped`, `.check-dot` |
| Navigation | `.nav-item`, `.nav-item-active` (yellow left bar), `.tab`, `.tab-active` (yellow underline) |
| Layout | `.page-container`, `.page-title`, `.section-title`, `.divider`, `.poster-grid`, `.add-tile` |
| Utilities | `.text-gradient`, `.scrollbar-none`, `.skeleton`, `.line-clamp-2/3` |

### Layout shell

Fixed 256px sidebar from `lg` up (off-canvas drawer below that) plus a sticky
64px topbar carrying the pill search, notifications and avatar. Poster grids run
2 → 3 → 4 → 5 → 6 columns as the viewport widens.

### Conventions

- Never inline raw SVG in a feature component — add the path to `app-icon`
  instead, so iconography stays one consistent set.
- Reach for `.panel` / `.card` rather than ad-hoc `bg-*` + `border-*` pairs.
- New empty states use `app-empty-state`; new row headings use
  `app-section-header`.

## API Proxy

During development, all requests to `/api/*` are proxied to `http://localhost:3000`
via `proxy.conf.json`. In production, configure your reverse proxy or set
`environment.prod.ts` to point at your backend URL.

## Notes

- All components are **standalone** (no NgModules)
- State is managed with **Angular Signals**
- Routes use **lazy loading** for code splitting
- Authentication uses **JWT** stored in localStorage
- Movie/TV metadata comes from **TMDb** via the backend — nothing is stored locally
- Motion respects `prefers-reduced-motion`
