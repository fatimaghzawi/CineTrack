/**
 * App shell — sidebar/navbar chrome that wraps every authenticated page via
 * `<router-outlet>` (see the parent route in app.routes.ts that nests all
 * the feature routes as children under this component).
 *
 * Also demonstrates **RxJS/Signals interop**: the Router only exposes
 * navigation events as an Observable (`router.events`), not a signal, but
 * this component wants a signal so it can drive `computed()` and the
 * template reactively. `toSignal()` bridges the two worlds — it subscribes
 * to the Observable internally and exposes its latest emitted value as a
 * signal, unsubscribing automatically when the component is destroyed.
 */
import { Component, computed, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';

/** Route(s) that use the "landing page" layout: top nav bar instead of the side rail. */
const TOP_NAV_ROUTES = ['/dashboard'];

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent],
  template: `
    <div class="min-h-screen bg-surface-deep lg:flex">
      <!-- The side rail collapses on desktop for the landing page (top nav takes over there);
           the mobile slide-in drawer still works everywhere via the navbar's menu button. -->
      <div [class]="isTopNavRoute() ? 'lg:hidden' : ''">
        <app-sidebar [open]="menuOpen()" (navigate)="menuOpen.set(false)" />
      </div>

      <!-- Mobile scrim -->
      @if (menuOpen()) {
        <div
          class="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden animate-fade-in"
          (click)="menuOpen.set(false)"
          aria-hidden="true"
        ></div>
      }

      <div class="flex-1 min-w-0 flex flex-col">
        <!--
          RouterOutlet renders whichever child route matched — this is the
          "hole" every features/*.component.ts gets slotted into. Because
          this layout is itself a parent route (not just a template), the
          sidebar/navbar around it stay mounted across navigations between
          child routes; only the outlet's content swaps.
        -->
        <app-navbar [showNavLinks]="isTopNavRoute()" (menuClick)="menuOpen.set(!menuOpen())" />

        <main class="flex-1 min-w-0">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class LayoutComponent {
  menuOpen = signal(false);

  // Declared without initializers here and assigned in the constructor
  // instead — they depend on `this.router`, which (with this app's
  // TypeScript/ES2022 target) isn't available yet during field
  // initialization, only once the constructor body actually runs.
  private currentUrl;
  isTopNavRoute;

  constructor(private router: Router) {
    this.currentUrl = toSignal(
      this.router.events.pipe(
        // router.events emits many event types (NavigationStart,
        // RoutesRecognized, ...); this `filter` with a type predicate keeps
        // only NavigationEnd events *and* narrows the TypeScript type to
        // NavigationEnd for the `map` below, so `.urlAfterRedirects` is
        // known to exist.
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map((event) => event.urlAfterRedirects.split('?')[0]),
      ),
      // toSignal() needs a synchronous starting value, since a signal can
      // never be "empty" the way an Observable can be before its first
      // emission — this uses the router's current URL as that starting point.
      { initialValue: this.router.url.split('?')[0] },
    );

    // Derived state built on top of the signal above — recomputes only when
    // currentUrl() actually changes value, i.e. on every navigation.
    this.isTopNavRoute = computed(() => TOP_NAV_ROUTES.includes(this.currentUrl()));
  }
}
