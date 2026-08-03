import { Component, input } from '@angular/core';

/**
 * Brand lockup — yellow rounded-square check mark + wordmark.
 * Mirrors the mark used across every screen of the reference design.
 */
@Component({
  selector: 'app-logo',
  standalone: true,
  host: { class: 'inline-flex' },
  template: `
    <span class="inline-flex items-center gap-2.5 select-none">
      <span
        class="grid place-items-center rounded-lg bg-primary shrink-0"
        [class]="markSize()"
      >
        <svg
          class="w-3/5 h-3/5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#121212"
          stroke-width="3.4"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m5 12.5 4.5 4.5L19 7" />
        </svg>
      </span>
      @if (showWordmark()) {
        <span
          class="font-display font-extrabold tracking-tight text-text-primary"
          [class]="wordSize()"
        >
          CineTrack
        </span>
      }
    </span>
  `,
})
export class LogoComponent {
  showWordmark = input(true);
  /** 'sm' for compact bars, 'md' for the sidebar, 'lg' for auth screens. */
  size = input<'sm' | 'md' | 'lg'>('md');

  markSize(): string {
    return { sm: 'h-7 w-7', md: 'h-8 w-8', lg: 'h-14 w-14 rounded-2xl' }[this.size()];
  }

  wordSize(): string {
    return { sm: 'text-[15px]', md: 'text-[17px]', lg: 'text-3xl' }[this.size()];
  }
}
