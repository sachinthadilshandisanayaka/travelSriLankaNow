import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApiService, PageResponse } from '../../services/admin-api.service';
import { MasterDataService, MasterData } from '../../../services/master-data.service';

@Component({
  selector: 'app-admin-locations',
  templateUrl: './admin-locations.component.html',
  styleUrls: ['./admin-locations.component.scss']
})
export class AdminLocationsComponent implements OnInit {
  Math = Math; // Expose Math to template

  locations: any[] = [];
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  isLoading = false;
  showModal = false;
  isEditMode = false;
  showDeleteConfirm = false;
  deleteLocationId: number | null = null;
  locationForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  categories: MasterData[] = [];
  regions: MasterData[] = [];

  constructor(
    private apiService: AdminApiService,
    private fb: FormBuilder,
    private masterDataService: MasterDataService
  ) {
    this.locationForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      description: ['', Validators.required],
      shortDescription: ['', Validators.required],
      imageUrl: ['', Validators.required],
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
  }

  loadMasterData(): void {
    this.masterDataService.getLocationCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
      }
    });

    this.masterDataService.getRegions().subscribe({
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
    this.apiService.getLocations(this.currentPage, this.pageSize).subscribe({
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

  openAddModal(): void {
    this.isEditMode = false;
    this.locationForm.reset({
      category: this.categories.length > 0 ? this.categories[0].code : '',
      region: this.regions.length > 0 ? this.regions[0].code : '',
      rating: 0,
      featured: false,
      orderNumber: 0
    });
    this.showModal = true;
  }

  openEditModal(location: any): void {
    this.isEditMode = true;
    this.locationForm.patchValue({
      ...location,
      activities: location.activities ? location.activities.join(', ') : '',
      highlights: location.highlights ? location.highlights.join(', ') : ''
    });
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
      highlights: formValue.highlights ? formValue.highlights.split(',').map((h: string) => h.trim()).filter((h: string) => h) : []
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
        error: () => {
          this.errorMessage = 'Failed to update location';
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
          this.hideMessageAfterDelay();
        },
        error: () => {
          this.errorMessage = 'Failed to create location';
          this.isLoading = false;
          this.hideMessageAfterDelay();
        }
      });
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

  hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  onImageUploaded(imageUrl: string): void {
    this.locationForm.patchValue({ imageUrl });
  }
}
