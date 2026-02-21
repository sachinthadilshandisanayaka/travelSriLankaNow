import { Component, OnInit } from '@angular/core';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminApiService } from '../../services/admin-api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  username: string | null = '';
  isLoading = true;

  stats = {
    locations: { total: 0, featured: 0 },
    events: { total: 0, featured: 0 },
    places: { total: 0, featured: 0 },
    gallery: { total: 0, featured: 0 }
  };

  recentLocations: any[] = [];
  recentEvents: any[] = [];

  constructor(
    private authService: AdminAuthService,
    private apiService: AdminApiService
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    forkJoin({
      locations: this.apiService.getLocations(0, 100),
      events: this.apiService.getEvents(0, 100),
      places: this.apiService.getPlaces(0, 100),
      gallery: this.apiService.getGalleryItems(0, 100)
    }).subscribe({
      next: (data) => {
        this.stats.locations.total = data.locations.totalElements;
        this.stats.locations.featured = data.locations.content.filter((l: any) => l.featured).length;
        this.stats.events.total = data.events.totalElements;
        this.stats.events.featured = data.events.content.filter((e: any) => e.featured).length;
        this.stats.places.total = data.places.totalElements;
        this.stats.places.featured = data.places.content.filter((p: any) => p.featured).length;
        this.stats.gallery.total = data.gallery.totalElements;
        this.stats.gallery.featured = data.gallery.content.filter((g: any) => g.featured).length;
        this.recentLocations = data.locations.content.slice(0, 3);
        this.recentEvents = data.events.content.slice(0, 3);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }

  getPercentage(featured: number, total: number): number {
    return total > 0 ? Math.round((featured / total) * 100) : 0;
  }
}
