import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApiService, PageResponse } from '../../services/admin-api.service';

interface SocialMediaContent {
  id?: number;
  platform: string;
  url: string;
  thumbnailUrl: string;
  title?: string;
  description?: string;
  displayOrder: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-admin-social-media',
  templateUrl: './admin-social-media.component.html',
  styleUrls: ['./admin-social-media.component.scss']
})
export class AdminSocialMediaComponent implements OnInit {
  Math = Math;

  socialMediaItems: SocialMediaContent[] = [];
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  isLoading = false;
  showModal = false;
  isEditMode = false;
  showDeleteConfirm = false;
  deleteItemId: number | null = null;
  socialMediaForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  platforms = [
    { value: 'INSTAGRAM', label: 'Instagram' },
    { value: 'FACEBOOK', label: 'Facebook' },
    { value: 'TWITTER', label: 'Twitter / X' },
    { value: 'YOUTUBE', label: 'YouTube' },
    { value: 'TIKTOK', label: 'TikTok' }
  ];

  constructor(
    private apiService: AdminApiService,
    private fb: FormBuilder
  ) {
    this.socialMediaForm = this.fb.group({
      id: [null],
      platform: ['INSTAGRAM', Validators.required],
      url: ['', [Validators.required]],
      thumbnailUrl: [''],
      title: [''],
      description: [''],
      displayOrder: [0],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.loadSocialMediaContent();
  }

  loadSocialMediaContent(): void {
    this.isLoading = true;
    this.apiService.getSocialMediaContent(this.currentPage, this.pageSize).subscribe({
      next: (response: PageResponse<SocialMediaContent>) => {
        this.socialMediaItems = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load social media content';
        this.isLoading = false;
        this.hideMessageAfterDelay();
      }
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.socialMediaForm.reset({
      platform: 'INSTAGRAM',
      displayOrder: 0,
      active: true
    });
    this.showModal = true;
  }

  openEditModal(item: SocialMediaContent): void {
    this.isEditMode = true;
    this.socialMediaForm.patchValue({ ...item });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.socialMediaForm.reset();
  }

  saveSocialMediaContent(): void {
    if (this.socialMediaForm.invalid) {
      this.errorMessage = 'Please fill all required fields';
      this.hideMessageAfterDelay();
      return;
    }

    const formValue = this.socialMediaForm.value;
    this.isLoading = true;

    if (this.isEditMode && formValue.id) {
      this.apiService.updateSocialMediaContent(formValue.id, formValue).subscribe({
        next: () => {
          this.successMessage = 'Social media content updated successfully!';
          this.closeModal();
          this.loadSocialMediaContent();
          this.hideMessageAfterDelay();
        },
        error: () => {
          this.errorMessage = 'Failed to update social media content';
          this.isLoading = false;
          this.hideMessageAfterDelay();
        }
      });
    } else {
      this.apiService.createSocialMediaContent(formValue).subscribe({
        next: () => {
          this.successMessage = 'Social media content created successfully!';
          this.closeModal();
          this.loadSocialMediaContent();
          this.hideMessageAfterDelay();
        },
        error: () => {
          this.errorMessage = 'Failed to create social media content';
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

  deleteSocialMediaContent(): void {
    if (this.deleteItemId === null) return;

    this.isLoading = true;
    this.apiService.deleteSocialMediaContent(this.deleteItemId).subscribe({
      next: () => {
        this.successMessage = 'Social media content deleted successfully!';
        this.showDeleteConfirm = false;
        this.deleteItemId = null;
        this.loadSocialMediaContent();
        this.hideMessageAfterDelay();
      },
      error: () => {
        this.errorMessage = 'Failed to delete social media content';
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

  toggleActive(item: SocialMediaContent): void {
    if (!item.id) return;

    this.apiService.toggleSocialMediaContentActive(item.id).subscribe({
      next: (updated) => {
        const index = this.socialMediaItems.findIndex(s => s.id === item.id);
        if (index !== -1) {
          this.socialMediaItems[index] = updated;
        }
        this.successMessage = `Item ${updated.active ? 'activated' : 'deactivated'} successfully!`;
        this.hideMessageAfterDelay();
      },
      error: () => {
        this.errorMessage = 'Failed to toggle status';
        this.hideMessageAfterDelay();
      }
    });
  }

  moveUp(item: SocialMediaContent): void {
    const index = this.socialMediaItems.findIndex(s => s.id === item.id);
    if (index > 0 && item.id) {
      const newOrder = this.socialMediaItems[index - 1].displayOrder;
      this.updateOrder(item.id, newOrder);
    }
  }

  moveDown(item: SocialMediaContent): void {
    const index = this.socialMediaItems.findIndex(s => s.id === item.id);
    if (index < this.socialMediaItems.length - 1 && item.id) {
      const newOrder = this.socialMediaItems[index + 1].displayOrder;
      this.updateOrder(item.id, newOrder);
    }
  }

  updateOrder(id: number, newOrder: number): void {
    this.apiService.updateSocialMediaContentOrder(id, newOrder).subscribe({
      next: () => {
        this.loadSocialMediaContent();
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
    this.loadSocialMediaContent();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadSocialMediaContent();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadSocialMediaContent();
    }
  }

  hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  onImageUploaded(url: string): void {
    this.socialMediaForm.patchValue({ thumbnailUrl: url });
  }

  getPlatformLabel(platform: string): string {
    const found = this.platforms.find(p => p.value === platform);
    return found ? found.label : platform;
  }

  getPlatformClass(platform: string): string {
    return `platform-badge--${platform.toLowerCase()}`;
  }

  getStatusClass(active: boolean): string {
    return active ? 'admin-badge--success' : 'admin-badge--gray';
  }
}
