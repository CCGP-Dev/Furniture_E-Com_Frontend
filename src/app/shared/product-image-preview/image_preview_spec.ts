import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImagePreview } from './image-preview';

const A = 'https://example.com/haven-front.jpg';
const B = 'https://example.com/haven-side.jpg';
const C = 'https://example.com/haven-detail.jpg';

describe('ImagePreview', () => {
  let component: ImagePreview;
  let fixture: ComponentFixture<ImagePreview>;
  let el: HTMLElement;

  async function setup(image: string | null, images: string[] = []) {
    fixture.componentRef.setInput('image', image);
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('alt', 'Haven Lounge Chair');
    await settle();
  }

  async function settle() {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  const mainImg = () => el.querySelector<HTMLImageElement>('.preview__img');
  const fallback = () => el.querySelector('.preview__fallback');
  const thumbs = () => Array.from(el.querySelectorAll<HTMLButtonElement>('.thumb'));
  const viewer = () => document.querySelector('.viewer');

  async function loadMain() {
    mainImg()!.dispatchEvent(new Event('load'));
    await settle();
  }

  async function failMain() {
    mainImg()!.dispatchEvent(new Event('error'));
    await settle();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ImagePreview] }).compileComponents();
    fixture = TestBed.createComponent(ImagePreview);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
  });

  afterEach(() => {
    fixture.destroy();
    document.body.style.overflow = '';
  });

  it('should create', async () => {
    await setup(A);
    expect(component).toBeTruthy();
  });

  describe('loading and success', () => {
    it('shows a skeleton while the image is loading', async () => {
      await setup(A);
      expect(el.querySelector('.preview__skeleton')).toBeTruthy();
      expect(mainImg()!.classList).not.toContain('preview__img--ready');
      expect(fallback()).toBeNull();
    });

    it('reveals the image and offers to enlarge it once loaded', async () => {
      await setup(A);
      await loadMain();
      expect(el.querySelector('.preview__skeleton')).toBeNull();
      expect(mainImg()!.classList).toContain('preview__img--ready');
      expect(mainImg()!.getAttribute('alt')).toBe('Haven Lounge Chair');
      expect(el.querySelector('.preview__enlarge')).toBeTruthy();
    });
  });

  describe('missing image', () => {
    it('shows the placeholder when there is no image', async () => {
      await setup(null);
      expect(mainImg()).toBeNull();
      expect(fallback()!.textContent).toContain('Photo coming soon');
      expect(el.querySelector('.preview__retry')).toBeNull();
    });

    it('treats blank and whitespace-only URLs as missing', async () => {
      await setup('   ', ['']);
      expect(component.status()).toBe('missing');
      expect(fallback()).toBeTruthy();
    });
  });

  describe('failed image', () => {
    it('shows the placeholder with a retry button', async () => {
      await setup(A);
      await failMain();
      expect(mainImg()).toBeNull();
      expect(fallback()!.textContent).toContain("couldn't be loaded");
      expect(el.querySelector('.preview__retry')).toBeTruthy();
      expect(el.querySelector('.preview__enlarge')).toBeNull();
    });

    it('retries with a cache-busting parameter and can then succeed', async () => {
      await setup(A);
      await failMain();

      el.querySelector<HTMLButtonElement>('.preview__retry')!.click();
      await settle();

      expect(component.status()).toBe('loading');
      expect(mainImg()!.getAttribute('src')).toBe(`${A}?retry=1`);

      await loadMain();
      expect(component.status()).toBe('loaded');
      expect(fallback()).toBeNull();
    });
  });

  describe('multiple images', () => {
    it('shows thumbnails, removing duplicates and blanks', async () => {
      await setup(A, [A, '', B, B]);
      expect(component.sources()).toEqual([A, B]);
      expect(thumbs().length).toBe(2);
    });

    it('shows no thumbnails for a single image', async () => {
      await setup(A);
      expect(thumbs().length).toBe(0);
    });

    it('switches the main image and goes back to loading', async () => {
      await setup(A, [B]);
      await loadMain();

      thumbs()[1].click();
      await settle();

      expect(mainImg()!.getAttribute('src')).toBe(B);
      expect(component.status()).toBe('loading');
      expect(thumbs()[1].getAttribute('aria-pressed')).toBe('true');
      expect(mainImg()!.getAttribute('alt')).toBe('Haven Lounge Chair – view 2');
    });

    it('hides a thumbnail that fails to load', async () => {
      await setup(A, [B, C]);
      thumbs()[1].querySelector('img')!.dispatchEvent(new Event('error'));
      await settle();
      expect(component.thumbs().map(t => t.url)).toEqual([A, C]);
    });

    it('hides the strip when only one working image is left', async () => {
      await setup(A, [B]);
      thumbs()[1].querySelector('img')!.dispatchEvent(new Event('error'));
      await settle();
      expect(thumbs().length).toBe(0);
      expect(mainImg()).toBeTruthy();
    });

    it('keeps a failed main image visible so the page does not jump', async () => {
      await setup(A, [B]);
      await failMain();
      expect(component.thumbs().map(t => t.url)).toEqual([A, B]);
      expect(fallback()).toBeTruthy();
    });

    it('resets when the product changes', async () => {
      await setup(A, [B]);
      thumbs()[1].click();
      await settle();
      await failMain();

      fixture.componentRef.setInput('image', C);
      fixture.componentRef.setInput('images', []);
      await settle();

      expect(component.selectedIndex()).toBe(0);
      expect(component.status()).toBe('loading');
      expect(mainImg()!.getAttribute('src')).toBe(C);
    });
  });

  describe('enlarged viewer', () => {
    it('does not open until the image has loaded', async () => {
      await setup(A);
      component.open();
      await settle();
      expect(viewer()).toBeNull();
    });

    it('opens from the Enlarge button, locks scrolling, and closes with Escape', async () => {
      await setup(A);
      await loadMain();

      el.querySelector<HTMLButtonElement>('.preview__enlarge')!.click();
      await settle();
      expect(viewer()).toBeTruthy();
      expect(document.body.style.overflow).toBe('hidden');

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await settle();
      expect(viewer()).toBeNull();
      expect(document.body.style.overflow).toBe('');
    });

    it('opens when the image itself is clicked', async () => {
      await setup(A);
      await loadMain();
      mainImg()!.click();
      await settle();
      expect(viewer()).toBeTruthy();
    });

    it('moves between images with the arrow keys and wraps around', async () => {
      await setup(A, [B]);
      await loadMain();
      component.open();
      await settle();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      await settle();
      expect(component.selectedIndex()).toBe(1);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      await settle();
      expect(component.selectedIndex()).toBe(0);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      await settle();
      expect(component.selectedIndex()).toBe(1);
    });

    it('ignores keys while the viewer is closed', async () => {
      await setup(A, [B]);
      await loadMain();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      await settle();
      expect(component.selectedIndex()).toBe(0);
    });

    it('releases the scroll lock if the component is destroyed while open', async () => {
      await setup(A);
      await loadMain();
      component.open();
      await settle();
      expect(document.body.style.overflow).toBe('hidden');

      fixture.destroy();
      expect(document.body.style.overflow).toBe('');
    });
  });
});