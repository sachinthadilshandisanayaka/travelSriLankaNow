import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { LocationService, PageResponse } from '../../services/location.service';
import { MasterDataService, MasterData } from '../../services/master-data.service';
import { Location } from '../../models/location.model';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent implements OnInit, AfterViewInit, OnDestroy {
  locations: Location[] = [];
  selectedCategory: string = 'all';
  searchTerm: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';

  // Pagination properties
  currentPage: number = 0;
  totalPages: number = 0;
  totalElements: number = 0;
  pageSize: number = 10;

  // Categories loaded from MasterData
  categories: { value: string; label: string }[] = [{ value: 'all', label: 'All Locations' }];

  private observer: IntersectionObserver | null = null;
  private searchTimeout: any;

  constructor(
    private locationService: LocationService,
    private masterDataService: MasterDataService
  ) { }

  ngOnInit(): void {
    this.loadMasterData();
    this.loadData();
  }

  private loadMasterData(): void {
    this.masterDataService.getLocationCategories().subscribe({
      next: (data: MasterData[]) => {
        this.categories = [
          { value: 'all', label: 'All Locations' },
          ...data.map(item => ({
            value: item.code,
            label: item.displayName
          }))
        ];
      },
      error: (err) => console.error('Failed to load location categories:', err)
    });
  }

  ngAfterViewInit(): void {
    // Observer will be set up after data loads
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.locationService.getLocationsPaginated(
      this.currentPage,
      this.pageSize,
      this.searchTerm,
      this.selectedCategory
    ).subscribe({
      next: (response: PageResponse<Location>) => {
        this.locations = response.content || [];
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
        setTimeout(() => this.setupScrollAnimations(), 100);
      },
      error: (error) => {
        console.error('LocationsComponent: Failed to load locations:', error);
        this.errorMessage = 'Unable to load locations. Please make sure the backend server is running.';
        this.isLoading = false;
      }
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 0;
    this.loadData();
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    // Debounce search
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 0;
      this.loadData();
    }, 300);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  private setupScrollAnimations(): void {
    const options = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          this.observer?.unobserve(entry.target);
        }
      });
    }, options);

    const revealElements = document.querySelectorAll('.reveal:not(.revealed)');
    revealElements.forEach(element => {
      if (this.observer) {
        this.observer.observe(element);
      }
    });
  }
}
