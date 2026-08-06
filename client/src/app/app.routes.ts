/**
 * Route table for the whole app — Angular's client-side router matches the
 * browser URL against this array and swaps the component shown in
 * `<router-outlet>` accordingly, without a full page reload.
 *
 * Every route below uses `loadComponent` with a dynamic `import()`. This is
 * Angular's lazy-loading mechanism: the component's code is only downloaded
 * when the user actually navigates to that route, instead of all being
 * bundled into the initial page load. Each lazily-loaded component becomes
 * its own small JS chunk (visible in `ng build` output as e.g.
 * "watchlist-component | 7.80 kB").
 */
import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    // Visiting the site root ('') redirects straight to /dashboard.
    // `pathMatch: 'full'` means this only matches an *exactly empty* URL,
    // not every route that merely starts with '' (which would be all of them).
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    // `canActivate` runs a route guard before the route is allowed to load.
    // guestGuard blocks already-logged-in users from re-visiting /login —
    // see core/guards/auth.guard.ts for the actual check.
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    // A second route also matching the empty path, but gated by authGuard
    // instead of guestGuard, and it loads the app shell (sidebar + navbar)
    // as a *parent* route with its own `children`. Every child route below
    // renders inside LayoutComponent's <router-outlet>, so the sidebar/navbar
    // stay mounted while only the inner page content swaps between them —
    // this is Angular's nested-routing pattern.
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/layout/layout.component').then(
        (m) => m.LayoutComponent
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'discover',
        loadComponent: () =>
          import('./features/discover/discover.component').then(
            (m) => m.DiscoverComponent
          ),
      },
      {
        path: 'movies',
        loadComponent: () =>
          import('./features/browse/browse.component').then(
            (m) => m.BrowseComponent
          ),
        // `data` attaches static, route-specific config that isn't part of
        // the URL. BrowseComponent reads `route.snapshot.data['mediaType']`
        // to know whether it's rendering the movies or TV shows page —
        // one component, two routes, differentiated by route data.
        data: { mediaType: 'movie' },
      },
      {
        path: 'tv-shows',
        loadComponent: () =>
          import('./features/browse/browse.component').then(
            (m) => m.BrowseComponent
          ),
        data: { mediaType: 'tv' },
      },
      {
        // ':id' is a route parameter — matches e.g. /movie/550, and the
        // component reads the actual value (550) via an `input()` bound to
        // the route param (see app.config.ts's withComponentInputBinding()).
        path: 'movie/:id',
        loadComponent: () =>
          import('./features/movie-details/movie-details.component').then(
            (m) => m.MovieDetailsComponent
          ),
      },
      {
        path: 'tv/:id',
        loadComponent: () =>
          import('./features/tv-details/tv-details.component').then(
            (m) => m.TvDetailsComponent
          ),
      },
      {
        path: 'watchlist',
        loadComponent: () =>
          import('./features/watchlist/watchlist.component').then(
            (m) => m.WatchlistComponent
          ),
      },
      {
        path: 'favorites',
        loadComponent: () =>
          import('./features/favorites/favorites.component').then(
            (m) => m.FavoritesComponent
          ),
      },
      {
        path: 'journal',
        loadComponent: () =>
          import('./features/journal/journal.component').then(
            (m) => m.JournalComponent
          ),
      },
      {
        path: 'collections',
        loadComponent: () =>
          import('./features/collections/collections.component').then(
            (m) => m.CollectionsComponent
          ),
      },
      {
        path: 'statistics',
        loadComponent: () =>
          import('./features/statistics/statistics.component').then(
            (m) => m.StatisticsComponent
          ),
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./features/calendar/calendar.component').then(
            (m) => m.CalendarComponent
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then(
            (m) => m.SettingsComponent
          ),
      },
    ],
  },
  {
    // Wildcard — catches any URL that matched nothing above (typos, dead
    // links, etc.) and sends the user somewhere sane instead of a blank page.
    path: '**',
    redirectTo: 'dashboard',
  },
];
