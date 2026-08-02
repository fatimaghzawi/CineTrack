import { Component, output } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <header class="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-surface-elevated/50 bg-surface-dark/80 backdrop-blur-xl">
      <!-- Left: hamburger -->
      <div class="flex items-center gap-4 flex-1">
        <button
          (click)="menuClick.emit()"
          class="lg:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-card hover:text-text-primary transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <!-- Search bar -->
        <div class="relative max-w-lg flex-1">
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search movies, shows..."
            [(ngModel)]="searchQuery"
            (keyup.enter)="onSearch()"
            class="w-full bg-surface-card/60 border border-surface-elevated/50 rounded-full pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:bg-surface-card transition-all"
          />
        </div>
      </div>

      <!-- Right: notification + avatar -->
      <div class="flex items-center gap-2">
        <!-- Notification bell -->
        <button class="relative p-2.5 rounded-full text-text-secondary hover:bg-surface-card hover:text-text-primary transition-all">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          <!-- Notification dot -->
          <span class="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        <!-- User avatar -->
        <div class="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center text-sm font-bold text-surface-deep cursor-pointer">
          {{ userInitial() }}
        </div>
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
    const name = this.auth.user()?.displayName ?? '?';
    return name.charAt(0).toUpperCase();
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
