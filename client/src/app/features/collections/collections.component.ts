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
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    DatePipe,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    IconComponent,
  ],
  template: `
    <div class="page-container animate-fade-in">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 class="page-title">Collections</h1>
          <p class="mt-1.5 text-sm text-text-secondary">
            Organize your titles into custom groups
          </p>
        </div>

        <button
          type="button"
          (click)="showForm.set(!showForm())"
          [class]="showForm() ? 'btn-secondary' : 'btn-primary'"
        >
          <app-icon [name]="showForm() ? 'close' : 'plus'" class="w-4 h-4" />
          {{ showForm() ? 'Cancel' : 'New Collection' }}
        </button>
      </div>

      <!-- Create form -->
      @if (showForm()) {
        <div class="panel p-5 sm:p-6 mb-7 animate-slide-up">
          <h3 class="section-title mb-5">Create Collection</h3>

          <div>
            <label for="c-name" class="label">Name</label>
            <input
              id="c-name"
              type="text"
              [(ngModel)]="formName"
              placeholder="e.g. Best Sci-Fi of the Decade"
              class="input-field"
              maxlength="100"
            />
          </div>

          <div class="mt-5">
            <label for="c-desc" class="label">Description</label>
            <textarea
              id="c-desc"
              [(ngModel)]="formDesc"
              placeholder="What's this collection about?"
              rows="3"
              class="input-field resize-none"
              maxlength="1000"
            ></textarea>
          </div>

          <label class="flex items-center gap-3 cursor-pointer mt-5">
            <input
              type="checkbox"
              [(ngModel)]="formPublic"
              class="w-4 h-4 rounded border-surface-elevated bg-surface-card"
            />
            <span class="text-sm text-text-secondary">Make this collection public</span>
          </label>

          <div class="flex justify-end gap-3 mt-6">
            <button type="button" (click)="showForm.set(false)" class="btn-ghost">Cancel</button>
            <button
              type="button"
              (click)="createCollection()"
              [disabled]="saving()"
              class="btn-primary"
            >
              {{ saving() ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </div>
      }

      <!-- Grid -->
      @if (loading()) {
        <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          @for (i of [1, 2, 3]; track i) {
            <app-skeleton height="228px" className="rounded-2xl" />
          }
        </div>
      } @else if (collections().length === 0) {
        <app-empty-state
          icon="folder"
          title="No collections yet"
          message="Group your favourite titles into themed collections — start with your first one."
        />
      } @else {
        <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          @for (collection of collections(); track collection.id) {
            <button
              type="button"
              (click)="selectCollection(collection)"
              class="panel p-4 text-left group transition-all duration-300 ease-smooth
                     hover:border-primary/40 hover:-translate-y-0.5"
            >
              <!-- Cover -->
              <div class="relative h-32 rounded-xl overflow-hidden bg-surface-card">
                @if (collection.coverTmdbId && coverCache().get(collection.coverTmdbId); as cover) {
                  <img
                    [src]="tmdb.posterUrl(cover.poster_path, 'w500')"
                    alt=""
                    class="w-full h-full object-cover transition-transform duration-500
                           ease-smooth group-hover:scale-105"
                    loading="lazy"
                  />
                  <div class="absolute inset-0 bg-card-scrim"></div>
                } @else {
                  <span class="w-full h-full grid place-items-center text-text-muted">
                    <app-icon name="folder" class="w-8 h-8" />
                  </span>
                }

                <span class="badge-primary absolute bottom-2 right-2">
                  {{ collection.items.length }} title{{ collection.items.length === 1 ? '' : 's' }}
                </span>
              </div>

              <h3
                class="mt-4 font-semibold text-text-primary truncate transition-colors
                       group-hover:text-primary"
              >
                {{ collection.name }}
              </h3>

              @if (collection.description) {
                <p class="mt-1 text-[13px] text-text-muted line-clamp-2">
                  {{ collection.description }}
                </p>
              }

              <div class="flex items-center justify-between gap-2 mt-3">
                <span class="text-2xs text-text-muted">
                  {{ collection.createdAt | date: 'mediumDate' }}
                </span>
                <span class="inline-flex items-center gap-1.5 text-2xs text-text-muted">
                  <app-icon [name]="collection.isPublic ? 'globe' : 'lock'" class="w-3.5 h-3.5" />
                  {{ collection.isPublic ? 'Public' : 'Private' }}
                </span>
              </div>
            </button>
          }
        </div>
      }

      <!-- Detail dialog -->
      @if (selectedCollection(); as col) {
        <div
          class="fixed inset-0 z-50 grid place-items-center p-4 bg-black/75 backdrop-blur-sm
                 animate-fade-in"
          (click)="selectedCollection.set(null)"
          role="dialog"
          aria-modal="true"
        >
          <div
            class="w-full max-w-2xl max-h-[82vh] overflow-y-auto p-5 sm:p-6
                   bg-surface-dark border border-hairline rounded-3xl shadow-pop animate-scale-in"
            (click)="$event.stopPropagation()"
          >
            <div class="flex items-start justify-between gap-4 mb-5">
              <div class="min-w-0">
                <h2 class="text-xl sm:text-2xl font-bold font-display text-text-primary truncate">
                  {{ col.name }}
                </h2>
                <p class="mt-1 text-2xs text-text-muted inline-flex items-center gap-1.5">
                  <app-icon [name]="col.isPublic ? 'globe' : 'lock'" class="w-3.5 h-3.5" />
                  {{ col.isPublic ? 'Public' : 'Private' }}
                  <span class="mx-0.5">·</span>
                  {{ col.items.length }} title{{ col.items.length === 1 ? '' : 's' }}
                </p>
              </div>

              <div class="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  (click)="deleteCollection(col)"
                  aria-label="Delete collection"
                  class="btn-round hover:!text-red-400 hover:!bg-red-500/10"
                >
                  <app-icon name="trash" class="w-[18px] h-[18px]" />
                </button>
                <button
                  type="button"
                  (click)="selectedCollection.set(null)"
                  aria-label="Close"
                  class="btn-round"
                >
                  <app-icon name="close" class="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>

            @if (col.description) {
              <p class="text-sm leading-relaxed text-text-secondary mb-5">{{ col.description }}</p>
            }

            @if (col.items.length === 0) {
              <p class="py-10 text-center text-sm text-text-muted">
                No items in this collection yet.
              </p>
            } @else {
              <ul class="space-y-2.5">
                @for (item of col.items; track item.tmdbId) {
                  <li>
                    <a
                      [routerLink]="'/' + item.mediaType + '/' + item.tmdbId"
                      (click)="selectedCollection.set(null)"
                      class="flex items-center gap-3.5 p-2.5 rounded-xl bg-surface-card
                             border border-hairline transition-all duration-200 ease-smooth
                             hover:border-primary/40"
                    >
                      <span
                        class="w-10 h-14 shrink-0 rounded-lg overflow-hidden bg-surface-elevated"
                      >
                        @if (coverCache().get(item.tmdbId); as media) {
                          <img
                            [src]="tmdb.posterUrl(media.poster_path, 'w185')"
                            alt=""
                            class="w-full h-full object-cover"
                            loading="lazy"
                          />
                        }
                      </span>
                      <span class="flex-1 min-w-0">
                        <span class="block text-[13.5px] font-medium text-text-primary truncate">
                          {{
                            coverCache().get(item.tmdbId)?.title ||
                              coverCache().get(item.tmdbId)?.name ||
                              'TMDb #' + item.tmdbId
                          }}
                        </span>
                        <span class="block text-2xs text-text-muted uppercase tracking-wide">
                          {{ item.mediaType }}
                        </span>
                      </span>
                      <app-icon name="chevron-right" class="w-4 h-4 text-text-muted shrink-0" />
                    </a>
                  </li>
                }
              </ul>
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
