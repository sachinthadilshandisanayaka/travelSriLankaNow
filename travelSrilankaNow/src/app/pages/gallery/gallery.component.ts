import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { GalleryService, PageResponse } from '../../services/gallery.service';
import { MasterDataService, MasterData } from '../../services/master-data.service';
import { GalleryItem } from '../../models/gallery-item.model';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit, AfterViewInit, OnDestroy {
  galleryItems: GalleryItem[] = [];
  selectedCategory: string = 'all';
  selectedType: string = 'all';
  searchTerm: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';

  // Pagination properties
  currentPage: number = 0;
  totalPages: number = 0;
  totalElements: number = 0;
  pageSize: number = 12;

  // Categories and types loaded from MasterData
  categories: { value: string; label: string }[] = [{ value: 'all', label: 'All' }];
  mediaTypes: { value: string; label: string }[] = [{ value: 'all', label: 'All Media' }];

  // Search debounce
  private searchSubject = new Subject<string>();
  private observer: IntersectionObserver | null = null;

  constructor(
    private galleryService: GalleryService,
    private masterDataService: MasterDataService
  ) { }

  ngOnInit(): void {
    this.loadMasterData();
    this.loadData();
    this.setupSearchDebounce();
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

  private loadMasterData(): void {
    // Load gallery categories from admin panel
    this.masterDataService.getGalleryCategories().subscribe({
      next: (data: MasterData[]) => {
        this.categories = [
          { value: 'all', label: 'All' },
          ...data.map(item => ({
            value: item.code,
            label: item.displayName
          }))
        ];
      },
      error: (err) => {
        console.error('Failed to load gallery categories:', err);
        // Keep default categories if API fails
      }
    });

    // Load gallery types from admin panel
    this.masterDataService.getGalleryTypes().subscribe({
      next: (data: MasterData[]) => {
        this.mediaTypes = [
          { value: 'all', label: 'All Media' },
          ...data.map(item => ({
            value: item.code,
            label: item.displayName
          }))
        ];
      },
      error: (err) => {
        console.error('Failed to load gallery types:', err);
        // Keep default types if API fails
      }
    });
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.currentPage = 0;
      this.loadData();
    });
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.galleryService.getGalleryItemsPaginated(
      this.currentPage,
      this.pageSize,
      this.searchTerm,
      this.selectedCategory,
      this.selectedType
    ).subscribe({
      next: (response: PageResponse<GalleryItem>) => {
        this.galleryItems = response.content || [];
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
        setTimeout(() => this.setupScrollAnimations(), 100);
      },
      error: (error) => {
        console.error('GalleryComponent: Failed to load gallery items:', error);
        this.errorMessage = 'Unable to load gallery. Please make sure the backend server is running.';
        this.isLoading = false;
      }
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 0;
    this.loadData();
  }

  filterByType(type: string): void {
    this.selectedType = type;
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
