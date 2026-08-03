import { Component, input, output, signal } from '@angular/core';

import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [IconComponent],
  host: { class: 'inline-block' },
  template: `
    <div class="flex items-center gap-1" (mouseleave)="hoverValue.set(0)">
      @for (star of stars; track star) {
        <button
          type="button"
          [disabled]="readonly()"
          [attr.aria-label]="star + ' out of ' + maxStars()"
          (click)="onRate(star)"
          (mouseenter)="hoverValue.set(readonly() ? 0 : star)"
          class="p-0.5 rounded transition-transform duration-150 ease-smooth
                 disabled:cursor-default enabled:hover:scale-110"
        >
          <app-icon
            name="star"
            class="w-[18px] h-[18px] transition-colors duration-150"
            [class.text-primary]="star <= displayValue()"
            [class.text-surface-elevated]="star > displayValue()"
          />
        </button>
      }

      @if (showValue()) {
        <span class="ml-2 text-[13px] font-semibold text-text-secondary">
          {{ value() }}<span class="text-text-muted font-normal">/{{ maxStars() }}</span>
        </span>
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
