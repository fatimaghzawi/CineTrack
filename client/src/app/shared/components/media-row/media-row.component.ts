import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { TmdbMedia } from '@core/models/movie.model';
import { MovieCardComponent } from '@shared/components/movie-card/movie-card.component';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import { IconComponent } from '@shared/components/icon/icon.component';

/**
 * Category rail — a section heading over a horizontally scrolling track of
 * poster cards. Used for the trending rails on the dashboard and for every
 * genre row on the Movies / TV Shows pages.
 *
 * `app-movie-card` is fluid (its width comes from the parent grid track), so
 * each card is wrapped in a fixed-width `shrink-0` item here; without that the
 * cards collapse to nothing inside the flex row.
 */
@Component({
  selector: 'app-media-row',
  standalone: true,
  imports: [SectionHeaderComponent, MovieCardComponent, SkeletonLoaderComponent, IconComponent],
  host: { class: 'block', '(window:resize)': 'syncArrows()' },
  template: `
    @if (loading() || items().length > 0) {
      <section>
        <app-section-header
          [title]="title()"
          [actionLabel]="actionLabel()"
          [actionRoute]="actionRoute()"
          [actionParams]="actionParams()"
        />

        <div class="relative group/row">
          <div
            #scroller
            (scroll)="syncArrows()"
            class="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none snap-x scroll-smooth
                   -mx-1 px-1 pb-1"
          >
            @if (loading()) {
              @for (i of skeletons; track i) {
                <div class="shrink-0 w-[136px] sm:w-[152px] lg:w-[168px]">
                  <app-skeleton className="aspect-[2/3] w-full" />
                </div>
              }
            } @else {
              @for (item of items(); track item.id) {
                <div class="shrink-0 w-[136px] sm:w-[152px] lg:w-[168px] snap-start">
                  <app-movie-card [media]="item" />
                </div>
              }
            }
          </div>

          <!-- Desktop-only arrows; they fade in on row hover and disappear at each end. -->
          @if (canScrollLeft()) {
            <button
              type="button"
              (click)="scrollByPage(-1)"
              class="row-arrow left-0 -translate-x-1"
              aria-label="Scroll left"
            >
              <app-icon name="chevron-left" class="w-5 h-5" />
            </button>
          }

          @if (canScrollRight()) {
            <button
              type="button"
              (click)="scrollByPage(1)"
              class="row-arrow right-0 translate-x-1"
              aria-label="Scroll right"
            >
              <app-icon name="chevron-right" class="w-5 h-5" />
            </button>
          }
        </div>
      </section>
    }
  `,
})
export class MediaRowComponent {
  title = input.required<string>();
  items = input<TmdbMedia[]>([]);
  loading = input(false);
  actionLabel = input('See all');
  actionRoute = input<string | null>(null);
  actionParams = input<Record<string, string>>({});

  canScrollLeft = signal(false);
  canScrollRight = signal(false);

  skeletons = Array.from({ length: 7 }, (_, i) => i);

  private scroller = viewChild<ElementRef<HTMLDivElement>>('scroller');
  private injector = inject(Injector);

  constructor() {
    // Rows fill asynchronously, so arrow state has to be re-derived whenever the
    // content changes. Measuring in `afterNextRender` (rather than a lifecycle
    // hook) waits for the new cards to be in the DOM and keeps the signal writes
    // out of the change-detection pass that is reading them.
    effect(() => {
      this.items();
      this.loading();
      afterNextRender(() => this.syncArrows(), { injector: this.injector });
    });
  }

  syncArrows(): void {
    const el = this.scroller()?.nativeElement;
    if (!el) return;

    // 1px slack absorbs sub-pixel rounding at the far edge.
    this.canScrollLeft.set(el.scrollLeft > 1);
    this.canScrollRight.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }

  scrollByPage(direction: 1 | -1): void {
    const el = this.scroller()?.nativeElement;
    if (!el) return;

    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  }
}
