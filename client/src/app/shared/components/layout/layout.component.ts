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
  private currentUrl;
  isTopNavRoute;

  constructor(private router: Router) {
    this.currentUrl = toSignal(
      this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map((event) => event.urlAfterRedirects.split('?')[0]),
      ),
      { initialValue: this.router.url.split('?')[0] },
    );
    this.isTopNavRoute = computed(() => TOP_NAV_ROUTES.includes(this.currentUrl()));
  }
}
