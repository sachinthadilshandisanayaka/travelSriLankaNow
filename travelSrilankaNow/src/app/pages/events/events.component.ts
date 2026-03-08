import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { EventService, PageResponse } from '../../services/event.service';
import { MasterDataService, MasterData } from '../../services/master-data.service';
import { Event as EventModel } from '../../models/event.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit, AfterViewInit, OnDestroy {
  events: EventModel[] = [];
  selectedCategory: string = 'all';
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

  // Categories loaded from MasterData
  categories: { value: string; label: string }[] = [{ value: 'all', label: 'All Events' }];

  private observer: IntersectionObserver | null = null;
  private searchSubject = new Subject<string>();

  constructor(
    private eventService: EventService,
    private masterDataService: MasterDataService
  ) { }

  ngOnInit(): void {
    this.loadMasterData();
    this.setupSearchDebounce();
    this.loadData();
  }

  private loadMasterData(): void {
    this.masterDataService.getEventCategories().subscribe({
      next: (data: MasterData[]) => {
        this.categories = [
          { value: 'all', label: 'All Events' },
          ...data.map(item => ({
            value: item.code,
            label: item.displayName
          }))
        ];
      },
      error: (err) => console.error('Failed to load event categories:', err)
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

    this.eventService.getEventsPaginated(
      this.currentPage,
      this.pageSize,
      this.searchTerm,
      this.selectedCategory
    ).subscribe({
      next: (response: PageResponse<EventModel>) => {
        this.events = response.content || [];
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
        setTimeout(() => this.setupScrollAnimations(), 100);
      },
      error: (error) => {
        console.error('EventsComponent: Failed to load events:', error);
        this.errorMessage = 'Unable to load events. Please make sure the backend server is running.';
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
    this.searchSubject.next(event.target.value);
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
  }

  setGridColumns(columns: number): void {
    this.gridColumns = columns;
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.trim() !== '' || this.selectedCategory !== 'all';
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.currentPage = 0;
    this.loadData();
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

    const revealElements = document.querySelectorAll('.card-stagger:not(.revealed)');
    revealElements.forEach(element => {
      if (this.observer) {
        this.observer.observe(element);
      }
    });
  }
}
