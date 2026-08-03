import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TmdbMedia } from '@core/models/movie.model';
import { TmdbService } from '@core/services/tmdb.service';
import { IconComponent } from '@shared/components/icon/icon.component';

/**
 * Wide 16:9 artwork tile with a play affordance and a yellow progress bar —
 * the "Continue Watching" card from the reference design.
 */
@Component({
  selector: 'app-media-tile',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <a
      [routerLink]="detailRoute()"
      class="group relative block overflow-hidden rounded-xl bg-surface-card
             ring-1 ring-hairline transition-all duration-300 ease-smooth
             hover:ring-primary/50"
    >
      <div class="relative aspect-video">
        <img
          [src]="backdrop()"
          [alt]="tmdb.getTitle(media())"
          class="absolute inset-0 w-full h-full object-cover transition-transform
                 duration-500 ease-smooth group-hover:scale-105"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-card-scrim"></div>

        <!-- Play -->
        <span
          class="play-fab absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                 h-11 w-11 opacity-90 group-hover:opacity-100 group-hover:scale-105"
        >
          <app-icon name="play" class="w-4 h-4 ml-0.5" />
        </span>

        <!-- Meta over the scrim -->
        <div class="absolute inset-x-0 bottom-0 p-3">
          <p class="text-[13px] font-semibold text-white truncate">
            {{ tmdb.getTitle(media()) }}
          </p>
          @if (subtitle()) {
            <p class="text-2xs text-white/70 mt-0.5">{{ subtitle() }}</p>
          }

          <div class="flex items-center gap-2 mt-2">
            <span class="flex-1 h-1 rounded-full bg-white/25 overflow-hidden">
              <span
                class="block h-full rounded-full bg-primary transition-[width] duration-700 ease-smooth"
                [style.width.%]="clampedProgress()"
              ></span>
            </span>
            @if (remaining()) {
              <span class="text-2xs text-white/70 shrink-0">{{ remaining() }}</span>
            }
          </div>
        </div>
      </div>
    </a>
  `,
})
export class MediaTileComponent {
  media = input.required<TmdbMedia>();
  subtitle = input('');
  progress = input(0);
  remaining = input('');

  constructor(public tmdb: TmdbService) {}

  /** Falls back to the poster when a title has no backdrop art. */
  backdrop(): string {
    const m = this.media();
    return m.backdrop_path
      ? this.tmdb.backdropUrl(m.backdrop_path, 'w780')
      : this.tmdb.posterUrl(m.poster_path, 'w500');
  }

  clampedProgress(): number {
    return Math.min(100, Math.max(0, this.progress()));
  }

  detailRoute(): string {
    const m = this.media();
    const type = m.media_type || (m.title ? 'movie' : 'tv');
    return `/${type}/${m.id}`;
  }
}
