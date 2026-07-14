import { Directive, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

@Directive({ selector: 'video[appVideoAutoplay]' })
export class VideoAutoplayDirective implements OnChanges, OnDestroy {
  @Input() videoSrc = '';

  private handlers: Array<{ event: string; fn: EventListener }> = [];
  private retryTimer: any = null;

  constructor(private el: ElementRef<HTMLVideoElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoSrc'] && this.videoSrc) {
      this.setup(this.videoSrc);
    }
  }

  ngOnDestroy(): void {
    this.teardown();
  }

  private setup(url: string): void {
    this.teardown();
    const video = this.el.nativeElement;

    // Set properties directly — bypasses Angular security context and ensures
    // the browser's media-resource-selection algorithm runs with the correct values.
    video.muted    = true;
    video.autoplay = true;
    video.loop     = true;
    video.preload  = 'auto';
    video.src      = url;
    video.load();

    const tryPlay = () => {
      if (!video.isConnected) return;
      video.play().catch(_err => {
        // Retry once more after a short delay (handles cases where the page
        // was still in a hidden/loading state when play() was first called).
        this.retryTimer = setTimeout(() => {
          if (video.isConnected && video.paused) {
            video.play().catch(() => {});
          }
        }, 600);
      });
    };

    // Primary trigger: browser has buffered enough to play
    this.addListener(video, 'canplay', tryPlay);

    // Secondary trigger: page becomes visible after a refresh/tab-switch
    const onVisible = () => {
      if (document.visibilityState === 'visible' && video.paused && video.isConnected) {
        video.play().catch(() => {});
      }
    };
    this.addListener(document as any, 'visibilitychange', onVisible);
  }

  private addListener(target: EventTarget, event: string, fn: EventListener): void {
    target.addEventListener(event, fn);
    this.handlers.push({ event, fn });
  }

  private teardown(): void {
    clearTimeout(this.retryTimer);
    const video = this.el.nativeElement;
    this.handlers.forEach(({ event, fn }) => {
      try {
        video.removeEventListener(event, fn);
        document.removeEventListener(event, fn);
      } catch (_) {}
    });
    this.handlers = [];
  }
}
