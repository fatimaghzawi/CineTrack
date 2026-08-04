import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { TmdbService } from '@core/services/tmdb.service';
import { WatchlistService } from '@core/services/watchlist.service';
import { TmdbMedia, TmdbTvDetails, TmdbEpisode } from '@core/models/movie.model';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';

/** One episode airing (or having aired) on a given calendar day, for a tracked show. */
interface CalendarEvent {
  media: TmdbMedia;
  episode: TmdbEpisode;
  kind: 'upcoming' | 'aired';
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Formats a Date as a local `YYYY-MM-DD` key (avoids UTC off-by-one from toISOString). */
function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Returns the Monday (00:00 local time) of the week containing `date`. */
function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Convert Sunday=0..Saturday=6 to Monday=0..Sunday=6
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Personal episode-air calendar. Shows a week strip; selecting a day lists
 * episodes airing (or that recently aired) for TV shows on the user's
 * watchlist. Data comes from the user's real watchlist (`/watchlist`) plus
 * TMDb's `next_episode_to_air` / `last_episode_to_air` per show — there is
 * no dedicated "schedule" endpoint, so this is assembled client-side.
 */
@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [RouterLink, SkeletonLoaderComponent],
  template: `
    <div class="page-container animate-fade-in">
      <div class="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 class="text-3xl font-bold text-text-primary">Calendar</h1>
          <p class="text-text-secondary text-sm mt-1">Episode air dates for shows on your watchlist</p>
        </div>
        <button
          type="button"
          (click)="goToToday()"
          class="px-4 py-2 rounded-lg text-sm font-medium bg-surface-card text-text-secondary hover:text-primary transition-colors"
        >
          Today
        </button>
      </div>

      <!-- Week navigation -->
      <div class="flex items-center justify-between mb-4">
        <button
          type="button"
          (click)="shiftWeek(-1)"
          class="w-9 h-9 flex items-center justify-center rounded-full bg-surface-card text-text-secondary hover:text-primary transition-colors"
          aria-label="Previous week"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <p class="text-sm font-medium text-text-secondary">{{ weekRangeLabel() }}</p>
        <button
          type="button"
          (click)="shiftWeek(1)"
          class="w-9 h-9 flex items-center justify-center rounded-full bg-surface-card text-text-secondary hover:text-primary transition-colors"
          aria-label="Next week"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <!-- Day strip -->
      <div class="grid grid-cols-7 gap-2 mb-8">
        @for (day of weekDays(); track day.key) {
          <button
            type="button"
            (click)="selectedKey.set(day.key)"
            class="flex flex-col items-center gap-1 py-3 rounded-xl transition-all"
            [class]="selectedKey() === day.key
              ? 'bg-primary text-surface-deep'
              : 'bg-surface-card text-text-secondary hover:text-text-primary'"
          >
            <span class="text-[11px] font-medium uppercase tracking-wide opacity-80">{{ day.weekday }}</span>
            <span class="text-lg font-bold">{{ day.dateNum }}</span>
            @if (day.isToday) {
              <span
                class="w-1 h-1 rounded-full"
                [class]="selectedKey() === day.key ? 'bg-surface-deep' : 'bg-primary'"
              ></span>
            }
          </button>
        }
      </div>

      <h2 class="text-lg font-semibold text-text-primary mb-4">{{ selectedDayLabel() }}</h2>

      @if (loading()) {
        <div class="space-y-3">
          @for (i of [1,2,3,4]; track i) {
            <app-skeleton height="84px" className="rounded-xl" />
          }
        </div>
      } @else if (trackedShowCount() === 0) {
        <!-- User has no TV shows tracked at all — different from "nothing airs today" -->
        <div class="text-center py-16">
          <div class="text-4xl mb-3">📺</div>
          <h3 class="text-lg font-semibold text-text-primary mb-2">No TV shows tracked yet</h3>
          <p class="text-text-secondary mb-6">Add TV shows to your watchlist to see their episode air dates here.</p>
          <a routerLink="/discover" class="btn-primary">Discover Shows</a>
        </div>
      } @else if (selectedDayEvents().length === 0) {
        <div class="text-center py-16">
          <div class="text-4xl mb-3">📅</div>
          <p class="text-text-secondary">No episodes airing on this day.</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (event of selectedDayEvents(); track event.media.id + '-' + event.episode.id) {
            <a
              [routerLink]="'/tv/' + event.media.id"
              class="flex items-center gap-4 p-3 rounded-xl bg-surface-card hover:bg-surface-elevated transition-colors"
            >
              <img
                [src]="tmdb.posterUrl(event.media.poster_path, 'w185')"
                [alt]="tmdb.getTitle(event.media)"
                class="w-14 h-20 object-cover rounded-lg flex-shrink-0 bg-surface-elevated"
                loading="lazy"
              />
              <div class="min-w-0 flex-1">
                <p class="font-semibold text-text-primary truncate">{{ tmdb.getTitle(event.media) }}</p>
                <p class="text-sm text-text-secondary mt-0.5">
                  S{{ event.episode.season_number }} · E{{ event.episode.episode_number }}
                  @if (event.episode.name) { — {{ event.episode.name }} }
                </p>
                <span
                  class="inline-block mt-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
                  [class]="event.kind === 'upcoming' ? 'bg-primary/15 text-primary' : 'bg-surface-elevated text-text-muted'"
                >
                  {{ event.kind === 'upcoming' ? 'Airing' : 'Aired' }}
                </span>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class CalendarComponent implements OnInit {
  loading = signal(true);
  weekAnchor = signal(startOfWeek(new Date()));
  selectedKey = signal(dateKey(new Date()));
  eventsByDate = signal<Map<string, CalendarEvent[]>>(new Map());
  /** Count of TV shows on the watchlist, independent of the selected day — drives the "nothing tracked" empty state. */
  trackedShowCount = signal(0);

  /** The 7 days (Mon–Sun) of the currently viewed week, with display labels. */
  weekDays = computed(() => {
    const anchor = this.weekAnchor();
    const today = dateKey(new Date());
    return WEEKDAY_LABELS.map((weekday, i) => {
      const date = new Date(anchor);
      date.setDate(anchor.getDate() + i);
      const key = dateKey(date);
      return { key, weekday, dateNum: date.getDate(), isToday: key === today };
    });
  });

  weekRangeLabel = computed(() => {
    const first = new Date(this.weekAnchor());
    const last = new Date(this.weekAnchor());
    last.setDate(last.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(first)} – ${fmt(last)}, ${last.getFullYear()}`;
  });

  selectedDayLabel = computed(() => {
    const [y, m, d] = this.selectedKey().split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  });

  selectedDayEvents = computed(() => this.eventsByDate().get(this.selectedKey()) ?? []);

  constructor(
    public tmdb: TmdbService,
    private watchlistService: WatchlistService,
  ) {}

  ngOnInit(): void {
    this.loadSchedule();
  }

  /** Jumps the view back to the current week and selects today. */
  goToToday(): void {
    this.weekAnchor.set(startOfWeek(new Date()));
    this.selectedKey.set(dateKey(new Date()));
  }

  /** Moves the visible week forward/back by 7 days and re-selects to match. */
  shiftWeek(direction: 1 | -1): void {
    const next = new Date(this.weekAnchor());
    next.setDate(next.getDate() + direction * 7);
    this.weekAnchor.set(next);
    this.selectedKey.set(dateKey(next));
  }

  /**
   * Loads the user's TV watchlist, fetches each show's next/last air date
   * from TMDb, and groups the results into `eventsByDate` for O(1) lookup
   * by the currently selected day.
   */
  private loadSchedule(): void {
    this.loading.set(true);

    this.watchlistService.getAll({ mediaType: 'tv', limit: 100 }).subscribe({
      next: (data) => {
        this.trackedShowCount.set(data.items.length);

        if (data.items.length === 0) {
          this.loading.set(false);
          return;
        }

        const detailRequests = data.items.map((item) => {
          const request$: Observable<TmdbTvDetails> = this.tmdb.getTv(item.tmdbId);
          return request$.pipe(catchError(() => of(null)));
        });

        forkJoin(detailRequests).subscribe((detailsList) => {
          const map = new Map<string, CalendarEvent[]>();

          detailsList.forEach((tv) => {
            if (!tv) return;
            const media: TmdbMedia = { ...tv, media_type: 'tv' };

            // A show may have both a recently-aired and an upcoming episode;
            // record whichever of the two exist under their own air date.
            const add = (episode: TmdbEpisode | null, kind: CalendarEvent['kind']) => {
              if (!episode?.air_date) return;
              const list = map.get(episode.air_date) ?? [];
              list.push({ media, episode, kind });
              map.set(episode.air_date, list);
            };

            add(tv.next_episode_to_air, 'upcoming');
            add(tv.last_episode_to_air, 'aired');
          });

          this.eventsByDate.set(map);
          this.loading.set(false);
        });
      },
      error: () => this.loading.set(false),
    });
  }
}
