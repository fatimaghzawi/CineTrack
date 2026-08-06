/**
 * Application entry point.
 *
 * Older Angular apps bootstrapped an `AppModule` (NgModule-based) here via
 * `platformBrowserDynamic().bootstrapModule(AppModule)`. Since Angular 14+,
 * apps can skip NgModules entirely and bootstrap a single standalone
 * component directly with `bootstrapApplication()`. This app uses that
 * standalone style throughout — no `*.module.ts` files anywhere.
 *
 * `appConfig` (from app.config.ts) supplies everything an NgModule's
 * `providers` array used to: the router, HttpClient, interceptors, etc.
 */
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
