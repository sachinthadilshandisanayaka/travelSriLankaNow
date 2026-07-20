import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApiService, PageResponse, EntityFieldConfig } from '../../services/admin-api.service';
import { ContentStatsService } from '../../services/content-stats.service';
import { MasterData } from '../../../services/master-data.service';
import { FieldDefinition } from '../../../models/more-section.model';

@Component({
  selector: 'app-admin-locations',
  templateUrl: './admin-locations.component.html',
  styleUrls: ['./admin-locations.component.scss']
})
export class AdminLocationsComponent implements OnInit, OnDestroy {
  Math = Math; // Expose Math to template

  locations: any[] = [];
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  isLoading = false;
  showCategoryPanel = false;
  showModal = false;
  isEditMode = false;
  slugManuallyEdited = false;
  showDeleteConfirm = false;
  deleteLocationId: number | null = null;
  locationForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  // Search & filter
  searchTerm = '';
  filterCategory = '';
  filterRegion = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  categories: MasterData[] = [];
  regions: MasterData[] = [];
  galleryImages: string[] = [];

  // Dynamic field config
  fieldDefinitions: FieldDefinition[] = [];
  showFieldConfigModal = false;
  tempFieldDefinitions: FieldDefinition[] = [];
  additionalDetails: { [key: string]: any } = {};
  fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'date_range', label: 'Date Range' },
    { value: 'number_range', label: 'Number Range' },
    { value: 'select', label: 'Single Select' },
    { value: 'multi_select', label: 'Multi Select' },
    { value: 'link', label: 'Link' }
  ];

  constructor(
    private apiService: AdminApiService,
    private fb: FormBuilder,
    private contentStats: ContentStatsService
  ) {
    this.locationForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      slug: [''],
      description: ['', Validators.required],
      shortDescription: ['', Validators.required],
      imageUrl: [''],
      category: ['', Validators.required],
      region: ['', Validators.required],
      rating: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
      featured: [false],
      orderNumber: [0, [Validators.min(0)]],
      bestTimeToVisit: [''],
      activities: [''],
      highlights: ['']
    });
  }

  ngOnInit(): void {
    this.loadMasterData();
    this.loadLocations();
    this.loadFieldConfig();

    this.searchSubject.pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => { this.currentPage = 0; this.loadLocations(); });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadLocations();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterCategory = '';
    this.filterRegion = '';
    this.currentPage = 0;
    this.loadLocations();
  }

  loadFieldConfig(): void {
    this.apiService.getEntityFieldConfig('location').subscribe({
      next: (config) => { this.fieldDefinitions = config.fieldDefinitions || []; },
      error: () => {}
    });
  }

  loadMasterData(): void {
    // Admin's own unfiltered endpoints — filtering/assigning categories should
    // never be limited to whatever happens to be publicly "active" right now.
    this.apiService.getMasterDataByType('LOCATION_CATEGORY').subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
      }
    });

    this.apiService.getMasterDataByType('REGION').subscribe({
      next: (data) => {
        this.regions = data;
      },
      error: (error) => {
        console.error('Failed to load regions:', error);
      }
    });
  }

  loadLocations(): void {
    this.isLoading = true;
    this.apiService.getLocations(
      this.currentPage, this.pageSize, 'name,asc',
      this.searchTerm || undefined,
      this.filterCategory || undefined,
      this.filterRegion || undefined
    ).subscribe({
      next: (response: PageResponse<any>) => {
        this.locations = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load locations';
        this.isLoading = false;
        this.hideMessageAfterDelay();
      }
    });
  }

  initAdditionalDetails(): { [key: string]: any } {
    const details: { [key: string]: any } = {};
    for (const field of this.fieldDefinitions) {
      if (field.type === 'date_range') {
        details[field.key] = { from: '', to: '' };
      } else if (field.type === 'number_range') {
        details[field.key] = { min: null, max: null };
      } else if (field.type === 'multi_select') {
        details[field.key] = [];
      } else if (field.type === 'link') {
        details[field.key] = { url: '', displayName: '' };
      } else {
        details[field.key] = null;
      }
    }
    return details;
  }

  generateSlug(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  onNameChange(value: string): void {
    if (!this.slugManuallyEdited) {
      this.locationForm.patchValue({ slug: this.generateSlug(value) }, { emitEvent: false });
    }
  }

  onSlugInput(value: string): void {
    this.slugManuallyEdited = true;
    this.locationForm.patchValue({ slug: (value || '').toLowerCase().replace(/[^a-z0-9-]+/g, '').replace(/-{2,}/g, '-') }, { emitEvent: false });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.slugManuallyEdited = false;
    this.locationForm.reset({
      category: this.categories.length > 0 ? this.categories[0].code : '',
      region: this.regions.length > 0 ? this.regions[0].code : '',
      rating: 0,
      featured: false,
      orderNumber: 0
    });
    this.galleryImages = [];
    this.additionalDetails = this.initAdditionalDetails();
    this.showModal = true;
  }

  openEditModal(location: any): void {
    this.isEditMode = true;
    this.slugManuallyEdited = true;
    this.locationForm.patchValue({
      ...location,
      activities: location.activities ? location.activities.join(', ') : '',
      highlights: location.highlights ? location.highlights.join(', ') : ''
    });
    this.galleryImages = location.images || [];
    this.additionalDetails = location.additionalDetails ? { ...location.additionalDetails } : this.initAdditionalDetails();
    for (const field of this.fieldDefinitions) {
      if (this.additionalDetails[field.key] === undefined) {
        if (field.type === 'date_range') this.additionalDetails[field.key] = { from: '', to: '' };
        else if (field.type === 'number_range') this.additionalDetails[field.key] = { min: null, max: null };
        else if (field.type === 'multi_select') this.additionalDetails[field.key] = [];
        else if (field.type === 'link') this.additionalDetails[field.key] = { url: '', displayName: '' };
        else this.additionalDetails[field.key] = null;
      }
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.locationForm.reset();
  }

  saveLocation(): void {
    if (this.locationForm.invalid) {
      this.errorMessage = 'Please fill all required fields';
      this.hideMessageAfterDelay();
      return;
    }

    const formValue = this.locationForm.value;
    const locationData = {
      ...formValue,
      activities: formValue.activities ? formValue.activities.split(',').map((a: string) => a.trim()).filter((a: string) => a) : [],
      highlights: formValue.highlights ? formValue.highlights.split(',').map((h: string) => h.trim()).filter((h: string) => h) : [],
      images: this.galleryImages,
      additionalDetails: this.additionalDetails
    };

    this.isLoading = true;

    if (this.isEditMode && formValue.id) {
      this.apiService.updateLocation(formValue.id, locationData).subscribe({
        next: () => {
          this.successMessage = 'Location updated successfully!';
          this.closeModal();
          this.loadLocations();
          this.hideMessageAfterDelay();
        },
        error: (err: any) => {
          this.errorMessage = err?.error?.message || 'Failed to update location';
          this.isLoading = false;
          this.hideMessageAfterDelay();
        }
      });
    } else {
      this.apiService.createLocation(locationData).subscribe({
        next: () => {
          this.successMessage = 'Location created successfully!';
          this.closeModal();
          this.loadLocations();
          this.contentStats.notify();
          this.hideMessageAfterDelay();
        },
        error: (err: any) => {
          this.errorMessage = err?.error?.message || 'Failed to create location';
          this.isLoading = false;
          this.hideMessageAfterDelay();
        }
      });
    }
  }

  openFieldConfigModal(): void {
    this.tempFieldDefinitions = this.fieldDefinitions.map(f => ({ ...f, options: f.options ? [...f.options] : [] }));
    this.showFieldConfigModal = true;
  }

  closeFieldConfigModal(): void {
    this.showFieldConfigModal = false;
    this.tempFieldDefinitions = [];
  }

  saveFieldConfig(): void {
    this.apiService.upsertEntityFieldConfig('location', this.tempFieldDefinitions).subscribe({
      next: (config) => {
        this.fieldDefinitions = config.fieldDefinitions || [];
        this.closeFieldConfigModal();
        this.successMessage = 'Field configuration saved!';
        this.hideMessageAfterDelay();
      },
      error: () => {
        this.errorMessage = 'Failed to save field configuration';
        this.hideMessageAfterDelay();
      }
    });
  }

  addFieldDefinition(): void {
    this.tempFieldDefinitions.push({
      key: '',
      label: '',
      type: 'text',
      required: false,
      options: []
    });
  }

  removeFieldDefinition(index: number): void {
    this.tempFieldDefinitions.splice(index, 1);
  }

  onFieldLabelChange(field: FieldDefinition): void {
    field.key = field.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
  }

  onFieldTypeChange(field: FieldDefinition): void {
    if (field.type !== 'select' && field.type !== 'multi_select') {
      field.options = [];
    }
  }

  getOptionsString(field: FieldDefinition): string {
    return field.options ? field.options.join(', ') : '';
  }

  setOptionsFromString(field: FieldDefinition, value: string): void {
    field.options = value.split(',').map((o: string) => o.trim()).filter((o: string) => o);
  }

  isOptionSelected(fieldKey: string, option: string): boolean {
    const val = this.additionalDetails?.[fieldKey];
    return Array.isArray(val) && val.includes(option);
  }

  toggleMultiSelectOption(fieldKey: string, option: string): void {
    if (!this.additionalDetails) this.additionalDetails = {};
    if (!Array.isArray(this.additionalDetails[fieldKey])) {
      this.additionalDetails[fieldKey] = [];
    }
    const arr = this.additionalDetails[fieldKey];
    const idx = arr.indexOf(option);
    if (idx > -1) {
      arr.splice(idx, 1);
    } else {
      arr.push(option);
    }
  }

  confirmDelete(id: number): void {
    this.deleteLocationId = id;
    this.showDeleteConfirm = true;
  }

  deleteLocation(): void {
    if (this.deleteLocationId === null) return;

    this.isLoading = true;
    this.apiService.deleteLocation(this.deleteLocationId).subscribe({
      next: () => {
        this.successMessage = 'Location deleted successfully!';
        this.contentStats.notify();
        this.showDeleteConfirm = false;
        this.deleteLocationId = null;
        this.loadLocations();
        this.hideMessageAfterDelay();
      },
      error: () => {
        this.errorMessage = 'Failed to delete location';
        this.isLoading = false;
        this.showDeleteConfirm = false;
        this.hideMessageAfterDelay();
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteLocationId = null;
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadLocations();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadLocations();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadLocations();
    }
  }

  getLinkUrl(key: string): string {
    const val = this.additionalDetails?.[key];
    if (!val) return '';
    return typeof val === 'object' ? (val.url || '') : val;
  }

  getLinkDisplayName(key: string): string {
    const val = this.additionalDetails?.[key];
    if (!val || typeof val !== 'object') return '';
    return val.displayName || '';
  }

  setLinkUrl(key: string, url: string): void {
    const cur = this.additionalDetails[key];
    this.additionalDetails[key] = typeof cur === 'object' && cur ? { ...cur, url } : { url, displayName: '' };
  }

  setLinkDisplayName(key: string, displayName: string): void {
    const cur = this.additionalDetails[key];
    this.additionalDetails[key] = typeof cur === 'object' && cur ? { ...cur, displayName } : { url: '', displayName };
  }

  hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  onPrimaryImageChanged(imageUrl: string): void {
    this.locationForm.patchValue({ imageUrl });
  }

  onGalleryImagesChanged(images: string[]): void {
    this.galleryImages = images;
  }
}
