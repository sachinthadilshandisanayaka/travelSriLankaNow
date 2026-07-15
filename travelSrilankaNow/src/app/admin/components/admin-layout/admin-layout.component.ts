import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminApiService } from '../../services/admin-api.service';
import { BookingCountService } from '../../services/booking-count.service';
import { ContentStatsService } from '../../services/content-stats.service';
import { BrandingService, Branding } from '../../services/branding.service';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  displayName = '';
  isSidebarOpen = false;
  showLogoutConfirm = false;
  pendingCount = 0;
  showPendingBanner = true;
  branding!: Branding;
  private displayNameSub!: Subscription;
  private pendingSub!: Subscription;
  private statsSub!: Subscription;
  private brandingSub!: Subscription;
  stats = {
    locations: { total: 0 },
    events: { total: 0 },
    places: { total: 0 },
    gallery: { total: 0 }
  };

  constructor(
    private authService: AdminAuthService,
    private apiService: AdminApiService,
    private bookingCount: BookingCountService,
    private contentStats: ContentStatsService,
    private brandingService: BrandingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.displayNameSub = this.authService.displayName$.subscribe(name => {
      this.displayName = name;
    });
    this.brandingSub = this.brandingService.branding$.subscribe(b => this.branding = b);

    // Only subscribe to pending bookings if the user has permission
    if (this.hasPermission('BOOKINGS:VIEW')) {
      this.pendingSub = this.bookingCount.pending$.subscribe(n => this.pendingCount = n);
      this.bookingCount.refresh();
    }

    this.loadStats();
    this.statsSub = this.contentStats.changes$.subscribe(() => this.loadStats());
  }

  ngOnDestroy(): void {
    if (this.displayNameSub) this.displayNameSub.unsubscribe();
    if (this.pendingSub) this.pendingSub.unsubscribe();
    if (this.statsSub) this.statsSub.unsubscribe();
    if (this.brandingSub) this.brandingSub.unsubscribe();
  }

  private loadStats(): void {
    const empty = of({ totalElements: 0 });

    forkJoin({
      locations: this.hasPermission('LOCATIONS:VIEW')
        ? this.apiService.getLocations(0, 1).pipe(catchError(() => empty))
        : empty,
      events: this.hasPermission('EVENTS:VIEW')
        ? this.apiService.getEvents(0, 1).pipe(catchError(() => empty))
        : empty,
      places: this.hasPermission('PLACES:VIEW')
        ? this.apiService.getPlaces(0, 1).pipe(catchError(() => empty))
        : empty,
      gallery: this.hasPermission('GALLERY:VIEW')
        ? this.apiService.getGalleryItems(0, 1).pipe(catchError(() => empty))
        : empty
    }).subscribe({
      next: (data) => {
        this.stats.locations.total = data.locations.totalElements;
        this.stats.events.total = data.events.totalElements;
        this.stats.places.total = data.places.totalElements;
        this.stats.gallery.total = data.gallery.totalElements;
      },
      error: () => {}
    });
  }

  // ── Permission helpers for template ────────────────────────────────────────

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  /** Returns true if the user has ANY of the supplied permissions. */
  hasAny(...permissions: string[]): boolean {
    return permissions.some(p => this.authService.hasPermission(p));
  }

  // ── Sidebar ────────────────────────────────────────────────────────────────

  dismissPendingBanner(): void {
    this.showPendingBanner = false;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  // ── Logout ─────────────────────────────────────────────────────────────────

  openLogoutConfirm(): void {
    this.showLogoutConfirm = true;
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false;
  }

  confirmLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/admin/login']);
      },
      error: () => {
        this.authService.clearAuth();
        this.router.navigate(['/admin/login']);
      }
    });
  }
}
