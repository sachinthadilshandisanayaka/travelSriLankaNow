import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminApiService } from '../../services/admin-api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  username: string | null = '';
  isSidebarOpen = false;
  showLogoutConfirm = false;

  stats = {
    locations: { total: 0 },
    events: { total: 0 },
    places: { total: 0 },
    gallery: { total: 0 }
  };

  constructor(
    private authService: AdminAuthService,
    private apiService: AdminApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.loadStats();
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
