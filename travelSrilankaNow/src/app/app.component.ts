import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter, switchMap } from 'rxjs/operators';
import { SiteSettingsService, SiteSettingsMap } from './services/site-settings.service';

const PAGE_TITLES: Record<string, string> = {
  '':             '',
  'locations':    'Locations',
  'gallery':      'Gallery',
  'events':       'Events',
  'places':       'Places',
  'more':         '',
  'admin':        'Admin',
  'my-bookings':  'My Bookings',
  'login':        'Login',
  'register':     'Register',
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'travelSrilankaNow';
  isAdminRoute = false;
  isNavigating = false;

  constructor(
    private router: Router,
    private titleService: Title,
    private siteSettings: SiteSettingsService,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.isAdminRoute = this.router.url.startsWith('/admin');
  }

  ngOnInit(): void {

    this.siteSettings.getSettingsAsMap().subscribe(settings => {
      this.applyTitle(this.router.url, settings);
      this.applyFavicon(settings['favicon_url']);
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      switchMap((_event: any) =>
        this.siteSettings.getSettingsAsMap().pipe(
          filter(settings => !!settings),
          filter((_, i) => i === 0)
        )
      )
    ).subscribe({ error: () => {} });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isAdminRoute = event.url.startsWith('/admin');
        this.isNavigating = true;
        this.cdr.detectChanges();
      } else if (event instanceof NavigationEnd) {
        this.isAdminRoute = event.url.startsWith('/admin');
        this.isNavigating = false;
        this.cdr.detectChanges();
        this.siteSettings.getSettingsAsMap().subscribe(settings => {
          this.applyTitle(event.url, settings);
        });
      } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this.isNavigating = false;
        this.cdr.detectChanges();
      }
    });
  }

  private applyFavicon(faviconUrl: string): void {
    if (!faviconUrl) return;
    const selectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]'
    ];
    selectors.forEach(sel => {
      const el = this.document.querySelector(sel) as HTMLLinkElement | null;
      if (el) { el.href = faviconUrl + '?v=' + Date.now(); }
    });
  }

  private applyTitle(url: string, settings: SiteSettingsMap): void {
    const siteName = settings['site_name'] || '';
    const tagline  = settings['site_tagline'] || '';

    const segment = url.split('/').filter(Boolean)[0] || '';
    const pageName = PAGE_TITLES[segment] ?? '';

    const tabTitle = pageName
      ? `${pageName} | ${siteName}`
      : `${siteName} | ${tagline}`;

    this.titleService.setTitle(tabTitle);
  }
}
