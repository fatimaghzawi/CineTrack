import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  template: `
    <div class="flex items-center gap-0.5">
      @for (star of stars; track star) {
        <button
          type="button"
          (click)="onRate(star)"
          (mouseenter)="hoverValue.set(star)"
          (mouseleave)="hoverValue.set(0)"
          class="p-0.5 transition-transform hover:scale-110"
          [class.cursor-default]="readonly()"
          [disabled]="readonly()"
        >
          <svg
            class="w-5 h-5 transition-colors"
            [class.text-primary]="star <= displayValue()"
            [class.text-surface-elevated]="star > displayValue()"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </button>
      }
      @if (showValue()) {
        <span class="ml-2 text-sm text-text-secondary">{{ value() }}/10</span>
      }
    </div>
  `,
})
export class RatingStarsComponent {
  value = input(0);
  maxStars = input(10);
  readonly = input(false);
  showValue = input(true);
  ratingChange = output<number>();

  hoverValue = signal(0);

  get stars(): number[] {
    return Array.from({ length: this.maxStars() }, (_, i) => i + 1);
  }

  displayValue(): number {
    return this.hoverValue() || this.value();
  }

  onRate(star: number): void {
    if (!this.readonly()) {
      this.ratingChange.emit(star);
    }
  }
}
