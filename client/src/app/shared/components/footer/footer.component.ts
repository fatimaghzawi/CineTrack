import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LogoComponent } from '@shared/components/logo/logo.component';

interface FooterColumn {
  heading: string;
  links: { label: string; route: string }[];
}

/**
 * Page footer — brand lockup, secondary navigation and the TMDb attribution
 * their terms require. Inverts the navbar's top bar (`border-t` instead of
 * `border-b`) so the page is bracketed by the same hairline.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, LogoComponent],
  host: { class: 'block' },
  template: `
    <footer class="mt-16 bg-surface-dark border-t border-hairline">
      <div class="page-container !py-10 lg:!py-12">
        <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <!-- Brand -->
          <div>
            <a routerLink="/dashboard" aria-label="CineTrack home">
              <app-logo size="sm" [showWordmark]="true" />
            </a>
            <p class="mt-4 text-[13.5px] leading-relaxed text-text-secondary max-w-xs">
              Your personal movie and TV tracker — keep every watchlist, rating and rewatch
              in one place.
            </p>
          </div>

          <!-- Link columns -->
          @for (column of columns; track column.heading) {
            <nav [attr.aria-label]="column.heading">
              <h3
                class="text-2xs font-semibold uppercase tracking-[0.12em] text-text-muted"
              >
                {{ column.heading }}
              </h3>
              <ul class="mt-4 space-y-2.5">
                @for (link of column.links; track link.route) {
                  <li>
                    <a
                      [routerLink]="link.route"
                      class="text-[14px] text-text-secondary hover:text-text-primary
                             transition-colors"
                    >
                      {{ link.label }}
                    </a>
                  </li>
                }
              </ul>
            </nav>
          }
        </div>

        <div
          class="divider mt-10 pt-6 flex flex-col sm:flex-row sm:items-center
                 justify-between gap-3"
        >
          <p class="text-xs text-text-muted">© {{ year }} CineTrack. All rights reserved.</p>
          <p class="text-xs text-text-muted">
            Movie and TV data provided by
            <span class="text-text-secondary">TMDb</span>.
          </p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  year = new Date().getFullYear();

  columns: FooterColumn[] = [
    {
      heading: 'Browse',
      links: [
        { label: 'Home', route: '/dashboard' },
        { label: 'Movies', route: '/movies' },
        { label: 'TV Shows', route: '/tv-shows' },
        { label: 'Discover', route: '/discover' },
      ],
    },
    {
      heading: 'Library',
      links: [
        { label: 'Watchlist', route: '/watchlist' },
        { label: 'Favorites', route: '/favorites' },
        { label: 'Collections', route: '/collections' },
        { label: 'Journal', route: '/journal' },
      ],
    },
    {
      heading: 'More',
      links: [
        { label: 'Statistics', route: '/statistics' },
        { label: 'Calendar', route: '/calendar' },
        { label: 'Settings', route: '/settings' },
      ],
    },
  ];
}
