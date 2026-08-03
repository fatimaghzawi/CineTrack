import { Component, input } from '@angular/core';

import { IconComponent, IconName } from '@shared/components/icon/icon.component';

/**
 * Shared empty / zero-data state. Project the call-to-action as content:
 *   <app-empty-state icon="bookmark" title="…" message="…">
 *     <a routerLink="/discover" class="btn-primary">Discover Now</a>
 *   </app-empty-state>
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IconComponent],
  host: { class: 'block' },
  template: `
    <div class="flex flex-col items-center text-center px-6 py-16 sm:py-20 animate-fade-in">
      <span
        class="grid place-items-center h-16 w-16 rounded-2xl bg-surface-card
               border border-hairline text-primary mb-5"
      >
        <app-icon [name]="icon()" class="w-7 h-7" />
      </span>

      <h3 class="text-lg font-bold text-text-primary">{{ title() }}</h3>
      @if (message()) {
        <p class="text-sm text-text-secondary mt-2 max-w-sm">{{ message() }}</p>
      }

      <div [class.mt-6]="hasAction()">
        <ng-content />
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  icon = input<IconName>('sparkles');
  title = input.required<string>();
  message = input('');
  /** Set when a call-to-action is projected, so the spacing collapses without one. */
  hasAction = input(false);
}
