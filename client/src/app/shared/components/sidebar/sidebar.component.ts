import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { IconComponent, IconName } from '@shared/components/icon/icon.component';
import { LogoComponent } from '@shared/components/logo/logo.component';

interface NavItem {
  label: string;
  icon: IconName;
  route: string;
  exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent, LogoComponent],
  template: `
    <aside
      class="fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 flex flex-col
             bg-surface-dark border-r border-hairline
             transition-transform duration-300 ease-smooth"
      [class]="open() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <!-- Brand -->
      <div class="h-16 flex items-center justify-between gap-2 px-5 shrink-0">
        <a routerLink="/dashboard" (click)="navigate.emit()" aria-label="CineTrack home">
          <app-logo size="md" />
        </a>
        <button
          type="button"
          class="btn-round lg:hidden -mr-2"
          (click)="navigate.emit()"
          aria-label="Close menu"
        >
          <app-icon name="close" class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto px-3 pb-4 space-y-1 scrollbar-none">
        @for (item of mainNav; track item.route) {
          <a
            [routerLink]="item.route"
            [routerLinkActiveOptions]="{ exact: !!item.exact }"
            routerLinkActive="nav-item-active"
            (click)="navigate.emit()"
            class="nav-item"
          >
            <app-icon [name]="item.icon" class="w-[18px] h-[18px]" />
            <span class="truncate">{{ item.label }}</span>
          </a>
        }

        <div class="divider !my-3 mx-3"></div>

        @for (item of libraryNav; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="nav-item-active"
            (click)="navigate.emit()"
            class="nav-item"
          >
            <app-icon [name]="item.icon" class="w-[18px] h-[18px]" />
            <span class="truncate">{{ item.label }}</span>
          </a>
        }
      </nav>

      <!-- User card -->
      <div class="p-3 shrink-0">
        <a
          routerLink="/settings"
          (click)="navigate.emit()"
          class="group flex items-center gap-3 rounded-xl bg-surface-card border border-hairline
                 p-2.5 transition-all duration-200 ease-smooth hover:border-primary/40"
        >
          <span
            class="grid place-items-center h-9 w-9 rounded-full bg-gold-gradient
                   text-[13px] font-bold text-surface-deep shrink-0"
          >
            {{ userInitial() }}
          </span>
          <span class="flex-1 min-w-0">
            <span class="block text-[13.5px] font-semibold text-text-primary truncate">
              {{ auth.user()?.displayName || 'Guest' }}
            </span>
            <span class="block text-2xs text-text-muted">View Profile</span>
          </span>
          <app-icon
            name="chevron-up"
            class="w-4 h-4 text-text-muted group-hover:text-primary transition-colors"
          />
        </a>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  /** Drawer visibility on mobile; the rail is always shown from `lg` up. */
  open = input(false);
  /** Emitted whenever a link is used so the shell can close the mobile drawer. */
  navigate = output<void>();

  mainNav: NavItem[] = [
    { label: 'Home', icon: 'home', route: '/dashboard', exact: true },
    { label: 'Explore', icon: 'compass', route: '/discover' },
    { label: 'Movies', icon: 'film', route: '/movies' },
    { label: 'TV Shows', icon: 'tv', route: '/tv-shows' },
    { label: 'Watchlist', icon: 'bookmark', route: '/watchlist' },
    { label: 'Calendar', icon: 'calendar', route: '/calendar' },
  ];

  libraryNav: NavItem[] = [
    { label: 'Favorites', icon: 'heart', route: '/favorites' },
    { label: 'Journal', icon: 'book', route: '/journal' },
    { label: 'Collections', icon: 'folder', route: '/collections' },
    { label: 'Stats', icon: 'chart', route: '/statistics' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  constructor(public auth: AuthService) {}

  userInitial(): string {
    return (this.auth.user()?.displayName ?? '?').charAt(0).toUpperCase();
  }
}
