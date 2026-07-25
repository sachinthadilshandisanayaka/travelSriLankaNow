import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApiService, PageResponse } from '../../services/admin-api.service';
import { ContentStatsService } from '../../services/content-stats.service';
import { MasterDataService, MasterData } from '../../../services/master-data.service';

@Component({
  selector: 'app-admin-gallery',
  templateUrl: './admin-gallery.component.html',
  styleUrls: ['./admin-gallery.component.scss']
})
export class AdminGalleryComponent implements OnInit {
  Math = Math; // Expose Math to template

  galleryItems: any[] = [];
  currentPage = 0;
  pageSize = 12; // Show 12 items per page in grid layout
  totalPages = 0;
  totalElements = 0;

  isLoading = false;
  showCategoryPanel = false;
  showModal = false;
  isEditMode = false;
  slugManuallyEdited = false;
  showDeleteConfirm = false;
  deleteItemId: number | null = null;
  galleryForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  types: MasterData[] = [];
  categories: MasterData[] = [];

  constructor(
    private apiService: AdminApiService,
    private fb: FormBuilder,
    private masterDataService: MasterDataService,
    private contentStats: ContentStatsService
  ) {
    this.galleryForm = this.fb.group({
      id: [null],
      type: ['', Validators.required],
      url: [''],
      title: ['', Validators.required],
      slug: [''],
      description: [''],
      category: ['', Validators.required],
      location: [''],
      photographer: [''],
      tags: [''],
      featured: [false],
      displayOrder: [0, [Validators.min(0)]]
    });
  }

  nextDisplayOrder = 0;

  ngOnInit(): void {
    this.loadMasterData();
    this.loadGalleryItems();
    this.refreshNextDisplayOrder();
  }

  refreshNextDisplayOrder(): void {
    this.apiService.getGalleryItems(0, 1, 'displayOrder,desc').subscribe({
      next: (response: PageResponse<any>) => {
        const highest = response.content?.[0]?.displayOrder;
        this.nextDisplayOrder = (typeof highest === 'number' ? highest : -1) + 1;
      },
      error: () => {}
    });
  }

  loadMasterData(): void {
    this.masterDataService.getGalleryTypes().subscribe({
      next: (data) => {
        this.types = data;
      },
      error: (error) => {
        console.error('Failed to load gallery types:', error);
      }
    });

    this.masterDataService.getGalleryCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Failed to load gallery categories:', error);
      }
    });
  }

  loadGalleryItems(): void {
    this.isLoading = true;
    this.apiService.getGalleryItems(this.currentPage, this.pageSize).subscribe({
      next: (response: PageResponse<any>) => {
        this.galleryItems = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load gallery items';
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
      this.galleryForm.patchValue({ slug: this.generateSlug(value) }, { emitEvent: false });
    }
  }

  onSlugInput(value: string): void {
    this.slugManuallyEdited = true;
    this.galleryForm.patchValue({ slug: (value || '').toLowerCase().replace(/[^a-z0-9-]+/g, '').replace(/-{2,}/g, '-') }, { emitEvent: false });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.slugManuallyEdited = false;
    this.galleryForm.reset({
      type: this.types.length > 0 ? this.types[0].code : '',
      category: this.categories.length > 0 ? this.categories[0].code : '',
      featured: false,
      displayOrder: this.nextDisplayOrder
    });
    this.showModal = true;
  }

  openEditModal(item: any): void {
    this.isEditMode = true;
    this.slugManuallyEdited = true;
    this.galleryForm.patchValue({
      ...item,
      tags: item.tags ? item.tags.join(', ') : ''
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.galleryForm.reset();
  }

  saveGalleryItem(): void {
    if (this.galleryForm.invalid) {
      this.errorMessage = 'Please fill all required fields';
      this.hideMessageAfterDelay();
      return;
    }

    const formValue = this.galleryForm.value;
    const galleryData = {
      ...formValue,
      tags: formValue.tags ? formValue.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [],
      uploadDate: new Date().toISOString()
    };

    this.isLoading = true;

    if (this.isEditMode && formValue.id) {
      this.apiService.updateGalleryItem(formValue.id, galleryData).subscribe({
        next: () => {
          this.successMessage = 'Gallery item updated successfully!';
          this.closeModal();
          this.loadGalleryItems();
          this.hideMessageAfterDelay();
        },
        error: (err: any) => {
          this.errorMessage = err?.error?.message || 'Failed to update gallery item';
          this.isLoading = false;
          this.hideMessageAfterDelay();
        }
      });
    } else {
      this.apiService.createGalleryItem(galleryData).subscribe({
        next: () => {
          this.successMessage = 'Gallery item created successfully!';
          this.closeModal();
          this.loadGalleryItems();
          this.refreshNextDisplayOrder();
          this.contentStats.notify();
          this.hideMessageAfterDelay();
        },
        error: (err: any) => {
          this.errorMessage = err?.error?.message || 'Failed to create gallery item';
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

  deleteGalleryItem(): void {
    if (this.deleteItemId === null) return;

    this.isLoading = true;
    this.apiService.deleteGalleryItem(this.deleteItemId).subscribe({
      next: () => {
        this.successMessage = 'Gallery item deleted successfully!';
        this.contentStats.notify();
        this.showDeleteConfirm = false;
        this.deleteItemId = null;
        this.loadGalleryItems();
        this.refreshNextDisplayOrder();
        this.hideMessageAfterDelay();
      },
      error: () => {
        this.errorMessage = 'Failed to delete gallery item';
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

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadGalleryItems();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadGalleryItems();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadGalleryItems();
    }
  }

  hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  onMainImageUploaded(url: string): void {
    this.galleryForm.patchValue({ url });
  }


  getCategoryColor(category: string): string {
    const categoryData = this.categories.find(c => c.code === category);
    if (categoryData?.color) {
      return '';
    }
    const colors: { [key: string]: string } = {
      beach: 'admin-badge--blue',
      mountain: 'admin-badge--teal',
      cultural: 'admin-badge--purple',
      wildlife: 'admin-badge--warning',
      food: 'admin-badge--cyan',
      people: 'admin-badge--purple',
      architecture: 'admin-badge--gray'
    };
    return colors[category] || 'admin-badge--gray';
  }

  getTypeIcon(type: string): string {
    return type === 'video' ? 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' : 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z';
  }
}
