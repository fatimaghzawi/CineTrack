/**
 * Application-wide configuration — the standalone replacement for the old
 * `AppModule`'s `providers: [...]` array. Every service/feature the whole
 * app needs is registered once here via `provide*()` functions, then
 * `main.ts` passes this object into `bootstrapApplication()`.
 *
 * Each `provide*()` call sets up one cross-cutting concern:
 */
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Angular's change detection historically relies on "Zone.js" patching
    // every async browser API (setTimeout, fetch, DOM events...) so it knows
    // when *something* might have changed and it should re-check the UI.
    // `eventCoalescing: true` batches multiple DOM events firing in the same
    // tick into a single change-detection pass instead of one per event.
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Registers the Angular Router using the route table from app.routes.ts.
    // - withComponentInputBinding(): route params/query params/data are
    //   automatically bound to matching `input()`s on the routed component,
    //   no manual ActivatedRoute subscription needed for simple cases.
    // - withViewTransitions(): uses the browser View Transitions API for
    //   smoother page-to-page navigation animations where supported.
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),

    // Registers Angular's HttpClient (used by every service that calls the
    // backend) and wires up authInterceptor — see auth.interceptor.ts for
    // what it does. withInterceptors() accepts an array, so more could be
    // added here and they'd run in order for every outgoing HTTP request.
    provideHttpClient(withInterceptors([authInterceptor])),

    // Enables Angular's animation engine (used for route transitions and
    // any [@triggerName] animations declared on components).
    provideAnimations(),
  ],
};
