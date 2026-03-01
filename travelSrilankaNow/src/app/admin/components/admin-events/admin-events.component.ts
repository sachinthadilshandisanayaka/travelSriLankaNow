import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApiService, PageResponse } from '../../services/admin-api.service';
import { MasterDataService, MasterData } from '../../../services/master-data.service';

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
      imageUrl: ['', Validators.required],
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
      maxParticipants: 0,
      availableSpots: 0,
      rating: 0,
      featured: false,
      orderNumber: 0
    });
    this.showModal = true;
  }

  openEditModal(event: any): void {
    this.isEditMode = true;
    this.eventForm.patchValue({
      ...event,
      included: event.included ? event.included.join(', ') : '',
      requirements: event.requirements ? event.requirements.join(', ') : ''
    });
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
      requirements: formValue.requirements ? formValue.requirements.split(',').map((r: string) => r.trim()).filter((r: string) => r) : []
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

  onImageUploaded(imageUrl: string): void {
    this.eventForm.patchValue({ imageUrl });
  }
}
