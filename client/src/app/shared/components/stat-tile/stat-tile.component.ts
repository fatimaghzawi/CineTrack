import { Component, input } from '@angular/core';

import { IconComponent, IconName } from '@shared/components/icon/icon.component';

/**
 * Stat tile from the "My Stats" panel — muted label, oversized value,
 * optional delta line underneath.
 */
@Component({
  selector: 'app-stat-tile',
  standalone: true,
  imports: [IconComponent],
  host: { class: 'block' },
  template: `
    <div class="card p-4 sm:p-5 h-full">
      <p class="text-xs text-text-secondary truncate">{{ label() }}</p>

      <div class="flex items-center gap-2 mt-1.5">
        <p class="text-2xl sm:text-[28px] leading-none font-bold font-display text-text-primary">
          {{ value() }}
        </p>
        @if (icon(); as glyph) {
          <app-icon [name]="glyph" class="w-5 h-5 text-primary shrink-0" />
        }
      </div>

      @if (delta()) {
        <p class="text-2xs text-primary/90 mt-2">{{ delta() }}</p>
      }
    </div>
  `,
})
export class StatTileComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  delta = input('');
  icon = input<IconName | null>(null);
}
