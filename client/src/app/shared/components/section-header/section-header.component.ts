import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent } from '@shared/components/icon/icon.component';

/**
 * Row heading with an optional "View All →" action, as used above every
 * carousel and grid in the reference design.
 */
@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [RouterLink, IconComponent],
  host: { class: 'block' },
  template: `
    <div class="flex items-end justify-between gap-4 mb-4 sm:mb-5">
      <div class="min-w-0">
        <h2 class="section-title truncate">{{ title() }}</h2>
        @if (subtitle()) {
          <p class="text-[13px] text-text-secondary mt-1">{{ subtitle() }}</p>
        }
      </div>

      @if (actionRoute()) {
        <a
          [routerLink]="actionRoute()"
          [queryParams]="actionParams()"
          class="group inline-flex items-center gap-1.5 text-[13px] font-medium
                 text-text-secondary hover:text-primary transition-colors shrink-0"
        >
          {{ actionLabel() }}
          <app-icon
            name="chevron-right"
            class="w-4 h-4 transition-transform group-hover:translate-x-0.5"
          />
        </a>
      }
    </div>
  `,
})
export class SectionHeaderComponent {
  title = input.required<string>();
  subtitle = input('');
  actionLabel = input('View All');
  actionRoute = input<string | null>(null);
  actionParams = input<Record<string, string>>({});
}
