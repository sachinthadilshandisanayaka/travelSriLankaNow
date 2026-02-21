import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApiService, PageResponse } from '../../services/admin-api.service';

interface HeroSlide {
  id?: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  displayOrder: number;
  active: boolean;
  displayDuration: number;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-admin-hero-slides',
  templateUrl: './admin-hero-slides.component.html',
  styleUrls: ['./admin-hero-slides.component.scss']
})
export class AdminHeroSlidesComponent implements OnInit {
  Math = Math;

  heroSlides: HeroSlide[] = [];
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  isLoading = false;
  showModal = false;
  isEditMode = false;
  showDeleteConfirm = false;
  deleteItemId: number | null = null;
  heroSlideForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  // Duration presets in seconds
  durationPresets = [
    { label: '3 seconds', value: 3000 },
    { label: '5 seconds', value: 5000 },
    { label: '7 seconds', value: 7000 },
    { label: '10 seconds', value: 10000 },
    { label: '15 seconds', value: 15000 }
  ];

  constructor(
    private apiService: AdminApiService,
    private fb: FormBuilder
  ) {
    this.heroSlideForm = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      subtitle: [''],
      imageUrl: ['', Validators.required],
      buttonText: [''],
      buttonLink: [''],
      displayOrder: [0],
      active: [true],
      displayDuration: [5000, [Validators.required, Validators.min(1000)]]
    });
  }

  ngOnInit(): void {
    this.loadHeroSlides();
  }

  loadHeroSlides(): void {
    this.isLoading = true;
    this.apiService.getHeroSlides(this.currentPage, this.pageSize).subscribe({
      next: (response: PageResponse<HeroSlide>) => {
        this.heroSlides = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load hero slides';
        this.isLoading = false;
        this.hideMessageAfterDelay();
      }
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.heroSlideForm.reset({
      displayOrder: 0,
      active: true,
      displayDuration: 5000
    });
    this.showModal = true;
  }

  openEditModal(slide: HeroSlide): void {
    this.isEditMode = true;
    this.heroSlideForm.patchValue({
      ...slide
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.heroSlideForm.reset();
  }

  saveHeroSlide(): void {
    if (this.heroSlideForm.invalid) {
      this.errorMessage = 'Please fill all required fields';
      this.hideMessageAfterDelay();
      return;
    }

    const formValue = this.heroSlideForm.value;
    const slideData: HeroSlide = {
      ...formValue
    };

    this.isLoading = true;

    if (this.isEditMode && formValue.id) {
      this.apiService.updateHeroSlide(formValue.id, slideData).subscribe({
        next: () => {
          this.successMessage = 'Hero slide updated successfully!';
          this.closeModal();
          this.loadHeroSlides();
          this.hideMessageAfterDelay();
        },
        error: () => {
          this.errorMessage = 'Failed to update hero slide';
          this.isLoading = false;
          this.hideMessageAfterDelay();
        }
      });
    } else {
      this.apiService.createHeroSlide(slideData).subscribe({
        next: () => {
          this.successMessage = 'Hero slide created successfully!';
          this.closeModal();
          this.loadHeroSlides();
          this.hideMessageAfterDelay();
        },
        error: () => {
          this.errorMessage = 'Failed to create hero slide';
          this.isLoading = false;
          this.hideMessageAfterDelay();
        }
      });
    }
  }

  confirmDelete(id: number): void {
    this.deleteItemId = id;
    this.showDeleteConfirm = true;
  }

  deleteHeroSlide(): void {
    if (this.deleteItemId === null) return;

    this.isLoading = true;
    this.apiService.deleteHeroSlide(this.deleteItemId).subscribe({
      next: () => {
        this.successMessage = 'Hero slide deleted successfully!';
        this.showDeleteConfirm = false;
        this.deleteItemId = null;
        this.loadHeroSlides();
        this.hideMessageAfterDelay();
      },
      error: () => {
        this.errorMessage = 'Failed to delete hero slide';
        this.isLoading = false;
        this.showDeleteConfirm = false;
        this.hideMessageAfterDelay();
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteItemId = null;
  }

  toggleActive(slide: HeroSlide): void {
    if (!slide.id) return;

    this.apiService.toggleHeroSlideActive(slide.id).subscribe({
      next: (updatedSlide) => {
        const index = this.heroSlides.findIndex(s => s.id === slide.id);
        if (index !== -1) {
          this.heroSlides[index] = updatedSlide;
        }
        this.successMessage = `Slide ${updatedSlide.active ? 'activated' : 'deactivated'} successfully!`;
        this.hideMessageAfterDelay();
      },
      error: () => {
        this.errorMessage = 'Failed to toggle slide status';
        this.hideMessageAfterDelay();
      }
    });
  }

  moveUp(slide: HeroSlide): void {
    const index = this.heroSlides.findIndex(s => s.id === slide.id);
    if (index > 0 && slide.id) {
      const newOrder = this.heroSlides[index - 1].displayOrder;
      this.updateOrder(slide.id, newOrder);
    }
  }

  moveDown(slide: HeroSlide): void {
    const index = this.heroSlides.findIndex(s => s.id === slide.id);
    if (index < this.heroSlides.length - 1 && slide.id) {
      const newOrder = this.heroSlides[index + 1].displayOrder;
      this.updateOrder(slide.id, newOrder);
    }
  }

  updateOrder(id: number, newOrder: number): void {
    this.apiService.updateHeroSlideOrder(id, newOrder).subscribe({
      next: () => {
        this.loadHeroSlides();
        this.successMessage = 'Display order updated!';
        this.hideMessageAfterDelay();
      },
      error: () => {
        this.errorMessage = 'Failed to update display order';
        this.hideMessageAfterDelay();
      }
    });
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadHeroSlides();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadHeroSlides();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadHeroSlides();
    }
  }

  hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  onImageUploaded(url: string): void {
    this.heroSlideForm.patchValue({ imageUrl: url });
  }

  formatDuration(ms: number): string {
    return `${ms / 1000}s`;
  }

  getStatusClass(active: boolean): string {
    return active ? 'admin-badge--success' : 'admin-badge--gray';
  }
}
