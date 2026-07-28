import { Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { map, catchError, debounceTime, takeUntil } from 'rxjs/operators';
import { AdminApiService } from '../../services/admin-api.service';

interface CategoryItem {
  id: number;
  type: string;
  code: string;
  displayName: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  visibleOnPublicPage: boolean;
  color: string;
  icon: string;
}

interface ContentImage {
  id: number;
  title: string;
  imageUrl: string;
}

interface CategoryState {
  editing: CategoryItem;
  images: ContentImage[];
  showPicker: boolean;
  loadingImages: boolean;
}

@Component({
  selector: 'app-admin-category-settings',
  templateUrl: './admin-category-settings.component.html',
  styleUrls: ['./admin-category-settings.component.scss']
})
export class AdminCategorySettingsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() categoryType: string = 'EVENT_CATEGORY';
  @Input() contentLabel: string = '';
  @Output() closed = new EventEmitter<void>();

  categories: CategoryItem[] = [];
  states: { [id: number]: CategoryState } = {};

  // Full unfiltered/unpaginated set of this type — used only to compute and
  // toggle the master ON/OFF switch, independent of the current search/page
  allCategories: CategoryItem[] = [];

  // Search + pagination (current page grid)
  searchTerm = '';
  currentPage = 0;
  pageSize = 9;
  totalPages = 0;
  totalElements = 0;

  // Typeahead dropdown (suggestions drawn from the full allCategories set,
  // independent of the debounced server-side search driving the grid)
  showSuggestions = false;
  activeSuggestionIndex = -1;

  savingIds = new Set<number>();
  togglingIds = new Set<number>();
  togglingMaster = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Whether the "Browse by Category" tile grid is shown on the public
  // listing page - independent of any individual category's own isActive
  // flag (that flag alone still governs filter dropdowns/admin forms).
  sectionEnabled = true;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(private adminApiService: AdminApiService) {}

  ngOnInit(): void {
    this.loadData();
    this.loadAllCategories();
    this.loadSectionEnabled();

    this.searchSubject.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadData();
    });
  }

  private loadSectionEnabled(): void {
    this.adminApiService.getBrowseByCategoryEnabled(this.categoryType).subscribe({
      next: (setting) => { this.sectionEnabled = setting?.value !== 'false'; },
      error: () => { this.sectionEnabled = true; }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryType'] && !changes['categoryType'].firstChange) {
      this.searchTerm = '';
      this.currentPage = 0;
      this.loadData();
      this.loadAllCategories();
      this.loadSectionEnabled();
    }
  }

  get sectionLabel(): string {
    return this.contentLabel || this.defaultLabel();
  }

  private defaultLabel(): string {
    const map: { [key: string]: string } = {
      'EVENT_CATEGORY': 'Events',
      'PACKAGE_CATEGORY': 'Packages',
      'LOCATION_CATEGORY': 'Locations',
      'PLACE_TYPE': 'Places',
      'GALLERY_CATEGORY': 'Gallery'
    };
    return map[this.categoryType] || this.categoryType;
  }

  get masterEnabled(): boolean {
    return this.sectionEnabled;
  }

  onSearchChange(): void {
    this.activeSuggestionIndex = -1;
    this.showSuggestions = this.searchTerm.trim().length > 0;
    this.searchSubject.next(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 0;
    this.showSuggestions = false;
    this.loadData();
  }

  get suggestions(): CategoryItem[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) { return []; }
    return this.allCategories
      .filter(c => c.displayName.toLowerCase().includes(term) || c.code.toLowerCase().includes(term))
      .slice(0, 6);
  }

  onSearchFocus(): void {
    if (this.searchTerm.trim()) { this.showSuggestions = true; }
  }

  onSearchBlur(): void {
    // Delay so a click on a suggestion registers before the dropdown closes
    setTimeout(() => { this.showSuggestions = false; }, 150);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    const items = this.suggestions;
    if (!this.showSuggestions || items.length === 0) { return; }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeSuggestionIndex = Math.min(this.activeSuggestionIndex + 1, items.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeSuggestionIndex = Math.max(this.activeSuggestionIndex - 1, 0);
    } else if (event.key === 'Enter' && this.activeSuggestionIndex >= 0) {
      event.preventDefault();
      this.selectSuggestion(items[this.activeSuggestionIndex]);
    } else if (event.key === 'Escape') {
      this.showSuggestions = false;
    }
  }

  selectSuggestion(cat: CategoryItem): void {
    this.searchTerm = cat.displayName;
    this.showSuggestions = false;
    this.activeSuggestionIndex = -1;
    this.currentPage = 0;
    this.loadData();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadData();
    }
  }

  previousPage(): void { this.goToPage(this.currentPage - 1); }
  nextPage(): void { this.goToPage(this.currentPage + 1); }

  refresh(): void {
    this.loadData();
    this.loadAllCategories();
  }

  private loadAllCategories(): void {
    this.adminApiService.getMasterDataByType(this.categoryType).subscribe({
      next: (data) => { this.allCategories = data; },
      error: () => { /* master toggle just won't be available; grid load surfaces the real error */ }
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.categories = [];
    this.states = {};

    this.adminApiService.getMasterDataByTypePaginated(
      this.categoryType, this.currentPage, this.pageSize, 'sortOrder,asc', this.searchTerm || undefined
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.categories = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;

        this.states = {};
        this.categories.forEach(item => {
          this.states[item.id] = {
            editing: { ...item },
            images: [],
            showPicker: false,
            loadingImages: true
          };
        });
        this.isLoading = false;
        this.loadAllCategoryImages();
      },
      error: () => {
        this.errorMessage = 'Failed to load category data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private fetchImagesForCategory(categoryCode: string): Observable<ContentImage[]> {
    switch (this.categoryType) {
      case 'EVENT_CATEGORY':
        return this.adminApiService.getEvents(0, 12, 'displayOrder,asc', undefined, categoryCode).pipe(
          map((r: any) => (r.content || []).filter((e: any) => !!e.imageUrl).map((e: any) => ({ id: e.id, title: e.title, imageUrl: e.imageUrl }))),
          catchError(() => of([]))
        );
      case 'PACKAGE_CATEGORY':
        return this.adminApiService.getPackagesPaginated(0, 12, 'displayOrder,asc', undefined, categoryCode).pipe(
          map((r: any) => (r.content || []).filter((p: any) => !!p.imageUrl).map((p: any) => ({ id: p.id, title: p.title, imageUrl: p.imageUrl }))),
          catchError(() => of([]))
        );
      case 'LOCATION_CATEGORY':
        return this.adminApiService.getLocations(0, 12, 'name,asc', undefined, categoryCode).pipe(
          map((r: any) => (r.content || []).filter((l: any) => !!l.imageUrl).map((l: any) => ({ id: l.id, title: l.name, imageUrl: l.imageUrl }))),
          catchError(() => of([]))
        );
      case 'PLACE_TYPE':
        return this.adminApiService.getPlaces(0, 12, 'name,asc', undefined, categoryCode).pipe(
          map((r: any) => (r.content || []).filter((p: any) => !!p.imageUrl).map((p: any) => ({ id: p.id, title: p.name, imageUrl: p.imageUrl }))),
          catchError(() => of([]))
        );
      default:
        return of([]);
    }
  }

  private loadAllCategoryImages(): void {
    this.categories.forEach(cat => {
      this.fetchImagesForCategory(cat.code).subscribe({
        next: (images) => {
          if (!this.states[cat.id]) { return; }
          this.states[cat.id].images = images;
          this.states[cat.id].loadingImages = false;
          if (!this.states[cat.id].editing.icon && images.length > 0) {
            this.states[cat.id].editing.icon = images[0].imageUrl;
          }
        },
        error: () => {
          if (this.states[cat.id]) { this.states[cat.id].loadingImages = false; }
        }
      });
    });
  }

  selectImage(catId: number, imageUrl: string): void {
    if (!this.states[catId]) { return; }
    this.states[catId].editing.icon = imageUrl;
    this.states[catId].showPicker = false;
  }

  togglePicker(catId: number): void {
    if (!this.states[catId]) { return; }
    this.states[catId].showPicker = !this.states[catId].showPicker;
  }

  saveItem(id: number): void {
    if (this.savingIds.has(id)) { return; }
    const state = this.states[id];
    if (!state) { return; }

    this.savingIds.add(id);
    this.errorMessage = '';
    this.successMessage = '';

    this.adminApiService.updateMasterData(id, state.editing).subscribe({
      next: (updated) => {
        const idx = this.categories.findIndex(c => c.id === id);
        const saved: CategoryItem = updated || { ...state.editing };
        if (idx !== -1) {
          this.categories[idx] = saved;
          this.states[id].editing = { ...saved };
        }
        const allIdx = this.allCategories.findIndex(c => c.id === id);
        if (allIdx !== -1) { this.allCategories[allIdx] = saved; }
        this.savingIds.delete(id);
        this.successMessage = '"' + state.editing.displayName + '" saved successfully.';
        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: (err) => {
        this.savingIds.delete(id);
        this.errorMessage = (err.error && err.error.message) || 'Failed to save changes.';
      }
    });
  }

  // Toggles this category's Browse-by-Category public visibility only — must
  // never touch isActive, which is a separate concern owned by the Event
  // Categories master-data screen (whether the category is usable at all).
  toggleActive(id: number): void {
    if (this.togglingIds.has(id)) { return; }
    const cat = this.categories.find(c => c.id === id);
    if (!cat) { return; }

    this.togglingIds.add(id);
    const prev = cat.visibleOnPublicPage;
    cat.visibleOnPublicPage = !cat.visibleOnPublicPage;
    if (this.states[id]) { this.states[id].editing.visibleOnPublicPage = cat.visibleOnPublicPage; }
    const allCat = this.allCategories.find(c => c.id === id);
    if (allCat) { allCat.visibleOnPublicPage = cat.visibleOnPublicPage; }

    this.adminApiService.toggleMasterDataVisible(id).subscribe({
      next: () => {
        this.togglingIds.delete(id);
        this.successMessage = '"' + cat.displayName + '" is now ' + (cat.visibleOnPublicPage ? 'visible' : 'hidden') + ' on the public page.';
        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: (err) => {
        cat.visibleOnPublicPage = prev;
        if (this.states[id]) { this.states[id].editing.visibleOnPublicPage = prev; }
        if (allCat) { allCat.visibleOnPublicPage = prev; }
        this.togglingIds.delete(id);
        this.errorMessage = (err.error && err.error.message) || 'Failed to update visibility.';
      }
    });
  }

  toggleMasterEnabled(): void {
    if (this.togglingMaster) { return; }
    const targetState = !this.sectionEnabled;
    const prevState = this.sectionEnabled;

    this.togglingMaster = true;
    this.sectionEnabled = targetState;

    this.adminApiService.setBrowseByCategoryEnabled(this.categoryType, targetState).subscribe({
      next: () => {
        this.togglingMaster = false;
        this.successMessage = 'Browse by Category ' + (targetState ? 'enabled' : 'disabled') + '.';
        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: () => {
        this.sectionEnabled = prevState;
        this.togglingMaster = false;
        this.errorMessage = 'Failed to update section visibility.';
        setTimeout(() => { this.errorMessage = ''; }, 3000);
      }
    });
  }

  isSaving(id: number): boolean { return this.savingIds.has(id); }
  isToggling(id: number): boolean { return this.togglingIds.has(id); }
  trackById(_: number, item: CategoryItem): number { return item.id; }
}
