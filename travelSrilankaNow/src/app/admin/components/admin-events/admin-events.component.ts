import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApiService, PageResponse, EntityFieldConfig } from '../../services/admin-api.service';
import { MasterDataService, MasterData } from '../../../services/master-data.service';
import { FieldDefinition } from '../../../models/more-section.model';

@Component({
  selector: 'app-admin-events',
  templateUrl: './admin-events.component.html',
  styleUrls: ['./admin-events.component.scss']
})
export class AdminEventsComponent implements OnInit {
  Math = Math; // Expose Math to template

  events: any[] = [];
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  isLoading = false;
  showModal = false;
  isEditMode = false;
  showDeleteConfirm = false;
  deleteEventId: number | null = null;
  eventForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  categories: MasterData[] = [];
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
    private masterDataService: MasterDataService
  ) {
    this.eventForm = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      description: ['', Validators.required],
      shortDescription: ['', Validators.required],
      imageUrl: [''],
      category: ['cultural', Validators.required],
      location: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
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
    this.loadEvents();
    this.loadFieldConfig();
  }

  loadFieldConfig(): void {
    this.apiService.getEntityFieldConfig('event').subscribe({
      next: (config) => { this.fieldDefinitions = config.fieldDefinitions || []; },
      error: () => {}
    });
  }

  loadCategories(): void {
    this.masterDataService.getEventCategories().subscribe({
      next: (data) => {
        this.categories = data;
        if (data.length > 0 && !this.eventForm.get('category')?.value) {
          this.eventForm.patchValue({ category: data[0].code });
        }
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
      }
    });
  }

  loadEvents(): void {
    this.isLoading = true;
    this.apiService.getEvents(this.currentPage, this.pageSize).subscribe({
      next: (response: PageResponse<any>) => {
        this.events = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load events';
        this.isLoading = false;
        this.hideMessageAfterDelay();
      }
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.eventForm.reset({
      category: this.categories.length > 0 ? this.categories[0].code : '',
      price: 0,
      maxParticipants: 1,
      availableSpots: 0,
      rating: 0,
      featured: false,
      orderNumber: 0
    });
    this.galleryImages = [];
    this.additionalDetails = this.initAdditionalDetails();
    this.showModal = true;
  }

  openEditModal(event: any): void {
    this.isEditMode = true;
    this.eventForm.patchValue({
      ...event,
      included: event.included ? event.included.join(', ') : '',
      requirements: event.requirements ? event.requirements.join(', ') : ''
    });
    this.galleryImages = event.images || [];
    this.additionalDetails = event.additionalDetails ? { ...event.additionalDetails } : this.initAdditionalDetails();
    // Ensure all field definitions have entries
    for (const field of this.fieldDefinitions) {
      if (this.additionalDetails[field.key] === undefined) {
        if (field.type === 'date_range') this.additionalDetails[field.key] = { from: '', to: '' };
        else if (field.type === 'number_range') this.additionalDetails[field.key] = { min: null, max: null };
        else if (field.type === 'multi_select') this.additionalDetails[field.key] = [];
        else this.additionalDetails[field.key] = null;
      }
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.eventForm.reset();
  }

  saveEvent(): void {
    if (this.eventForm.invalid) {
      this.errorMessage = 'Please fill all required fields';
      this.hideMessageAfterDelay();
      return;
    }

    const formValue = this.eventForm.value;
    const eventData = {
      ...formValue,
      included: formValue.included ? formValue.included.split(',').map((i: string) => i.trim()).filter((i: string) => i) : [],
      requirements: formValue.requirements ? formValue.requirements.split(',').map((r: string) => r.trim()).filter((r: string) => r) : [],
      images: this.galleryImages,
      additionalDetails: this.additionalDetails
    };

    this.isLoading = true;

    if (this.isEditMode && formValue.id) {
      this.apiService.updateEvent(formValue.id, eventData).subscribe({
        next: () => {
          this.successMessage = 'Event updated successfully!';
          this.closeModal();
          this.loadEvents();
          this.hideMessageAfterDelay();
        },
        error: () => {
          this.errorMessage = 'Failed to update event';
          this.isLoading = false;
          this.hideMessageAfterDelay();
        }
      });
    } else {
      this.apiService.createEvent(eventData).subscribe({
        next: () => {
          this.successMessage = 'Event created successfully!';
          this.closeModal();
          this.loadEvents();
          this.hideMessageAfterDelay();
        },
        error: () => {
          this.errorMessage = 'Failed to create event';
          this.isLoading = false;
          this.hideMessageAfterDelay();
        }
      });
    }
  }

  confirmDelete(id: number): void {
    this.deleteEventId = id;
    this.showDeleteConfirm = true;
  }

  deleteEvent(): void {
    if (this.deleteEventId === null) return;

    this.isLoading = true;
    this.apiService.deleteEvent(this.deleteEventId).subscribe({
      next: () => {
        this.successMessage = 'Event deleted successfully!';
        this.showDeleteConfirm = false;
        this.deleteEventId = null;
        this.loadEvents();
        this.hideMessageAfterDelay();
      },
      error: () => {
        this.errorMessage = 'Failed to delete event';
        this.isLoading = false;
        this.showDeleteConfirm = false;
        this.hideMessageAfterDelay();
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteEventId = null;
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadEvents();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadEvents();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadEvents();
    }
  }

  hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  onPrimaryImageChanged(imageUrl: string): void {
    this.eventForm.patchValue({ imageUrl });
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
    this.apiService.upsertEntityFieldConfig('event', this.tempFieldDefinitions).subscribe({
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
}
