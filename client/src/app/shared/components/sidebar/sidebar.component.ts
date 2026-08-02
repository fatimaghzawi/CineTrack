import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '@core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      class="fixed lg:static z-30 h-full flex flex-col bg-surface-dark border-r border-surface-elevated/50 transition-all duration-300"
      [class]="collapsed() ? '-translate-x-full lg:translate-x-0 lg:w-[72px]' : 'translate-x-0 w-[240px]'"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 h-16 border-b border-surface-elevated/50">
        <div class="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center flex-shrink-0">
          <svg class="w-4.5 h-4.5 text-surface-deep" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z" />
          </svg>
        </div>
        @if (!collapsed()) {
          <span class="text-base font-bold text-text-primary tracking-tight">
            Cine<span class="text-primary">Track</span>
          </span>
        }
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        @for (item of mainNav; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="!bg-primary/10 !text-primary !border-l-primary"
            [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary
                   hover:bg-surface-card hover:text-text-primary transition-all duration-200
                   border-l-2 border-transparent"
            [class.justify-center]="collapsed()"
            [attr.title]="collapsed() ? item.label : null"
          >
            <span class="text-[18px] flex-shrink-0 w-5 text-center" [innerHTML]="item.icon"></span>
            @if (!collapsed()) {
              <span class="text-[13px] font-medium">{{ item.label }}</span>
            }
          </a>
        }

        <!-- Divider -->
        <div class="!my-3 border-t border-surface-elevated/50"></div>

        @for (item of secondaryNav; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="!bg-primary/10 !text-primary !border-l-primary"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary
                   hover:bg-surface-card hover:text-text-primary transition-all duration-200
                   border-l-2 border-transparent"
            [class.justify-center]="collapsed()"
            [attr.title]="collapsed() ? item.label : null"
          >
            <span class="text-[18px] flex-shrink-0 w-5 text-center" [innerHTML]="item.icon"></span>
            @if (!collapsed()) {
              <span class="text-[13px] font-medium">{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <!-- User profile section at bottom -->
      <div class="p-3 border-t border-surface-elevated/50">
        <a
          routerLink="/settings"
          routerLinkActive="text-primary"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary
                 hover:bg-surface-card hover:text-text-primary transition-all duration-200"
          [class.justify-center]="collapsed()"
        >
          <div class="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-xs font-bold text-surface-deep flex-shrink-0">
            {{ userInitial() }}
          </div>
          @if (!collapsed()) {
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-text-primary truncate">{{ auth.user()?.displayName }}</p>
              <p class="text-xs text-text-muted">View Profile</p>
            </div>
            <svg class="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          }
        </a>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  collapsed = input(false);
  toggle = output<void>();

  mainNav: NavItem[] = [
    { label: 'Home', icon: '🏠', route: '/dashboard' },
    { label: 'Explore', icon: '🧭', route: '/discover' },
    { label: 'Movies', icon: '🎬', route: '/movies' },
    { label: 'TV Shows', icon: '📺', route: '/tv-shows' },
    { label: 'Watchlist', icon: '📋', route: '/watchlist' },
    { label: 'Calendar', icon: '📅', route: '/calendar' },
  ];

  secondaryNav: NavItem[] = [
    { label: 'Stats', icon: '📊', route: '/statistics' },
    { label: 'Journal', icon: '📓', route: '/journal' },
    { label: 'Collections', icon: '📁', route: '/collections' },
    { label: 'Favorites', icon: '❤️', route: '/favorites' },
    { label: 'Settings', icon: '⚙️', route: '/settings' },
  ];

  constructor(public auth: AuthService) {}

  userInitial(): string {
    const name = this.auth.user()?.displayName ?? '?';
    return name.charAt(0).toUpperCase();
  }
}
