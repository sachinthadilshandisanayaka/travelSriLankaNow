import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { PlaceService, PageResponse } from '../../services/place.service';
import { MasterDataService, MasterData } from '../../services/master-data.service';
import { Place } from '../../models/place.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-places',
  templateUrl: './places.component.html',
  styleUrls: ['./places.component.scss']
})
export class PlacesComponent implements OnInit, AfterViewInit, OnDestroy {
  places: Place[] = [];
  selectedType: string = 'all';
  selectedPriceRange: string = 'all';
  searchTerm: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';

  // Pagination properties
  currentPage: number = 0;
  totalPages: number = 0;
  totalElements: number = 0;
  pageSize: number = 10;

  // Types and price ranges loaded from MasterData
  placeTypes: { value: string; label: string }[] = [{ value: 'all', label: 'All Places' }];
  priceRanges: { value: string; label: string }[] = [{ value: 'all', label: 'All Prices' }];

  private observer: IntersectionObserver | null = null;
  private searchSubject = new Subject<string>();

  constructor(
    private placeService: PlaceService,
    private masterDataService: MasterDataService
  ) { }

  ngOnInit(): void {
    this.loadMasterData();
    this.setupSearchDebounce();
    this.loadData();
  }

  private loadMasterData(): void {
    // Load place types
    this.masterDataService.getPlaceTypes().subscribe({
      next: (data: MasterData[]) => {
        this.placeTypes = [
          { value: 'all', label: 'All Places' },
          ...data.map(item => ({
            value: item.code,
            label: item.displayName
          }))
        ];
      },
      error: (err) => console.error('Failed to load place types:', err)
    });

    // Load price ranges
    this.masterDataService.getPriceRanges().subscribe({
      next: (data: MasterData[]) => {
        this.priceRanges = [
          { value: 'all', label: 'All Prices' },
          ...data.map(item => ({
            value: item.code,
            label: item.displayName
          }))
        ];
      },
      error: (err) => console.error('Failed to load price ranges:', err)
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
      this.searchTerm = searchTerm;
      this.currentPage = 0;
      this.loadData();
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.placeService.getPlacesPaginated(
      this.currentPage,
      this.pageSize,
      this.searchTerm,
      this.selectedType,
      this.selectedPriceRange
    ).subscribe({
      next: (response: PageResponse<Place>) => {
        this.places = response.content || [];
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
        setTimeout(() => this.setupScrollAnimations(), 100);
      },
      error: (error) => {
        console.error('PlacesComponent: Failed to load places:', error);
        this.errorMessage = 'Unable to load places. Please make sure the backend server is running.';
        this.isLoading = false;
      }
    });
  }

  filterByType(type: string): void {
    this.selectedType = type;
    this.currentPage = 0;
    this.loadData();
  }

  filterByPriceRange(priceRange: string): void {
    this.selectedPriceRange = priceRange;
    this.currentPage = 0;
    this.loadData();
  }

  onSearchChange(event: any): void {
    this.searchSubject.next(event.target.value);
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

    if (endPage - startPage + 1 < maxVisiblePages) {
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
