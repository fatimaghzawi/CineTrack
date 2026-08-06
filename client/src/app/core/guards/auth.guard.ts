/**
 * Route guards — functions Angular's router runs before entering a route.
 * Returning `true` lets navigation proceed; returning a `UrlTree` (via
 * `router.createUrlTree()`) redirects instead of loading the route at all.
 *
 * These are *functional* guards (`CanActivateFn`), the modern Angular 14+
 * style — a plain function rather than an injectable class implementing a
 * `CanActivate` interface. `inject()` grabs dependencies (AuthService,
 * Router) from Angular's dependency-injection container without needing a
 * constructor, since a plain function has no "class instance" to inject into.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/** Blocks access to protected routes (dashboard, watchlist, etc.) unless logged in. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

/** The inverse — keeps an already-logged-in user off /login and /register. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
