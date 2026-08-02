import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

import { ApiService } from '@core/services/api.service';
import { TmdbService } from '@core/services/tmdb.service';
import { ToastService } from '@core/services/toast.service';
import { Collection, TmdbMedia } from '@core/models/movie.model';
import { PaginatedData } from '@core/models/api-response.model';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, SkeletonLoaderComponent],
  template: `
    <div class="page-container animate-fade-in">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-text-primary">Collections</h1>
          <p class="text-text-secondary mt-1">Organize your titles into custom groups</p>
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
            New Collection
          }
        </button>
      </div>

      <!-- Create form -->
      @if (showForm()) {
        <div class="card p-6 mb-8 animate-slide-up">
          <h3 class="text-lg font-semibold text-text-primary mb-5">Create Collection</h3>

          <div class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">Name</label>
              <input
                type="text"
                [(ngModel)]="formName"
                placeholder="e.g. Best Sci-Fi of the Decade"
                class="input-field"
                maxlength="100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-2">Description</label>
              <textarea
                [(ngModel)]="formDesc"
                placeholder="What's this collection about?"
                rows="3"
                class="input-field resize-none"
                maxlength="1000"
              ></textarea>
            </div>

            <label class="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                [(ngModel)]="formPublic"
                class="w-5 h-5 rounded bg-surface-elevated border-surface-elevated text-primary focus:ring-primary"
              />
              <span class="text-sm text-text-secondary">Make this collection public</span>
            </label>

            <div class="flex justify-end gap-3">
              <button (click)="showForm.set(false)" class="btn-ghost">Cancel</button>
              <button (click)="createCollection()" [disabled]="saving()" class="btn-primary">
                {{ saving() ? 'Creating...' : 'Create' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Collections grid -->
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (i of [1,2,3]; track i) {
            <app-skeleton height="200px" className="rounded-2xl" />
          }
        </div>
      } @else if (collections().length === 0) {
        <div class="text-center py-20">
          <div class="text-5xl mb-4">📁</div>
          <h3 class="text-xl font-semibold text-text-primary mb-2">No collections yet</h3>
          <p class="text-text-secondary mb-6">Create your first collection to organize titles</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (collection of collections(); track collection.id) {
            <div class="card-hover p-5 cursor-pointer group" (click)="selectCollection(collection)">
              <!-- Cover mosaic -->
              <div class="relative h-32 rounded-xl overflow-hidden mb-4 bg-surface-elevated">
                @if (collection.coverTmdbId && coverCache().get(collection.coverTmdbId); as coverMedia) {
                  <img
                    [src]="tmdb.posterUrl(coverMedia.poster_path, 'w500')"
                    class="w-full h-full object-cover"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-surface-deep/80 to-transparent"></div>
                } @else {
                  <div class="w-full h-full flex items-center justify-center">
                    <span class="text-4xl">📁</span>
                  </div>
                }
                <div class="absolute bottom-2 right-2">
                  <span class="badge-primary text-xs">
                    {{ collection.items.length }} title{{ collection.items.length !== 1 ? 's' : '' }}
                  </span>
                </div>
              </div>

              <h3 class="font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                {{ collection.name }}
              </h3>
              @if (collection.description) {
                <p class="text-sm text-text-muted mt-1 line-clamp-2">{{ collection.description }}</p>
              }
              <div class="flex items-center justify-between mt-3">
                <span class="text-xs text-text-muted">{{ collection.createdAt | date:'mediumDate' }}</span>
                <div class="flex items-center gap-1">
                  @if (collection.isPublic) {
                    <span class="text-xs text-text-muted">🌐 Public</span>
                  } @else {
                    <span class="text-xs text-text-muted">🔒 Private</span>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Collection detail modal -->
      @if (selectedCollection(); as col) {
        <div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" (click)="selectedCollection.set(null)">
          <div class="bg-surface-dark rounded-2xl border border-surface-elevated max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 animate-scale-in" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-2xl font-bold text-text-primary">{{ col.name }}</h2>
              <div class="flex items-center gap-2">
                <button
                  (click)="deleteCollection(col)"
                  class="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
                <button
                  (click)="selectedCollection.set(null)"
                  class="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-card transition-all"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            @if (col.description) {
              <p class="text-text-secondary mb-5">{{ col.description }}</p>
            }

            @if (col.items.length === 0) {
              <p class="text-text-muted text-center py-8">No items in this collection yet.</p>
            } @else {
              <div class="space-y-3">
                @for (item of col.items; track item.tmdbId) {
                  <a
                    [routerLink]="'/' + item.mediaType + '/' + item.tmdbId"
                    (click)="selectedCollection.set(null)"
                    class="flex items-center gap-3 p-3 rounded-xl bg-surface-card hover:bg-surface-elevated transition-all"
                  >
                    <div class="w-10 h-14 rounded-lg overflow-hidden bg-surface-elevated flex-shrink-0">
                      @if (coverCache().get(item.tmdbId); as media) {
                        <img [src]="tmdb.posterUrl(media.poster_path, 'w185')" class="w-full h-full object-cover" />
                      }
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-text-primary truncate">
                        {{ coverCache().get(item.tmdbId)?.title || coverCache().get(item.tmdbId)?.name || 'TMDb #' + item.tmdbId }}
                      </p>
                      <p class="text-xs text-text-muted uppercase">{{ item.mediaType }}</p>
                    </div>
                  </a>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class CollectionsComponent implements OnInit {
  collections = signal<Collection[]>([]);
  coverCache = signal<Map<number, TmdbMedia>>(new Map());
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  selectedCollection = signal<Collection | null>(null);

  formName = '';
  formDesc = '';
  formPublic = false;

  constructor(
    private api: ApiService,
    public tmdb: TmdbService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadCollections();
  }

  loadCollections(): void {
    this.loading.set(true);
    this.api.get<PaginatedData<Collection>>('/collections').subscribe({
      next: (res) => {
        this.collections.set(res.data.items);
        this.loading.set(false);
        // Fetch cover images
        const tmdbIds = new Set<number>();
        res.data.items.forEach((col) => {
          if (col.coverTmdbId) tmdbIds.add(col.coverTmdbId);
          col.items.forEach((item) => tmdbIds.add(item.tmdbId));
        });
        tmdbIds.forEach((id) => {
          this.tmdb.getMovie(id).subscribe({
            next: (media) => {
              this.coverCache.update((c) => {
                const m = new Map(c);
                m.set(id, media as unknown as TmdbMedia);
                return m;
              });
            },
            error: () => {
              // Try as TV
              this.tmdb.getTv(id).subscribe({
                next: (media) => {
                  this.coverCache.update((c) => {
                    const m = new Map(c);
                    m.set(id, media as unknown as TmdbMedia);
                    return m;
                  });
                },
              });
            },
          });
        });
      },
      error: () => this.loading.set(false),
    });
  }

  createCollection(): void {
    if (!this.formName.trim()) {
      this.toast.error('Collection name is required');
      return;
    }

    this.saving.set(true);
    const payload: Record<string, unknown> = { name: this.formName.trim() };
    if (this.formDesc.trim()) payload['description'] = this.formDesc.trim();
    if (this.formPublic) payload['isPublic'] = true;

    this.api.post<Collection>('/collections', payload).subscribe({
      next: (res) => {
        this.collections.update((list) => [res.data, ...list]);
        this.formName = '';
        this.formDesc = '';
        this.formPublic = false;
        this.showForm.set(false);
        this.saving.set(false);
        this.toast.success('Collection created!');
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err.error?.error?.message || 'Failed to create');
      },
    });
  }

  selectCollection(collection: Collection): void {
    this.selectedCollection.set(collection);
  }

  deleteCollection(collection: Collection): void {
    this.api.delete(`/collections/${collection.id}`).subscribe({
      next: () => {
        this.collections.update((list) => list.filter((c) => c.id !== collection.id));
        this.selectedCollection.set(null);
        this.toast.success('Collection deleted');
      },
      error: () => this.toast.error('Failed to delete'),
    });
  }
}
