import { Component, computed, input } from '@angular/core';

export type IconName =
  | 'home'
  | 'compass'
  | 'film'
  | 'tv'
  | 'bookmark'
  | 'calendar'
  | 'chart'
  | 'user'
  | 'settings'
  | 'search'
  | 'bell'
  | 'menu'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'chevron-down'
  | 'arrow-right'
  | 'plus'
  | 'check'
  | 'star'
  | 'play'
  | 'heart'
  | 'trash'
  | 'close'
  | 'folder'
  | 'book'
  | 'logout'
  | 'eye'
  | 'eye-off'
  | 'clock'
  | 'more'
  | 'globe'
  | 'lock'
  | 'users'
  | 'sparkles'
  | 'image';

/** Icons drawn as solid shapes rather than strokes. */
const FILLED = new Set<string>(['star', 'play', 'more']);

/**
 * Single source of iconography — thin outline set matching the reference UI.
 * Usage: <app-icon name="home" class="w-5 h-5" />
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  host: { class: 'inline-flex items-center justify-center shrink-0' },
  template: `
    <svg
      class="w-full h-full"
      viewBox="0 0 24 24"
      [attr.fill]="filledIcon() ? 'currentColor' : 'none'"
      [attr.stroke]="filledIcon() ? 'none' : 'currentColor'"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      @switch (name()) {
        @case ('home') {
          <path d="M3 9.75 12 3l9 6.75V20a1 1 0 0 1-1 1h-4.5v-6.25h-5V21H4a1 1 0 0 1-1-1V9.75Z" />
        }
        @case ('compass') {
          <circle cx="12" cy="12" r="9" />
          <path d="m15.6 8.4-2.2 5-5 2.2 2.2-5 5-2.2Z" />
        }
        @case ('film') {
          <rect x="3" y="4" width="18" height="16" rx="2.5" />
          <path d="M7.5 4v16M16.5 4v16M3 12h18M3 8h4.5M3 16h4.5M16.5 8H21M16.5 16H21" />
        }
        @case ('tv') {
          <rect x="2.5" y="7.5" width="19" height="13" rx="2.5" />
          <path d="m8 3.5 4 4 4-4" />
        }
        @case ('bookmark') {
          <path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4-6.5 4v-16a1 1 0 0 1 1-1Z" />
        }
        @case ('calendar') {
          <rect x="3" y="5" width="18" height="16" rx="2.5" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        }
        @case ('chart') {
          <path d="M4.5 20V11M12 20V4.5M19.5 20v-6M2.5 20.5h19" />
        }
        @case ('user') {
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
        }
        @case ('users') {
          <circle cx="9.5" cy="8.5" r="3.5" />
          <path d="M3 20.5a6.5 6.5 0 0 1 13 0M16.5 5.3a3.5 3.5 0 0 1 0 6.4M18 14.6a6.5 6.5 0 0 1 3 5.9" />
        }
        @case ('settings') {
          <circle cx="12" cy="12" r="3" />
          <path
            d="M19.1 14.4a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"
          />
        }
        @case ('search') {
          <circle cx="11" cy="11" r="7" />
          <path d="m20.5 20.5-4.2-4.2" />
        }
        @case ('bell') {
          <path d="M18 8.5a6 6 0 1 0-12 0c0 6.5-2.5 8.5-2.5 8.5h17S18 15 18 8.5" />
          <path d="M13.7 20.5a2 2 0 0 1-3.4 0" />
        }
        @case ('menu') {
          <path d="M4 7h16M4 12h16M4 17h16" />
        }
        @case ('chevron-left') {
          <path d="m14.5 18-6-6 6-6" />
        }
        @case ('chevron-right') {
          <path d="m9.5 18 6-6-6-6" />
        }
        @case ('chevron-up') {
          <path d="m18 14.5-6-6-6 6" />
        }
        @case ('chevron-down') {
          <path d="m6 9.5 6 6 6-6" />
        }
        @case ('arrow-right') {
          <path d="M4.5 12h15M13 5.5l6.5 6.5-6.5 6.5" />
        }
        @case ('plus') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('check') {
          <path d="m5 12.5 4.5 4.5L19 7" />
        }
        @case ('star') {
          <path
            d="m12 2.6 2.93 5.94 6.57.96-4.75 4.63 1.12 6.54L12 17.58l-5.87 3.09 1.12-6.54L2.5 9.5l6.57-.96L12 2.6Z"
          />
        }
        @case ('play') {
          <path d="M7 4.6v14.8a1 1 0 0 0 1.53.85l11.6-7.4a1 1 0 0 0 0-1.7L8.53 3.75A1 1 0 0 0 7 4.6Z" />
        }
        @case ('heart') {
          <path d="M12 20.4 4.55 13a4.6 4.6 0 0 1 6.5-6.5l.95.94.95-.94a4.6 4.6 0 0 1 6.5 6.5L12 20.4Z" />
        }
        @case ('trash') {
          <path
            d="M4 7h16M9.5 7V5.2a1.2 1.2 0 0 1 1.2-1.2h2.6a1.2 1.2 0 0 1 1.2 1.2V7M6.5 7l.8 12.1a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7M10.5 11v5.5M13.5 11v5.5"
          />
        }
        @case ('close') {
          <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />
        }
        @case ('folder') {
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
        }
        @case ('book') {
          <path d="M4.5 5.2A2.2 2.2 0 0 1 6.7 3H19.5v18H6.7a2.2 2.2 0 0 1-2.2-2.2V5.2Z" />
          <path d="M8.5 3v18" />
        }
        @case ('logout') {
          <path d="M9.5 20.5H5.5a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h4M16 16.5l4.5-4.5L16 7.5M20.5 12H9.5" />
        }
        @case ('eye') {
          <path d="M2.6 12S6.2 5.8 12 5.8 21.4 12 21.4 12 17.8 18.2 12 18.2 2.6 12 2.6 12Z" />
          <circle cx="12" cy="12" r="3" />
        }
        @case ('eye-off') {
          <path
            d="M3 3.2 20.8 21M10.6 6.1A9.9 9.9 0 0 1 12 6c5.8 0 9.4 6 9.4 6a17.7 17.7 0 0 1-3.4 4.1M6.7 8A17.6 17.6 0 0 0 2.6 12S6.2 18 12 18a9.7 9.7 0 0 0 3.4-.6"
          />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="9" />
          <path d="M12 6.8V12l3.4 2" />
        }
        @case ('more') {
          <circle cx="5.5" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="18.5" cy="12" r="1.5" />
        }
        @case ('globe') {
          <circle cx="12" cy="12" r="9" />
          <path d="M3.2 12h17.6M12 3a15.5 15.5 0 0 1 0 18 15.5 15.5 0 0 1 0-18Z" />
        }
        @case ('lock') {
          <rect x="4.5" y="10" width="15" height="10.5" rx="2.2" />
          <path d="M8 10V7.2a4 4 0 0 1 8 0V10" />
        }
        @case ('sparkles') {
          <path d="M12 3.4 13.6 8 18.2 9.6 13.6 11.2 12 15.8 10.4 11.2 5.8 9.6 10.4 8 12 3.4Z" />
          <path d="M18.4 15.6 19.2 17.8 21.4 18.6 19.2 19.4 18.4 21.6 17.6 19.4 15.4 18.6 17.6 17.8 18.4 15.6Z" />
        }
        @case ('image') {
          <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
          <circle cx="8.5" cy="9.5" r="1.6" />
          <path d="m4 16.5 4.8-4.5 3.7 3.6 3-2.8 4.5 4.2" />
        }
      }
    </svg>
  `,
})
export class IconComponent {
  name = input.required<IconName>();
  /** Force a solid fill (e.g. an active heart). */
  filled = input(false);
  /** Outline weight; bump for small badge glyphs. */
  strokeWidth = input(1.8);

  filledIcon = computed(() => this.filled() || FILLED.has(this.name()));
}
