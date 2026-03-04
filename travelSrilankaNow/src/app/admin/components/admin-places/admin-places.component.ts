import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApiService, PageResponse } from '../../services/admin-api.service';
import { MasterDataService, MasterData } from '../../../services/master-data.service';

@Component({
  selector: 'app-admin-places',
  templateUrl: './admin-places.component.html',
  styleUrls: ['./admin-places.component.scss']
})
export class AdminPlacesComponent implements OnInit {
  Math = Math; // Expose Math to template

  places: any[] = [];
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  isLoading = false;
  showModal = false;
  isEditMode = false;
  showDeleteConfirm = false;
  deletePlaceId: number | null = null;
  placeForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  placeTypes: MasterData[] = [];
  regions: MasterData[] = [];
  priceRanges: MasterData[] = [];
  galleryImages: string[] = [];

  constructor(
    private apiService: AdminApiService,
    private fb: FormBuilder,
    private masterDataService: MasterDataService
  ) {
    this.placeForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', Validators.required],
      shortDescription: ['', Validators.required],
      imageUrl: ['', Validators.required],
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
      orderNumber: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadMasterData();
    this.loadPlaces();
  }

  loadMasterData(): void {
    this.masterDataService.getPlaceTypes().subscribe({
      next: (data) => {
        this.placeTypes = data;
      },
      error: (error) => {
        console.error('Failed to load place types:', error);
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

    this.masterDataService.getPriceRanges().subscribe({
      next: (data) => {
        this.priceRanges = data;
      },
      error: (error) => {
        console.error('Failed to load price ranges:', error);
      }
    });
  }

  loadPlaces(): void {
    this.isLoading = true;
    this.apiService.getPlaces(this.currentPage, this.pageSize).subscribe({
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

  openAddModal(): void {
    this.isEditMode = false;
    this.placeForm.reset({
      type: this.placeTypes.length > 0 ? this.placeTypes[0].code : '',
      region: this.regions.length > 0 ? this.regions[0].code : '',
      priceRange: this.priceRanges.length > 1 ? this.priceRanges[1].code : '',
      rating: 0,
      featured: false,
      orderNumber: 0
    });
    this.galleryImages = [];
    this.showModal = true;
  }

  openEditModal(place: any): void {
    this.isEditMode = true;
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
      images: this.galleryImages
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
        error: () => {
          this.errorMessage = 'Failed to update place';
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
          this.hideMessageAfterDelay();
        },
        error: () => {
          this.errorMessage = 'Failed to create place';
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
        this.showDeleteConfirm = false;
        this.deletePlaceId = null;
        this.loadPlaces();
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
