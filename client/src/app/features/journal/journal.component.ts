import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';

import { ApiService } from '@core/services/api.service';
import { TmdbService } from '@core/services/tmdb.service';
import { ToastService } from '@core/services/toast.service';
import { JournalEntry, TmdbMedia } from '@core/models/movie.model';
import { PaginatedData } from '@core/models/api-response.model';
import { MediaSearchComponent } from '@shared/components/media-search/media-search.component';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { TruncatePipe } from '@shared/pipes/truncate.pipe';

const MOODS = [
  { emoji: '😍', label: 'Loved it' },
  { emoji: '😊', label: 'Enjoyed' },
  { emoji: '😐', label: 'Meh' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😱', label: 'Scared' },
  { emoji: '🤯', label: 'Mind-blown' },
  { emoji: '😴', label: 'Boring' },
  { emoji: '😂', label: 'Hilarious' },
];

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    DatePipe,
    MediaSearchComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    IconComponent,
    TruncatePipe,
  ],
  template: `
    <div class="page-container animate-fade-in">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 class="page-title">Journal</h1>
          <p class="mt-1.5 text-sm text-text-secondary">Your personal movie diary</p>
        </div>

        <button
          type="button"
          (click)="showForm.set(!showForm())"
          [class]="showForm() ? 'btn-secondary' : 'btn-primary'"
        >
          <app-icon [name]="showForm() ? 'close' : 'plus'" class="w-4 h-4" />
          {{ showForm() ? 'Cancel' : 'New Entry' }}
        </button>
      </div>

      <!-- Composer -->
      @if (showForm()) {
        <div class="panel p-5 sm:p-6 mb-7 animate-slide-up">
          <h3 class="section-title mb-5">Write a Journal Entry</h3>

          <div>
            <span class="label">Movie or TV Show</span>
            <app-media-search
              [(selected)]="picked"
              placeholder="Search by title, e.g. &quot;spider&quot;"
            />
          </div>

          <div class="mt-5">
            <label for="j-title" class="label">Entry Title</label>
            <input
              id="j-title"
              type="text"
              [(ngModel)]="form.title"
              placeholder="Optional — defaults to the title you picked"
              class="input-field"
            />
          </div>

          <div class="mt-5">
            <label for="j-body" class="label">Your Thoughts</label>
            <textarea
              id="j-body"
              [(ngModel)]="form.body"
              placeholder="What did you think?"
              rows="5"
              class="input-field resize-none"
            ></textarea>
          </div>

          <div class="mt-5">
            <span class="label">Mood</span>
            <div class="flex flex-wrap gap-2">
              @for (mood of moods; track mood.label) {
                <button
                  type="button"
                  (click)="form.mood = mood.label"
                  class="chip !h-9"
                  [class]="
                    form.mood === mood.label
                      ? 'bg-primary/15 text-primary ring-1 ring-primary/40'
                      : 'bg-surface-card text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                  "
                >
                  <span aria-hidden="true">{{ mood.emoji }}</span>
                  {{ mood.label }}
                </button>
              }
            </div>
          </div>

          <div class="grid gap-5 sm:grid-cols-2 mt-5">
            <div>
              <label for="j-date" class="label">Watched On</label>
              <input id="j-date" type="date" [(ngModel)]="form.watchedAt" class="input-field" />
            </div>
            <div class="flex items-end">
              <label class="flex items-center gap-3 cursor-pointer h-11">
                <input
                  type="checkbox"
                  [(ngModel)]="form.isSpoiler"
                  class="w-4 h-4 rounded border-surface-elevated bg-surface-card"
                />
                <span class="text-sm text-text-secondary">Contains spoilers</span>
              </label>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button type="button" (click)="showForm.set(false)" class="btn-ghost">Cancel</button>
            <button type="button" (click)="createEntry()" [disabled]="saving()" class="btn-primary">
              {{ saving() ? 'Saving...' : 'Save Entry' }}
            </button>
          </div>
        </div>
      }

      <!-- Entries -->
      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1, 2, 3, 4]; track i) {
            <app-skeleton height="128px" className="rounded-2xl" />
          }
        </div>
      } @else if (entries().length === 0) {
        <app-empty-state
          icon="book"
          title="No journal entries yet"
          message="Start writing about the films and shows you watch — they'll appear here."
        />
      } @else {
        <div class="space-y-4">
          @for (entry of entries(); track entry.id) {
            <article class="panel p-4 sm:p-5 transition-colors duration-200 hover:border-primary/30">
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-start gap-3.5 min-w-0">
                  @if (mediaCache().get(entry.tmdbId); as media) {
                    <a
                      [routerLink]="'/' + entry.mediaType + '/' + entry.tmdbId"
                      class="shrink-0 w-11 h-16 rounded-lg overflow-hidden bg-surface-card
                             ring-1 ring-hairline hover:ring-primary/50 transition-all"
                    >
                      <img
                        [src]="tmdb.posterUrl(media.poster_path, 'w185')"
                        [alt]="tmdb.getTitle(media)"
                        class="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </a>
                  }

                  <div class="min-w-0">
                    <h3 class="font-semibold text-text-primary truncate">
                      {{ entry.title || 'Untitled' }}
                    </h3>
                    <div class="flex flex-wrap items-center gap-2 mt-1.5">
                      @if (entry.mood) {
                        <span class="badge-primary">
                          <span aria-hidden="true">{{ getMoodEmoji(entry.mood) }}</span>
                          {{ entry.mood }}
                        </span>
                      }
                      @if (entry.isSpoiler) {
                        <span class="badge-dropped">Spoiler</span>
                      }
                      <span class="text-2xs text-text-muted">
                        {{ entry.createdAt | date: 'mediumDate' }}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="deleteEntry(entry)"
                  aria-label="Delete entry"
                  class="btn-round h-9 w-9 shrink-0 hover:!text-red-400 hover:!bg-red-500/10"
                >
                  <app-icon name="trash" class="w-4 h-4" />
                </button>
              </div>

              <p class="mt-3.5 text-[13.5px] leading-relaxed text-text-secondary">
                {{ entry.body | truncate: 300 }}
              </p>
            </article>
          }
        </div>
      }
    </div>
  `,
})
export class JournalComponent implements OnInit {
  entries = signal<JournalEntry[]>([]);
  mediaCache = signal<Map<number, TmdbMedia>>(new Map());
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  moods = MOODS;

