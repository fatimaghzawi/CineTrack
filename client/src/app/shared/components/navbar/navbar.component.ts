import { Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '@core/services/auth.service';
import { IconComponent } from '@shared/components/icon/icon.component';
import { LogoComponent } from '@shared/components/logo/logo.component';

interface TopNavLink {
  label: string;
  route: string;
  exact?: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive, IconComponent, LogoComponent],
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'menuOpen.set(false)',
  },
  template: `
    <header
      class="sticky top-0 z-30 h-16 shrink-0 flex items-center gap-3 px-4 sm:px-6
             bg-surface-dark/85 backdrop-blur-xl border-b border-hairline"
    >
      <!-- Mobile: menu (always, opens the drawer regardless of layout mode) -->
      <button
        type="button"
        (click)="menuClick.emit()"
        class="btn-round lg:hidden -ml-2"
        aria-label="Open menu"
      >
        <app-icon name="menu" class="w-5 h-5" />
      </button>

      <!-- Brand: on the landing page the sidebar is hidden on desktop, so the
           navbar carries the logo there too; elsewhere it's mobile-only. -->
      <a routerLink="/dashboard" [class]="showNavLinks() ? '' : 'lg:hidden'" aria-label="CineTrack home">
        <app-logo size="sm" [showWordmark]="false" />
      </a>

      @if (showNavLinks()) {
        <nav class="hidden lg:flex items-center gap-6 ml-2 shrink-0">
          @for (link of navLinks; track link.route) {
            <a
              [routerLink]="link.route"
              [routerLinkActiveOptions]="{ exact: !!link.exact }"
              routerLinkActive="!text-primary"
              class="text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {{ link.label }}
            </a>
          }
        </nav>
      }

      <!-- Search -->
      <div class="flex-1 flex justify-center">
        <div class="relative w-full max-w-md">
          <app-icon
            name="search"
            class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
          />
          <input
            type="search"
            name="globalSearch"
            placeholder="Search movies, shows..."
            aria-label="Search movies and shows"
            [(ngModel)]="searchQuery"
            (keyup.enter)="onSearch()"
            class="search-field"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-1 sm:gap-2 shrink-0">
        <button type="button" class="btn-round relative" aria-label="Notifications">
          <app-icon name="bell" class="w-5 h-5" />
          <span
            class="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary
                   ring-2 ring-surface-dark"
          ></span>
        </button>

        <!-- Account menu -->
        <div class="relative" #accountMenu>
          <button
            type="button"
            (click)="menuOpen.set(!menuOpen())"
            class="grid place-items-center h-9 w-9 rounded-full bg-gold-gradient
                   text-[13px] font-bold text-surface-deep
                   ring-2 ring-transparent hover:ring-primary/40 transition-all duration-200"
            [class.!ring-primary]="menuOpen()"
            [attr.aria-label]="'Account: ' + (auth.user()?.displayName || 'Guest')"
            [attr.aria-expanded]="menuOpen()"
            aria-haspopup="menu"
          >
            {{ userInitial() }}
          </button>

          @if (menuOpen()) {
            <div
              class="absolute right-0 top-full mt-2 w-56 z-50 p-1.5 origin-top-right
                     bg-surface-dark border border-hairline rounded-xl shadow-pop animate-scale-in"
              role="menu"
            >
              <div class="px-3 py-2.5">
                <p class="text-[13.5px] font-semibold text-text-primary truncate">
                  {{ auth.user()?.displayName || 'Guest' }}
                </p>
                <p class="text-2xs text-text-muted truncate">{{ auth.user()?.email }}</p>
              </div>

              <div class="divider !my-1"></div>

              <a routerLink="/settings" (click)="menuOpen.set(false)" class="menu-item" role="menuitem">
                <app-icon name="settings" class="w-[18px] h-[18px]" />
                Settings
              </a>
              <a
                routerLink="/statistics"
                (click)="menuOpen.set(false)"
                class="menu-item"
                role="menuitem"
              >
                <app-icon name="chart" class="w-[18px] h-[18px]" />
                Statistics
              </a>

              <div class="divider !my-1"></div>

              <button
                type="button"
                (click)="onLogout()"
                class="menu-item w-full !text-red-400 hover:!bg-red-500/10"
                role="menuitem"
              >
                <app-icon name="logout" class="w-[18px] h-[18px]" />
                Log Out
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  /** When true (the landing/dashboard page), shows brand + nav links inline since the sidebar rail is hidden there on desktop. */
  showNavLinks = input(false);
  menuClick = output<void>();
  searchQuery = '';

  /** Account dropdown (avatar, top right) — distinct from the mobile drawer. */
  menuOpen = signal(false);
  private accountMenu = viewChild<ElementRef<HTMLElement>>('accountMenu');

  navLinks: TopNavLink[] = [
    { label: 'Home', route: '/dashboard', exact: true },
    { label: 'Movies', route: '/movies' },
    { label: 'TV Shows', route: '/tv-shows' },
    { label: 'Watchlist', route: '/watchlist' },
    { label: 'Discover', route: '/discover' },
  ];

  constructor(
    public auth: AuthService,
    private router: Router,
  ) {}

  userInitial(): string {
    return (this.auth.user()?.displayName ?? '?').charAt(0).toUpperCase();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/discover'], {
        queryParams: { q: this.searchQuery.trim() },
      });
      this.searchQuery = '';
    }
  }

  onLogout(): void {
    this.menuOpen.set(false);
    // AuthService clears the session and redirects to /login on both outcomes.
    this.auth.logout();
  }

  /** Close the account menu on any click outside of it. */
  onDocumentClick(event: MouseEvent): void {
    if (!this.menuOpen()) return;

    const menu = this.accountMenu()?.nativeElement;
    if (menu && !menu.contains(event.target as Node)) {
      this.menuOpen.set(false);
    }
  }
}
