import { Component, OnInit } from '@angular/core';
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
    private siteSettings: SiteSettingsService
  ) {
    this.isAdminRoute = this.router.url.startsWith('/admin');
  }

  ngOnInit(): void {

    this.siteSettings.getSettingsAsMap().subscribe(settings => {
      this.applyTitle(this.router.url, settings);
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
      } else if (event instanceof NavigationEnd) {
        this.isAdminRoute = event.url.startsWith('/admin');
        this.isNavigating = false;
        this.siteSettings.getSettingsAsMap().subscribe(settings => {
          this.applyTitle(event.url, settings);
        });
      } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this.isNavigating = false;
      }
    });
  }

  private applyTitle(url: string, settings: SiteSettingsMap): void {
    const siteName = settings['site_name'] || 'Travel Sri Lanka Now';
    const tagline  = settings['site_tagline'] || 'Explore Beautiful Sri Lanka';

    const segment = url.split('/').filter(Boolean)[0] || '';
    const pageName = PAGE_TITLES[segment] ?? '';

    const tabTitle = pageName
      ? `${pageName} | ${siteName}`
      : `${siteName} | ${tagline}`;

    this.titleService.setTitle(tabTitle);
  }
}