  /** The title this entry is about, chosen by name via <app-media-search>. */
  picked = signal<TmdbMedia | null>(null);

  form = {
    title: '',
    body: '',
    mood: '',
    watchedAt: '',
    isSpoiler: false,
  };

  constructor(
    private api: ApiService,
    public tmdb: TmdbService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadEntries();
  }

  loadEntries(): void {
    this.loading.set(true);
    this.api.get<PaginatedData<JournalEntry>>('/journal').subscribe({
      next: (res) => {
        this.entries.set(res.data.items);
        this.loading.set(false);
        res.data.items.forEach((entry) => {
          this.fetchMedia(entry.tmdbId, entry.mediaType);
        });
      },
      error: () => this.loading.set(false),
    });
  }

  private fetchMedia(tmdbId: number, mediaType: string): void {
    const obs: Observable<any> =
      mediaType === 'movie' ? this.tmdb.getMovie(tmdbId) : this.tmdb.getTv(tmdbId);

    obs.subscribe((media: any) => {
      this.mediaCache.update((c) => {
        const m = new Map(c);
        m.set(tmdbId, media as TmdbMedia);
        return m;
      });
    });
  }

  createEntry(): void {
    const media = this.picked();
    if (!media) {
      this.toast.error('Pick a movie or TV show first');
      return;
    }
    if (!this.form.body.trim()) {
      this.toast.error('Write a few thoughts before saving');
      return;
    }

    this.saving.set(true);
    // Fall back to the title's own name so entries are never listed as "Untitled".
    const title = this.form.title.trim() || this.tmdb.getTitle(media);
    const payload: Record<string, unknown> = {
      tmdbId: media.id,
      mediaType: media.media_type ?? 'movie',
      body: this.form.body.trim(),
      title,
    };
    if (this.form.mood) payload['mood'] = this.form.mood;
    if (this.form.watchedAt) payload['watchedAt'] = new Date(this.form.watchedAt).toISOString();
    if (this.form.isSpoiler) payload['isSpoiler'] = true;

    this.api.post<{ entry: JournalEntry }>('/journal', payload).subscribe({
      next: (res) => {
        this.entries.update((list) => [res.data.entry, ...list]);
        // The poster is already in hand — seed the cache so the new row shows it
        // without a second round-trip.
        this.mediaCache.update((c) => new Map(c).set(media.id, media));
        this.resetForm();
        this.showForm.set(false);
        this.saving.set(false);
        this.toast.success('Journal entry saved!');
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err.error?.error?.message || 'Failed to save entry');
      },
    });
  }

  deleteEntry(entry: JournalEntry): void {
    this.api.delete(`/journal/${entry.id}`).subscribe({
      next: () => {
        this.entries.update((list) => list.filter((e) => e.id !== entry.id));
        this.toast.success('Entry deleted');
      },
      error: () => this.toast.error('Failed to delete'),
    });
  }

  getMoodEmoji(mood: string): string {
    return this.moods.find((m) => m.label === mood)?.emoji || '🎬';
  }

  private resetForm(): void {
    this.picked.set(null);
    this.form = {
      title: '',
      body: '',
      mood: '',
      watchedAt: '',
      isSpoiler: false,
    };
  }
}
