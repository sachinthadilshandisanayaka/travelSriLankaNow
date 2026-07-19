import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApiService, PageResponse, EntityFieldConfig } from '../../services/admin-api.service';
import { ContentStatsService } from '../../services/content-stats.service';
import { MasterDataService, MasterData } from '../../../services/master-data.service';
import { FieldDefinition } from '../../../models/more-section.model';

interface PackageLocationItem {
  id?: number;
  name: string;
  description: string;
  visitOrder: number;
  durationHere: string;
}

interface PricingItem {
  id?: number;
  currencyCode: string;
  amount: number | null;
  pricingType: 'PER_PERSON' | 'GROUP' | 'FULL_EVENT';
  groupSize: number | null;     // legacy
  groupSizeMin: number | null;  // min group size
  groupSizeMax: number | null;  // max group size (null = no upper limit)
  label: string;
  isPrimary: boolean;
  displayOrder: number;
}

@Component({
  selector: 'app-admin-packages',
  templateUrl: './admin-packages.component.html',
  styleUrls: ['./admin-packages.component.scss']
})
export class AdminPackagesComponent implements OnInit, OnDestroy {
  Math = Math; // Expose Math to template

  packages: any[] = [];
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
  deletePackageId: number | null = null;
  packageForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  // Search & filter
  searchTerm = '';
  filterCategory = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  categories: MasterData[] = [];
  currencies: MasterData[] = [];
  galleryImages: string[] = [];

  // Multi-location & pricing
  packageLocations: PackageLocationItem[] = [];
  pricings: PricingItem[] = [];

