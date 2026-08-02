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
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
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
  imports: [FormsModule, RouterLink, DatePipe, SkeletonLoaderComponent, TruncatePipe],
  template: `
    <div class="page-container animate-fade-in">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-text-primary">Journal</h1>
          <p class="text-text-secondary mt-1">Your personal movie diary</p>
        </div>
        <button (click)="showForm.set(!showForm())" class="btn-primary flex items-center gap-2">
          @if (showForm()) {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Cancel
          } @else {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            New Entry
          }
        </button>
      </div>

      @if (showForm()) {
        <div class="card p-6 mb-8 animate-slide-up">
          <h3 class="text-lg font-semibold text-text-primary mb-5">Write a Journal Entry</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">TMDb ID</label>
              <input type="number" [(ngModel)]="form.tmdbId" placeholder="e.g. 550" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">Type</label>
              <select [(ngModel)]="form.mediaType" class="input-field">
                <option value="movie">Movie</option>
                <option value="tv">TV Show</option>
              </select>
            </div>
          </div>

          <div class="mb-5">
            <label class="block text-sm font-medium text-text-secondary mb-2">Title</label>
            <input type="text" [(ngModel)]="form.title" placeholder="Give your entry a title" class="input-field" />
          </div>

          <div class="mb-5">
            <label class="block text-sm font-medium text-text-secondary mb-2">Your Thoughts</label>
            <textarea [(ngModel)]="form.body" placeholder="What did you think?" rows="5" class="input-field resize-none"></textarea>
          </div>

          <div class="mb-5">
            <label class="block text-sm font-medium text-text-secondary mb-3">Mood</label>
            <div class="flex flex-wrap gap-2">
              @for (mood of moods; track mood.label) {
                <button
                  (click)="form.mood = mood.label"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all"
                  [class]="form.mood === mood.label
                    ? 'bg-primary/15 text-primary border border-primary/30'
                    : 'bg-surface-elevated text-text-secondary border border-transparent hover:border-surface-elevated'"
                >
                  <span>{{ mood.emoji }}</span>
                  <span>{{ mood.label }}</span>
                </button>
              }
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">Watched On</label>
              <input type="date" [(ngModel)]="form.watchedAt" class="input-field" />
            </div>
            <div class="flex items-end">
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" [(ngModel)]="form.isSpoiler"
                  class="w-5 h-5 rounded bg-surface-elevated border-surface-elevated text-primary focus:ring-primary" />
                <span class="text-sm text-text-secondary">Contains spoilers</span>
              </label>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button (click)="showForm.set(false)" class="btn-ghost">Cancel</button>
            <button (click)="createEntry()" [disabled]="saving()" class="btn-primary">
              {{ saving() ? 'Saving...' : 'Save Entry' }}
            </button>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3,4]; track i) {
            <app-skeleton height="120px" className="rounded-2xl" />
          }
        </div>
      } @else if (entries().length === 0) {
        <div class="text-center py-20">
          <div class="text-5xl mb-4">📓</div>
          <h3 class="text-xl font-semibold text-text-primary mb-2">No journal entries yet</h3>
          <p class="text-text-secondary mb-6">Start writing about your movie experiences</p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (entry of entries(); track entry.id) {
            <div class="card p-5 hover:border-primary/20 transition-all">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  @if (mediaCache().get(entry.tmdbId); as media) {
                    <a [routerLink]="'/' + entry.mediaType + '/' + entry.tmdbId"
                      class="flex-shrink-0 w-10 h-14 rounded-lg overflow-hidden bg-surface-elevated">
                      <img [src]="tmdb.posterUrl(media.poster_path, 'w185')" class="w-full h-full object-cover" />
                    </a>
                  }
                  <div>
                    <h3 class="font-semibold text-text-primary">{{ entry.title || 'Untitled' }}</h3>
                    <div class="flex items-center gap-2 mt-1">
                      @if (entry.mood) {
                        <span class="badge-primary text-xs">{{ getMoodEmoji(entry.mood) }} {{ entry.mood }}</span>
                      }
                      @if (entry.isSpoiler) {
                        <span class="badge bg-red-500/15 text-red-400 text-xs">Spoiler</span>
                      }
                      <span class="text-xs text-text-muted">{{ entry.createdAt | date:'mediumDate' }}</span>
                    </div>
                  </div>
                </div>
                <button (click)="deleteEntry(entry)"
                  class="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
              <p class="text-text-secondary text-sm leading-relaxed">{{ entry.body | truncate:300 }}</p>
            </div>
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

  form = {
    tmdbId: null as number | null,
    mediaType: 'movie' as 'movie' | 'tv',
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
    const obs: Observable<any> = mediaType === 'movie'
      ? this.tmdb.getMovie(tmdbId)
      : this.tmdb.getTv(tmdbId);

    obs.subscribe((media: any) => {
      this.mediaCache.update((c) => {
        const m = new Map(c);
        m.set(tmdbId, media as TmdbMedia);
        return m;
      });
    });
  }

  createEntry(): void {
    if (!this.form.tmdbId || !this.form.body.trim()) {
      this.toast.error('TMDb ID and body are required');
      return;
    }

    this.saving.set(true);
    const payload: Record<string, unknown> = {
      tmdbId: this.form.tmdbId,
      mediaType: this.form.mediaType,
      body: this.form.body.trim(),
    };
    if (this.form.title.trim()) payload['title'] = this.form.title.trim();
    if (this.form.mood) payload['mood'] = this.form.mood;
    if (this.form.watchedAt) payload['watchedAt'] = new Date(this.form.watchedAt).toISOString();
    if (this.form.isSpoiler) payload['isSpoiler'] = true;

    this.api.post<JournalEntry>('/journal', payload).subscribe({
      next: (res) => {
        this.entries.update((list) => [res.data, ...list]);
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
    this.form = {
      tmdbId: null,
      mediaType: 'movie',
      title: '',
      body: '',
      mood: '',
      watchedAt: '',
      isSpoiler: false,
    };
  }
}
