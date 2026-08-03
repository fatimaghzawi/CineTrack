import { Component } from '@angular/core';

import { ToastService, ToastType } from '@core/services/toast.service';
import { IconComponent, IconName } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div
      class="fixed top-4 right-4 left-4 sm:left-auto z-[60] flex flex-col gap-2.5 sm:max-w-sm"
      role="status"
      aria-live="polite"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="relative flex items-center gap-3 pl-4 pr-2 py-3 rounded-xl overflow-hidden
                 bg-surface-card border border-hairline shadow-pop
                 backdrop-blur-xl animate-slide-up"
        >
          <!-- Accent rail -->
          <span class="absolute inset-y-0 left-0 w-1" [class]="railClass(toast.type)"></span>

          <span class="shrink-0" [class]="iconClass(toast.type)">
            <app-icon [name]="iconFor(toast.type)" class="w-[18px] h-[18px]" />
          </span>

          <p class="flex-1 text-[13px] font-medium text-text-primary">{{ toast.message }}</p>

          <button
            type="button"
            (click)="toastService.dismiss(toast.id)"
            class="btn-round h-8 w-8 shrink-0"
            aria-label="Dismiss notification"
          >
            <app-icon name="close" class="w-4 h-4" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}

  iconFor(type: ToastType): IconName {
    const map: Record<ToastType, IconName> = {
      success: 'check',
      error: 'close',
      warning: 'bell',
      info: 'sparkles',
    };
    return map[type];
  }

  railClass(type: ToastType): string {
    const map: Record<ToastType, string> = {
      success: 'bg-primary',
      error: 'bg-red-500',
      warning: 'bg-accent-gold',
      info: 'bg-surface-elevated',
    };
    return map[type];
  }

  iconClass(type: ToastType): string {
    const map: Record<ToastType, string> = {
      success: 'text-primary',
      error: 'text-red-400',
      warning: 'text-accent-gold',
      info: 'text-text-secondary',
    };
    return map[type];
  }
}