  readonly pricingTypes = [
    { value: 'PER_PERSON', label: 'Per Person' },
    { value: 'GROUP', label: 'Group Price' },
    { value: 'FULL_EVENT', label: 'Full Event Package' }
  ];

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
    private masterDataService: MasterDataService,
    private contentStats: ContentStatsService
  ) {
    this.packageForm = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      slug: [''],
      description: ['', Validators.required],
      shortDescription: ['', Validators.required],
      imageUrl: [''],
      category: ['cultural', Validators.required],
      location: [''],
      price: [null, [Validators.min(0)]],
      duration: ['', Validators.required],
      maxParticipants: [0, [Validators.required, Validators.min(1)]],
      availableSpots: [0, [Validators.required, Validators.min(0)]],
      included: [''],
      requirements: [''],
      rating: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
      featured: [false],
      orderNumber: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadCurrencies();
    this.loadPackages();
    this.loadFieldConfig();
    this.searchSubject.pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => { this.currentPage = 0; this.loadPackages(); });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  onSearchChange(term: string): void { this.searchTerm = term; this.searchSubject.next(term); }

  onFilterChange(): void { this.currentPage = 0; this.loadPackages(); }

  clearSearch(): void { this.searchTerm = ''; this.filterCategory = ''; this.currentPage = 0; this.loadPackages(); }

  loadCurrencies(): void {
    this.masterDataService.getCurrencies().subscribe({
      next: (data) => { this.currencies = data; },
      error: () => {}
    });
  }

  loadFieldConfig(): void {
    this.apiService.getEntityFieldConfig('package').subscribe({
      next: (config) => { this.fieldDefinitions = config.fieldDefinitions || []; },
      error: () => {}
    });
  }

  getCategoryDisplayName(code: string): string {
    if (!code) { return ''; }
    const cat = this.categories.find(c => c.code === code);
    return cat ? cat.displayName : code;
  }

  loadCategories(): void {
    this.masterDataService.getPackageCategories().subscribe({
      next: (data) => {
        this.categories = data;
        if (data.length > 0 && !this.packageForm.get('category')?.value) {
          this.packageForm.patchValue({ category: data[0].code });
        }
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
      }
    });
  }

  loadPackages(): void {
    this.isLoading = true;
    this.apiService.getPackagesPaginated(this.currentPage, this.pageSize, 'title,asc',
      this.searchTerm || undefined, this.filterCategory || undefined).subscribe({
      next: (response: PageResponse<any>) => {
        this.packages = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load packages';
        this.isLoading = false;
        this.hideMessageAfterDelay();
      }
    });
  }

  generateSlug(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  onTitleChange(value: string): void {
    if (!this.slugManuallyEdited) {
      this.packageForm.patchValue({ slug: this.generateSlug(value) }, { emitEvent: false });
    }
  }

  onSlugInput(value: string): void {
    this.slugManuallyEdited = true;
    this.packageForm.patchValue({ slug: (value || '').toLowerCase().replace(/[^a-z0-9-]+/g, '').replace(/-{2,}/g, '-') }, { emitEvent: false });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.slugManuallyEdited = false;
    this.packageForm.reset({
      category: this.categories.length > 0 ? this.categories[0].code : '',
      price: 0,
      maxParticipants: 1,
      availableSpots: 0,
      rating: 0,
      featured: false,
      orderNumber: 0
    });
    this.galleryImages = [];
    this.packageLocations = [];
    this.pricings = [];
    this.additionalDetails = this.initAdditionalDetails();
    this.showModal = true;
  }

  openEditModal(pkg: any): void {
    this.isEditMode = true;
    this.slugManuallyEdited = true;
    this.packageForm.patchValue({
      ...pkg,
      included: pkg.included ? pkg.included.join(', ') : '',
      requirements: pkg.requirements ? pkg.requirements.join(', ') : ''
    });
    this.galleryImages = pkg.images || [];
    this.packageLocations = pkg.packageLocations
      ? pkg.packageLocations.map((l: any) => ({
          id: l.id,
          name: l.name || '',
          description: l.description || '',
          visitOrder: l.visitOrder ?? 0,
          durationHere: l.durationHere || ''
        }))
      : [];
    this.pricings = pkg.pricings
      ? pkg.pricings.map((p: any) => ({
          id: p.id,
          currencyCode: p.currencyCode || 'USD',
          amount: p.amount ?? null,
          pricingType: p.pricingType || 'PER_PERSON',
          groupSize: p.groupSize ?? null,
          groupSizeMin: p.groupSizeMin ?? p.groupSize ?? null,
          groupSizeMax: p.groupSizeMax ?? null,
          label: p.label || '',
          isPrimary: !!p.isPrimary,
          displayOrder: p.displayOrder ?? 0
        }))
      : [];
    this.additionalDetails = pkg.additionalDetails ? { ...pkg.additionalDetails } : this.initAdditionalDetails();
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
    this.packageForm.reset();
  }

  savePackage(): void {
    if (this.packageForm.invalid) {
      this.errorMessage = 'Please fill all required fields';
      this.hideMessageAfterDelay();
      return;
    }

    const formValue = this.packageForm.value;
    const packageData = {
      ...formValue,
      included: formValue.included ? formValue.included.split(',').map((i: string) => i.trim()).filter((i: string) => i) : [],
      requirements: formValue.requirements ? formValue.requirements.split(',').map((r: string) => r.trim()).filter((r: string) => r) : [],
      images: this.galleryImages,
      additionalDetails: this.additionalDetails,
      packageLocations: this.packageLocations.map((l, idx) => ({ ...l, visitOrder: idx })),
      pricings: this.pricings.map((p, idx) => ({ ...p, displayOrder: idx }))
    };

    this.isLoading = true;

    if (this.isEditMode && formValue.id) {
      this.apiService.updatePackage(formValue.id, packageData).subscribe({
        next: () => {
          this.successMessage = 'Package updated successfully!';
          this.closeModal();
          this.loadPackages();
          this.hideMessageAfterDelay();
        },
        error: (err: any) => {
          this.errorMessage = err?.error?.message || 'Failed to update package';
          this.isLoading = false;
          this.hideMessageAfterDelay();
        }
      });
    } else {
      this.apiService.createPackage(packageData).subscribe({
        next: () => {
          this.successMessage = 'Package created successfully!';
          this.closeModal();
          this.loadPackages();
          this.contentStats.notify();
          this.hideMessageAfterDelay();
        },
        error: (err: any) => {
          this.errorMessage = err?.error?.message || 'Failed to create package';
          this.isLoading = false;
          this.hideMessageAfterDelay();
        }
      });
    }
  }

  confirmDelete(id: number): void {
    this.deletePackageId = id;
    this.showDeleteConfirm = true;
  }

  deletePackage(): void {
    if (this.deletePackageId === null) return;

    this.isLoading = true;
    this.apiService.deletePackage(this.deletePackageId).subscribe({
      next: () => {
        this.successMessage = 'Package deleted successfully!';
        this.showDeleteConfirm = false;
        this.deletePackageId = null;
        this.loadPackages();
        this.contentStats.notify();
        this.hideMessageAfterDelay();
      },
      error: () => {
        this.errorMessage = 'Failed to delete package';
        this.isLoading = false;
        this.showDeleteConfirm = false;
        this.hideMessageAfterDelay();
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deletePackageId = null;
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadPackages();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadPackages();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadPackages();
    }
  }

  hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  onPrimaryImageChanged(imageUrl: string): void {
    this.packageForm.patchValue({ imageUrl });
  }

  onGalleryImagesChanged(images: string[]): void {
    this.galleryImages = images;
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

  // ===== Package Location methods =====
  addLocation(): void {
    this.packageLocations.push({ name: '', description: '', visitOrder: this.packageLocations.length, durationHere: '' });
  }

  removeLocation(index: number): void {
    this.packageLocations.splice(index, 1);
  }

  moveLocationUp(index: number): void {
    if (index === 0) return;
    [this.packageLocations[index - 1], this.packageLocations[index]] = [this.packageLocations[index], this.packageLocations[index - 1]];
  }

  moveLocationDown(index: number): void {
    if (index === this.packageLocations.length - 1) return;
    [this.packageLocations[index], this.packageLocations[index + 1]] = [this.packageLocations[index + 1], this.packageLocations[index]];
  }

  // ===== Pricing methods =====
  addPricing(): void {
    const defaultCurrency = this.currencies.length > 0 ? this.currencies[0].code : 'USD';
    this.pricings.push({
      currencyCode: defaultCurrency,
      amount: null,
      pricingType: 'PER_PERSON',
      groupSize: null,
      groupSizeMin: null,
      groupSizeMax: null,
      label: '',
      isPrimary: this.pricings.length === 0,
      displayOrder: this.pricings.length
    });
  }

  removePricing(index: number): void {
    this.pricings.splice(index, 1);
    if (this.pricings.length > 0 && !this.pricings.some(p => p.isPrimary)) {
      this.pricings[0].isPrimary = true;
    }
  }

  setPrimaryPricing(index: number): void {
    this.pricings.forEach((p, i) => { p.isPrimary = i === index; });
  }

  getCurrencySymbol(code: string): string {
    const c = this.currencies.find(m => m.code === code);
    return c?.icon || code;
  }

  openFieldConfigModal(): void {
    this.tempFieldDefinitions = this.fieldDefinitions.map(f => ({ ...f, options: f.options ? [...f.options] : [] }));
    this.showFieldConfigModal = true;
  }

  closeFieldConfigModal(): void {
    this.showFieldConfigModal = false;
  }

  saveFieldConfig(): void {
    this.apiService.upsertEntityFieldConfig('package', this.tempFieldDefinitions).subscribe({
      next: (config) => {
        this.fieldDefinitions = config.fieldDefinitions || [];
        this.showFieldConfigModal = false;
        this.successMessage = 'Field configuration saved successfully!';
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
    field.options = value.split(',').map(o => o.trim()).filter(o => o);
  }

  isOptionSelected(fieldKey: string, option: string): boolean {
    const val = this.additionalDetails[fieldKey];
    return Array.isArray(val) && val.includes(option);
  }

  toggleMultiSelectOption(fieldKey: string, option: string): void {
    if (!Array.isArray(this.additionalDetails[fieldKey])) {
      this.additionalDetails[fieldKey] = [];
    }
    const arr = this.additionalDetails[fieldKey];
    const idx = arr.indexOf(option);
    if (idx > -1) arr.splice(idx, 1);
    else arr.push(option);
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
}
