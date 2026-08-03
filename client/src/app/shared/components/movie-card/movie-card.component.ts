import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TmdbMedia } from '@core/models/movie.model';
import { TmdbService } from '@core/services/tmdb.service';
import { IconComponent } from '@shared/components/icon/icon.component';

/**
 * Poster tile — 2:3 artwork, yellow "watched" check, title + rating/year row.
 * The core grid unit across Discover, Watchlist, Favorites and Similar rails.
 */
@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <a [routerLink]="detailRoute()" class="group block">
      <div
        class="relative aspect-[2/3] overflow-hidden rounded-xl bg-surface-card
               ring-1 ring-hairline transition-all duration-300 ease-smooth
               group-hover:ring-primary/50"
      >
        <img
          [src]="tmdb.posterUrl(media().poster_path)"
          [alt]="tmdb.getTitle(media())"
          class="w-full h-full object-cover transition-transform duration-500 ease-smooth
                 group-hover:scale-[1.06]"
          loading="lazy"
        />

        @if (showWatchedBadge()) {
          <span class="check-dot absolute top-2 right-2" title="Watched">
            <app-icon name="check" class="w-3.5 h-3.5" [strokeWidth]="3" />
          </span>
        }

        <!-- Hover scrim + play affordance -->
        <div
          class="absolute inset-0 bg-card-scrim opacity-0 group-hover:opacity-100
                 transition-opacity duration-300 flex items-end justify-center pb-4"
        >
          <span class="play-fab h-10 w-10">
            <app-icon name="play" class="w-4 h-4 ml-0.5" />
          </span>
        </div>
      </div>

      <div class="mt-3 space-y-1">
        <h3
          class="text-[13.5px] font-semibold text-text-primary truncate
                 transition-colors group-hover:text-primary"
        >
          {{ tmdb.getTitle(media()) }}
        </h3>

        <div class="flex items-center justify-between gap-2">
          @if (episodeInfo()) {
            <span class="text-xs text-text-muted truncate">{{ episodeInfo() }}</span>
          } @else {
            @if (media().vote_average > 0) {
              <span class="inline-flex items-center gap-1 min-w-0">
                <app-icon name="star" class="w-3.5 h-3.5 text-primary" />
                <span class="text-xs font-semibold text-text-secondary">
                  {{ media().vote_average.toFixed(1) }}
                </span>
              </span>
            } @else {
              <span class="text-xs text-text-muted">Unrated</span>
            }
            <span class="text-xs text-text-muted shrink-0">{{ tmdb.getYear(media()) }}</span>
          }
        </div>
      </div>
    </a>
  `,
})
export class MovieCardComponent {
  media = input.required<TmdbMedia>();
  showWatchedBadge = input(false);
  episodeInfo = input('');

  constructor(public tmdb: TmdbService) {}

  detailRoute(): string {
    const m = this.media();
    const type = m.media_type || (m.title ? 'movie' : 'tv');
    return `/${type}/${m.id}`;
  }
}
