import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApiService, PageResponse, EntityFieldConfig } from '../../services/admin-api.service';
import { ContentStatsService } from '../../services/content-stats.service';
import { MasterData } from '../../../services/master-data.service';
import { FieldDefinition } from '../../../models/more-section.model';

@Component({
  selector: 'app-admin-places',
  templateUrl: './admin-places.component.html',
  styleUrls: ['./admin-places.component.scss']
})
export class AdminPlacesComponent implements OnInit, OnDestroy {
  Math = Math; // Expose Math to template

  places: any[] = [];
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
  deletePlaceId: number | null = null;
  placeForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  // Search & filter
  searchTerm = '';
  filterType = '';
  filterPriceRange = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  placeTypes: MasterData[] = [];
  regions: MasterData[] = [];
  priceRanges: MasterData[] = [];
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
    this.placeForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      slug: [''],
      type: ['', Validators.required],
      description: ['', Validators.required],
      shortDescription: ['', Validators.required],
      imageUrl: [''],
      location: ['', Validators.required],
      region: ['', Validators.required],
      rating: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
      priceRange: ['', Validators.required],
      price: [null, [Validators.min(0)]],
      phone: [''],
      email: ['', Validators.email],
      website: [''],
      address: [''],
      openingHours: [''],
      cuisine: [''],
      amenities: [''],
      lat: [null, [Validators.min(-90), Validators.max(90)]],
      lng: [null, [Validators.min(-180), Validators.max(180)]],
      featured: [false],
      displayOrder: [0, [Validators.min(0)]]
    });
  }

  nextDisplayOrder = 0;

  ngOnInit(): void {
    this.loadMasterData();
    this.loadPlaces();
    this.loadFieldConfig();
    this.refreshNextDisplayOrder();

    this.searchSubject.pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => { this.currentPage = 0; this.loadPlaces(); });
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
    this.loadPlaces();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterType = '';
    this.filterPriceRange = '';
    this.currentPage = 0;
    this.loadPlaces();
  }

  loadFieldConfig(): void {
    this.apiService.getEntityFieldConfig('place').subscribe({
      next: (config) => { this.fieldDefinitions = config.fieldDefinitions || []; },
      error: () => {}
    });
  }

  initAdditionalDetails(): { [key: string]: any } {
    const details: { [key: string]: any } = {};
    for (const field of this.fieldDefinitions) {
      if (field.type === 'date_range') details[field.key] = { from: '', to: '' };
      else if (field.type === 'number_range') details[field.key] = { min: null, max: null };
      else if (field.type === 'multi_select') details[field.key] = [];
      else if (field.type === 'link') details[field.key] = { url: '', displayName: '' };
      else details[field.key] = null;
    }
    return details;
  }

  openFieldConfigModal(): void {
    this.tempFieldDefinitions = this.fieldDefinitions.map(f => ({ ...f, options: f.options ? [...f.options] : [] }));
    this.showFieldConfigModal = true;
  }

  closeFieldConfigModal(): void {
    this.showFieldConfigModal = false;
  }

  saveFieldConfig(): void {
    this.apiService.upsertEntityFieldConfig('place', this.tempFieldDefinitions).subscribe({
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
    this.tempFieldDefinitions.push({ key: '', label: '', type: 'text', required: false, options: [] });
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

  loadMasterData(): void {
    this.apiService.getMasterDataByType('PLACE_TYPE').subscribe({
      next: (data) => {
        this.placeTypes = data.filter((t: MasterData) => t.isActive);
      },
      error: (error) => {
        console.error('Failed to load place types:', error);
      }
    });

    this.apiService.getMasterDataByType('REGION').subscribe({
      next: (data) => {
        this.regions = data.filter((r: MasterData) => r.isActive);
      },
      error: (error) => {
        console.error('Failed to load regions:', error);
      }
    });

    this.apiService.getMasterDataByType('PRICE_RANGE').subscribe({
      next: (data) => {
        this.priceRanges = data.filter((p: MasterData) => p.isActive);
      },
      error: (error) => {
        console.error('Failed to load price ranges:', error);
      }
    });
  }

  refreshNextDisplayOrder(): void {
    this.apiService.getPlaces(0, 1, 'displayOrder,desc').subscribe({
      next: (response: PageResponse<any>) => {
        const highest = response.content?.[0]?.displayOrder;
        this.nextDisplayOrder = (typeof highest === 'number' ? highest : -1) + 1;
      },
      error: () => {}
    });
  }

  loadPlaces(): void {
    this.isLoading = true;
    this.apiService.getPlaces(
      this.currentPage, this.pageSize, 'name,asc',
      this.searchTerm || undefined,
      this.filterType || undefined,
      this.filterPriceRange || undefined
    ).subscribe({
      next: (response: PageResponse<any>) => {
        this.places = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load places';
        this.isLoading = false;
        this.hideMessageAfterDelay();
      }
    });
  }

  generateSlug(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  onNameChange(value: string): void {
    if (!this.slugManuallyEdited) {
      this.placeForm.patchValue({ slug: this.generateSlug(value) }, { emitEvent: false });
    }
  }

  onSlugInput(value: string): void {
    this.slugManuallyEdited = true;
    this.placeForm.patchValue({ slug: (value || '').toLowerCase().replace(/[^a-z0-9-]+/g, '').replace(/-{2,}/g, '-') }, { emitEvent: false });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.slugManuallyEdited = false;
    this.placeForm.reset({
      type: this.placeTypes.length > 0 ? this.placeTypes[0].code : '',
      region: this.regions.length > 0 ? this.regions[0].code : '',
      priceRange: this.priceRanges.length > 1 ? this.priceRanges[1].code : '',
      rating: 0,
      featured: false,
      displayOrder: this.nextDisplayOrder
    });
    this.galleryImages = [];
    this.additionalDetails = this.initAdditionalDetails();
    this.showModal = true;
  }

  openEditModal(place: any): void {
    this.isEditMode = true;
    this.slugManuallyEdited = true;
    this.placeForm.patchValue({
      ...place,
      cuisine: place.cuisine ? place.cuisine.join(', ') : '',
      amenities: place.amenities ? place.amenities.join(', ') : '',
      phone: place.contact?.phone || '',
      email: place.contact?.email || '',
      website: place.contact?.website || '',
      lat: place.coordinates?.lat || null,
      lng: place.coordinates?.lng || null
    });
    this.galleryImages = place.images || [];
    this.additionalDetails = place.additionalDetails ? { ...place.additionalDetails } : this.initAdditionalDetails();
    // Ensure all field definitions have entries
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
    this.placeForm.reset();
  }

  savePlace(): void {
    if (this.placeForm.invalid) {
      this.errorMessage = 'Please fill all required fields';
      this.hideMessageAfterDelay();
      return;
    }

    const formValue = this.placeForm.value;
    const placeData = {
      ...formValue,
      cuisine: formValue.cuisine ? formValue.cuisine.split(',').map((c: string) => c.trim()).filter((c: string) => c) : [],
      amenities: formValue.amenities ? formValue.amenities.split(',').map((a: string) => a.trim()).filter((a: string) => a) : [],
      contact: {
        phone: formValue.phone || '',
        email: formValue.email || '',
        website: formValue.website || ''
      },
      coordinates: {
        lat: formValue.lat || 0,
        lng: formValue.lng || 0
      },
      images: this.galleryImages,
      additionalDetails: this.additionalDetails
    };

    // Remove the flat fields that are now nested
    delete placeData.phone;
    delete placeData.email;
    delete placeData.website;
    delete placeData.lat;
    delete placeData.lng;

    this.isLoading = true;

    if (this.isEditMode && formValue.id) {
      this.apiService.updatePlace(formValue.id, placeData).subscribe({
        next: () => {
          this.successMessage = 'Place updated successfully!';
          this.closeModal();
          this.loadPlaces();
          this.hideMessageAfterDelay();
        },
        error: (err: any) => {
          this.errorMessage = err?.error?.message || 'Failed to update place';
          this.isLoading = false;
          this.hideMessageAfterDelay();
        }
      });
    } else {
      this.apiService.createPlace(placeData).subscribe({
        next: () => {
          this.successMessage = 'Place created successfully!';
          this.closeModal();
          this.loadPlaces();
          this.refreshNextDisplayOrder();
          this.contentStats.notify();
          this.hideMessageAfterDelay();
        },
        error: (err: any) => {
          this.errorMessage = err?.error?.message || 'Failed to create place';
          this.isLoading = false;
          this.hideMessageAfterDelay();
        }
      });
    }
  }

  confirmDelete(id: number): void {
    this.deletePlaceId = id;
    this.showDeleteConfirm = true;
  }

  deletePlace(): void {
    if (this.deletePlaceId === null) return;

    this.isLoading = true;
    this.apiService.deletePlace(this.deletePlaceId).subscribe({
      next: () => {
        this.successMessage = 'Place deleted successfully!';
        this.contentStats.notify();
        this.showDeleteConfirm = false;
        this.deletePlaceId = null;
        this.loadPlaces();
        this.refreshNextDisplayOrder();
        this.hideMessageAfterDelay();
      },
      error: () => {
        this.errorMessage = 'Failed to delete place';
        this.isLoading = false;
        this.showDeleteConfirm = false;
        this.hideMessageAfterDelay();
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deletePlaceId = null;
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadPlaces();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadPlaces();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadPlaces();
    }
  }

  hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  onPrimaryImageChanged(imageUrl: string): void {
    this.placeForm.patchValue({ imageUrl });
  }

  onGalleryImagesChanged(images: string[]): void {
    this.galleryImages = images;
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

  // Helper method to get place type icon
  getPlaceTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      hotel: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      restaurant: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
      cafe: 'M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.9 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3z',
      guesthouse: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
      resort: 'M12 3L2 12h3v8h14v-8h3L12 3zm0 2.5L17.5 11H15v7h-2v-4h-2v4H9v-7H6.5L12 5.5z'
    };
    return icons[type] || icons.hotel;
  }
}
