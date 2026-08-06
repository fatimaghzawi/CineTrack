/**
 * HTTP interceptor — Angular's closest equivalent to Express-style
 * "middleware", but for outgoing HTTP requests instead of incoming server
 * requests. Every request made through Angular's HttpClient (by any
 * service, anywhere in the app) passes through every registered
 * interceptor first, in the order they're listed in app.config.ts's
 * `withInterceptors([...])`.
 *
 * This one has two jobs, both cross-cutting concerns that would otherwise
 * need to be repeated in every single API call:
 *   1. Attach the JWT to every outgoing request (if we have one).
 *   2. Globally catch 401 Unauthorized responses and force a logout —
 *      so an expired/invalid token doesn't leave the UI in a broken
 *      logged-in-but-not-really state.
 *
 * `next(req)` forwards the (possibly modified) request down the chain to
 * the next interceptor, and eventually to the actual HTTP call.
 */
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  if (token) {
    // HttpRequest objects are immutable — .clone() returns a new request
    // with the extra header merged in, rather than mutating `req` in place.
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    // catchError taps into the RxJS stream to react to a failed request
    // without swallowing the error — it still re-throws via throwError()
    // so the calling service's own .subscribe({ error: ... }) still fires.
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
