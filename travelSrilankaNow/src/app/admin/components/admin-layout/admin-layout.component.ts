import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminApiService } from '../../services/admin-api.service';
import { forkJoin, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';

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
  private displayNameSub!: Subscription;
  private readonly adminApi = `${environment.apiUrl}/admin`;

  stats = {
    locations: { total: 0 },
    events: { total: 0 },
    places: { total: 0 },
    gallery: { total: 0 }
  };

  constructor(
    private authService: AdminAuthService,
    private apiService: AdminApiService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.displayNameSub = this.authService.displayName$.subscribe(name => {
      this.displayName = name;
    });
    this.loadStats();
    this.loadPendingCount();
  }

  ngOnDestroy(): void {
    if (this.displayNameSub) {
      this.displayNameSub.unsubscribe();
    }
  }

  private loadStats(): void {
    forkJoin({
      locations: this.apiService.getLocations(0, 1),
      events: this.apiService.getEvents(0, 1),
      places: this.apiService.getPlaces(0, 1),
      gallery: this.apiService.getGalleryItems(0, 1)
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

  private loadPendingCount(): void {
    const params = new HttpParams().set('page', '0').set('size', '1').set('status', 'pending');
    this.http.get<{ totalElements: number }>(`${this.adminApi}/bookings`, { params }).subscribe({
      next: (res) => { this.pendingCount = res.totalElements; },
      error: () => {}
    });
  }

  dismissPendingBanner(): void {
    this.showPendingBanner = false;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

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
