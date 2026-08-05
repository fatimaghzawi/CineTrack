import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
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
    path: '**',
    redirectTo: 'dashboard',
  },
];
