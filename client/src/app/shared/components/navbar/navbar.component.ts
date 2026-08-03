import { Component, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '@core/services/auth.service';
import { IconComponent } from '@shared/components/icon/icon.component';
import { LogoComponent } from '@shared/components/logo/logo.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent, LogoComponent],
  template: `
    <header
      class="sticky top-0 z-30 h-16 shrink-0 flex items-center gap-3 px-4 sm:px-6
             bg-surface-dark/85 backdrop-blur-xl border-b border-hairline"
    >
      <!-- Mobile: menu + compact brand -->
      <button
        type="button"
        (click)="menuClick.emit()"
        class="btn-round lg:hidden -ml-2"
        aria-label="Open menu"
      >
        <app-icon name="menu" class="w-5 h-5" />
      </button>

      <a routerLink="/dashboard" class="lg:hidden" aria-label="CineTrack home">
        <app-logo size="sm" [showWordmark]="false" />
      </a>

      <!-- Search -->
      <div class="flex-1 flex justify-center lg:justify-start">
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

        <a
          routerLink="/settings"
          class="grid place-items-center h-9 w-9 rounded-full bg-gold-gradient
                 text-[13px] font-bold text-surface-deep
                 ring-2 ring-transparent hover:ring-primary/40 transition-all duration-200"
          [attr.aria-label]="'Account: ' + (auth.user()?.displayName || 'Guest')"
        >
          {{ userInitial() }}
        </a>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  menuClick = output<void>();
  searchQuery = '';

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
}
