import { Component } from '@angular/core';

import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-slide-up border"
          [class]="toastClasses(toast.type)"
        >
          <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
          <button
            (click)="toastService.dismiss(toast.id)"
            class="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}

  toastClasses(type: string): string {
    const map: Record<string, string> = {
      success: 'bg-green-600/90 border-green-500/30 text-white backdrop-blur-sm',
      error: 'bg-red-600/90 border-red-500/30 text-white backdrop-blur-sm',
      warning: 'bg-amber-600/90 border-amber-500/30 text-white backdrop-blur-sm',
      info: 'bg-surface-card border-surface-elevated text-text-primary backdrop-blur-sm',
    };
    return map[type] || map['info'];
  }
}
