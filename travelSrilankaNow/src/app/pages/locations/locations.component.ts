import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService, PageResponse } from '../../services/location.service';
import { MasterDataService, MasterData } from '../../services/master-data.service';
import { SiteSettingsService } from '../../services/site-settings.service';
import { Location } from '../../models/location.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent implements OnInit, AfterViewInit, OnDestroy {
  locations: Location[] = [];
  selectedCategory: string = 'all';
  selectedRegion: string = 'all';
  searchTerm: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';

  // Mobile search toggle
  isSearchOpen: boolean = false;

  // Grid view options
  gridColumns: number = window.innerWidth < 768 ? 1 : 3;

  // Pagination properties
  currentPage: number = 0;
  totalPages: number = 0;
  totalElements: number = 0;
  pageSize: number = 10;

  // Categories and Regions loaded from MasterData
  categoryData: MasterData[] = [];
  categories: { value: string; label: string }[] = [{ value: 'all', label: 'All Locations' }];
  // Starts false and hidden until the setting actually loads, so a slow
  // request can't let the section flash visible before confirming it's off.
  browseByCategoryEnabled: boolean = false;
  browseByCategoryLoaded: boolean = false;
  regions: { value: string; label: string }[] = [{ value: 'all', label: 'All Regions' }];

  // Browse by Category — search + pagination over categoryData
  categorySearchTerm: string = '';
  categoryPage: number = 0;
  categoryPageSize: number = 6;

  // Typeahead dropdown for the category search box
  showCategorySuggestions: boolean = false;
  activeCategorySuggestionIndex: number = -1;

  private colorPalette = ['#1C4D8D', '#0F7B6C', '#C05621', '#6B46C1', '#B7791F', '#2C7A7B'];

  private observer: IntersectionObserver | null = null;
  private searchSubject = new Subject<string>();

  constructor(
    private locationService: LocationService,
    private masterDataService: MasterDataService,
    private siteSettingsService: SiteSettingsService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadMasterData();
    this.setupSearchDebounce();

    this.route.queryParamMap.subscribe(params => {
      const cat = params.get('category') || '';
      this.selectedCategory = cat || 'all';
      this.selectedRegion = params.get('region') || 'all';
      this.searchTerm = params.get('search') || '';

      const pageParam = parseInt(params.get('page') || '1', 10);
      this.currentPage = (!isNaN(pageParam) && pageParam > 1) ? pageParam - 1 : 0;

      this.loadData();
    });
  }

  // Single source of truth for list state (category/search/page) so the
  // browser back button and a page refresh both restore the exact same
  // view instead of the state living only in memory.
  private updateQueryParams(overrides: { [key: string]: string | number | null }): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: overrides,
      queryParamsHandling: 'merge'
    });
  }

  private loadMasterData(): void {
    this.siteSettingsService.getBrowseByCategoryEnabled('LOCATION_CATEGORY').subscribe({
      next: (enabled) => { this.browseByCategoryEnabled = enabled; this.browseByCategoryLoaded = true; },
      error: () => { this.browseByCategoryEnabled = true; this.browseByCategoryLoaded = true; }
    });

    this.masterDataService.getLocationCategories().subscribe({
      next: (data: MasterData[]) => {
        this.categoryData = data.filter((c: MasterData) => c.isActive);
      },
      error: (err) => console.error('Failed to load location categories:', err)
    });

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

    this.masterDataService.getRegions().subscribe({
      next: (data: MasterData[]) => {
        this.regions = [
          { value: 'all', label: 'All Regions' },
          ...data.map(item => ({
            value: item.code,
            label: item.displayName
          }))
        ];
      },
      error: (err) => console.error('Failed to load regions:', err)
    });
  }

  ngAfterViewInit(): void {
    // Observer will be set up after data loads
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.searchSubject.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.updateQueryParams({ search: searchTerm || null, page: null });
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.locationService.getLocationsPaginated(
      this.currentPage,
      this.pageSize,
      this.searchTerm,
      this.selectedCategory,
      this.selectedRegion
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

  navigateToCategory(code: string): void {
    this.router.navigate(['/locations'], { queryParams: { category: code } });
    const target = document.querySelector('.filter-section') as HTMLElement;
    if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }

  getCategoryColor(category: MasterData, index: number): string {
    if (category.color && category.color.trim()) { return category.color; }
    return this.colorPalette[index % this.colorPalette.length];
  }

  get filteredCategoryData(): MasterData[] {
    const term = this.categorySearchTerm.trim().toLowerCase();
    if (!term) { return this.categoryData; }
    return this.categoryData.filter(c =>
      c.displayName.toLowerCase().includes(term) ||
      (c.description || '').toLowerCase().includes(term)
    );
  }

  get categoryTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredCategoryData.length / this.categoryPageSize));
  }

  get pagedCategoryData(): MasterData[] {
    const start = this.categoryPage * this.categoryPageSize;
    return this.filteredCategoryData.slice(start, start + this.categoryPageSize);
  }

  onCategorySearchChange(): void {
    this.categoryPage = 0;
    this.activeCategorySuggestionIndex = -1;
    this.showCategorySuggestions = this.categorySearchTerm.trim().length > 0;
  }

  goToCategoryPage(page: number): void {
    if (page >= 0 && page < this.categoryTotalPages) {
      this.categoryPage = page;
    }
  }

  get categorySuggestions(): MasterData[] {
    return this.filteredCategoryData.slice(0, 6);
  }

  onCategorySearchFocus(): void {
    if (this.categorySearchTerm.trim()) { this.showCategorySuggestions = true; }
  }

  onCategorySearchBlur(): void {
    setTimeout(() => { this.showCategorySuggestions = false; }, 150);
  }

  onCategorySearchKeydown(event: KeyboardEvent): void {
    const items = this.categorySuggestions;
    if (!this.showCategorySuggestions || items.length === 0) { return; }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeCategorySuggestionIndex = Math.min(this.activeCategorySuggestionIndex + 1, items.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeCategorySuggestionIndex = Math.max(this.activeCategorySuggestionIndex - 1, 0);
    } else if (event.key === 'Enter' && this.activeCategorySuggestionIndex >= 0) {
      event.preventDefault();
      this.selectCategorySuggestion(items[this.activeCategorySuggestionIndex]);
    } else if (event.key === 'Escape') {
      this.showCategorySuggestions = false;
    }
  }

  selectCategorySuggestion(cat: MasterData): void {
    this.showCategorySuggestions = false;
    this.activeCategorySuggestionIndex = -1;
    this.categorySearchTerm = '';
    this.navigateToCategory(cat.code);
  }

  filterByCategory(category: string): void {
    if (category === 'all') {
      this.router.navigate(['/locations']);
    } else {
      this.router.navigate(['/locations'], { queryParams: { category } });
    }
  }

  filterByRegion(region: string): void {
    this.updateQueryParams({ region: region === 'all' ? null : region, page: null });
  }

  onSearchChange(event: any): void {
    this.searchSubject.next(event.target.value);
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
  }

  setGridColumns(columns: number): void {
    this.gridColumns = columns;
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.trim() !== '' || this.selectedCategory !== 'all' || this.selectedRegion !== 'all';
  }

  clearAllFilters(): void {
    this.updateQueryParams({ search: null, category: null, region: null, page: null });
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.updateQueryParams({ page: page + 1 });
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

    const revealElements = document.querySelectorAll('.card-stagger:not(.revealed)');
    revealElements.forEach(element => {
      if (this.observer) {
        this.observer.observe(element);
      }
    });
  }
}
