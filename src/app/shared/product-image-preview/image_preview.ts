import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';

type LoadState = 'loaded' | 'error';
export type PreviewStatus = 'missing' | 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-image-preview',
  templateUrl: './image-preview.html',
  styleUrl: './image-preview.scss',
  host: { '(document:keydown)': 'onKeydown($event)' },
})
export class ImagePreview {
  private readonly injector = inject(Injector);

  /** Primary product image (may be empty or broken). */
  image = input<string | null | undefined>('');
  /** Additional product images. */
  images = input<readonly string[] | null | undefined>([]);
  /** Product name, used for alt text and messages. */
  alt = input('Furniture item');

  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  /** Primary + extra images, trimmed and de-duplicated, blanks removed. */
  readonly sources = computed(() => {
    const all = [this.image(), ...(this.images() ?? [])]
      .map(src => src?.trim())
      .filter((src): src is string => !!src);
    return [...new Set(all)];
  });

  readonly selectedIndex = linkedSignal({ source: this.sources, computation: () => 0 });
  private readonly results = linkedSignal<string[], Record<string, LoadState>>({
    source: this.sources,
    computation: () => ({}),
  });
  private readonly attempts = linkedSignal<string[], Record<string, number>>({
    source: this.sources,
    computation: () => ({}),
  });

  readonly lightboxOpen = signal(false);
  private lastFocused: HTMLElement | null = null;

  readonly current = computed(() => this.sources()[this.selectedIndex()] ?? null);

  readonly status = computed<PreviewStatus>(() => {
    const url = this.current();
    if (!url) return 'missing';
    return this.results()[url] ?? 'loading';
  });

  /** URL actually requested; a retry adds a cache-busting query parameter. */
  readonly currentSrc = computed(() => {
    const url = this.current();
    if (!url) return null;
    const attempt = this.attempts()[url] ?? 0;
    if (!attempt || url.startsWith('data:') || url.startsWith('blob:')) return url;
    return `${url}${url.includes('?') ? '&' : '?'}retry=${attempt}`;
  });

  /** Thumbnails to show: failed images are hidden, except the selected one. */
  readonly thumbs = computed(() =>
    this.sources()
      .map((url, index) => ({ url, index }))
      .filter(t => this.results()[t.url] !== 'error' || t.index === this.selectedIndex()),
  );

  readonly position = computed(
    () => this.thumbs().findIndex(t => t.index === this.selectedIndex()) + 1,
  );

  readonly mainAlt = computed(() => {
    const index = this.selectedIndex();
    return index === 0 ? this.alt() : `${this.alt()} – view ${index + 1}`;
  });

  constructor() {
    // Lock page scroll while the viewer is open; always restore it.
    effect(() => {
      document.body.style.overflow = this.lightboxOpen() ? 'hidden' : '';
    });
    inject(DestroyRef).onDestroy(() => {
      document.body.style.overflow = '';
    });
  }

  select(index: number) {
    if (index === this.selectedIndex()) return;
    this.selectedIndex.set(index);
  }

  step(delta: 1 | -1) {
    const list = this.thumbs();
    if (list.length < 2) return;
    const pos = list.findIndex(t => t.index === this.selectedIndex());
    this.select(list[(pos + delta + list.length) % list.length].index);
  }

  onLoad(url: string) {
    this.results.update(r => ({ ...r, [url]: 'loaded' }));
  }

  onError(url: string) {
    this.results.update(r => ({ ...r, [url]: 'error' }));
  }

  retry() {
    const url = this.current();
    if (!url) return;
    this.results.update(({ [url]: _removed, ...rest }) => rest);
    this.attempts.update(a => ({ ...a, [url]: (a[url] ?? 0) + 1 }));
  }

  open() {
    if (this.status() !== 'loaded') return;
    this.lastFocused = document.activeElement as HTMLElement | null;
    this.lightboxOpen.set(true);
    afterNextRender(() => this.closeButton()?.nativeElement.focus(), {
      injector: this.injector,
    });
  }

  close() {
    this.lightboxOpen.set(false);
    this.lastFocused?.focus();
    this.lastFocused = null;
  }

  onKeydown(event: KeyboardEvent) {
    if (!this.lightboxOpen()) return;
    switch (event.key) {
      case 'Escape':
        this.close();
        break;
      case 'ArrowRight':
        this.step(1);
        break;
      case 'ArrowLeft':
        this.step(-1);
        break;
      case 'Tab':
        this.trapFocus(event);
        break;
    }
  }

  /** Keep Tab / Shift+Tab inside the viewer while it is open. */
  private trapFocus(event: KeyboardEvent) {
    const buttons = Array.from(
      document.querySelectorAll<HTMLElement>('.viewer button:not([disabled])'),
    );
    if (!buttons.length) return;
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}