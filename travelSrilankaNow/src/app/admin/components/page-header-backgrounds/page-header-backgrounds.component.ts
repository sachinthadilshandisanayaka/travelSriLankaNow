import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';
import { PageHeaderBackground, PageType } from '../../../models/page-header-background.model';
import { MediaType } from '../../models/media.model';
import { UploadResult } from '../advanced-image-upload/advanced-image-upload.component';

@Component({
  selector: 'app-page-header-backgrounds',
  templateUrl: './page-header-backgrounds.component.html',
  styleUrls: ['./page-header-backgrounds.component.scss']
})
export class PageHeaderBackgroundsComponent implements OnInit {
  pageTypes: PageType[] = ['LOCATIONS', 'EVENTS', 'GALLERY', 'PLACES'];
  selectedPageType: PageType = 'LOCATIONS';
  backgrounds: PageHeaderBackground[] = [];
  activeBackground: PageHeaderBackground | null = null;

  isLoading = false;
  showModal = false;
  isEditMode = false;
  showDeleteConfirm = false;
  deleteItemId: number | null = null;
  backgroundForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  // Default overlay settings
  defaultOverlayColor = 'rgba(28, 77, 141, 0.7)';
  defaultOverlayOpacity = 0.7;

  // Media type for advanced upload component
  pageHeaderMediaType = MediaType.PAGE_HEADER;

  constructor(
    private apiService: AdminApiService,
    private fb: FormBuilder
  ) {
    this.backgroundForm = this.fb.group({
      id: [null],
      pageType: [this.selectedPageType, Validators.required],
      imageUrl: [''],
      subtitle: [''],
      title: [''],
      description: [''],
      overlayColor: [this.defaultOverlayColor],
      overlayOpacity: [this.defaultOverlayOpacity, [Validators.min(0), Validators.max(1)]],
      isActive: [false],
      displayOrder: [0]
    });
  }

  ngOnInit(): void {
    this.loadBackgrounds();
  }

  selectPageType(pageType: PageType): void {
    this.selectedPageType = pageType;
    this.loadBackgrounds();
  }

  loadBackgrounds(): void {
    this.isLoading = true;
    this.apiService.getPageHeaderBackgroundsByType(this.selectedPageType).subscribe({
      next: (backgrounds: PageHeaderBackground[]) => {
        this.backgrounds = backgrounds;
        this.activeBackground = backgrounds.find(bg => bg.isActive) || null;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load page header backgrounds';
        this.isLoading = false;
        this.hideMessageAfterDelay();
      }
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.backgroundForm.reset({
      pageType: this.selectedPageType,
      overlayColor: this.defaultOverlayColor,
      overlayOpacity: this.defaultOverlayOpacity,
      isActive: false,
      displayOrder: 0
    });
    this.showModal = true;
  }

  openEditModal(background: PageHeaderBackground): void {
    this.isEditMode = true;
    // Ensure all fields are properly mapped
    this.backgroundForm.patchValue({
      id: background.id,
      pageType: background.pageType,
      imageUrl: background.imageUrl || '',
      subtitle: (background as any).subtitle || '',
      title: background.title || '',
      description: (background as any).description || '',
      overlayColor: background.overlayColor || this.defaultOverlayColor,
      overlayOpacity: background.overlayOpacity ?? this.defaultOverlayOpacity,
      isActive: background.isActive,
      displayOrder: background.displayOrder || 0
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.backgroundForm.reset();
  }

  saveBackground(): void {
    if (this.backgroundForm.invalid) {
      // Show specific error messages based on which field is invalid
      const pageType = this.backgroundForm.get('pageType');

      if (pageType?.invalid) {
        this.errorMessage = 'Please select a page type';
      } else {
        this.errorMessage = 'Please check all required fields';
      }

      // Mark all fields as touched to show validation errors
      this.backgroundForm.markAllAsTouched();
      this.hideMessageAfterDelay();
      return;
    }

    const formValue = this.backgroundForm.value;
    const backgroundData: PageHeaderBackground = {
      ...formValue
    };

    this.isLoading = true;

    if (this.isEditMode && formValue.id) {
      this.apiService.updatePageHeaderBackground(formValue.id, backgroundData).subscribe({
        next: () => {
          this.successMessage = 'Background updated successfully!';
          this.closeModal();
          this.loadBackgrounds();
          this.hideMessageAfterDelay();
        },
        error: () => {
          this.errorMessage = 'Failed to update background';
          this.isLoading = false;
          this.hideMessageAfterDelay();
        }
      });
    } else {
      this.apiService.createPageHeaderBackground(backgroundData).subscribe({
        next: () => {
          this.successMessage = 'Background created successfully!';
          this.closeModal();
          this.loadBackgrounds();
          this.hideMessageAfterDelay();
        },
        error: () => {
          this.errorMessage = 'Failed to create background';
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

  deleteBackground(): void {
    if (this.deleteItemId === null) return;

    this.isLoading = true;
    this.apiService.deletePageHeaderBackground(this.deleteItemId).subscribe({
      next: () => {
        this.successMessage = 'Background deleted successfully!';
        this.showDeleteConfirm = false;
        this.deleteItemId = null;
        this.loadBackgrounds();
        this.hideMessageAfterDelay();
      },
      error: () => {
        this.errorMessage = 'Failed to delete background';
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

  activateBackground(background: PageHeaderBackground): void {
    if (!background.id) return;

    this.isLoading = true;
    this.apiService.activatePageHeaderBackground(background.id).subscribe({
      next: () => {
        this.successMessage = 'Background activated successfully!';
        this.loadBackgrounds();
        this.hideMessageAfterDelay();
      },
      error: () => {
        this.errorMessage = 'Failed to activate background';
        this.isLoading = false;
        this.hideMessageAfterDelay();
      }
    });
  }

  deactivateBackground(background: PageHeaderBackground): void {
    if (!background.id) return;

    this.isLoading = true;
    this.apiService.deactivatePageHeaderBackground(background.id).subscribe({
      next: () => {
        this.successMessage = 'Background deactivated. Page will use default gradient.';
        this.loadBackgrounds();
        this.hideMessageAfterDelay();
      },
      error: () => {
        this.errorMessage = 'Failed to deactivate background';
        this.isLoading = false;
        this.hideMessageAfterDelay();
      }
    });
  }

  hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  onImageUploaded(url: string): void {
    this.backgroundForm.patchValue({ imageUrl: url });
  }

  // New method for advanced upload component
  onAdvancedImageUploaded(result: UploadResult): void {
    this.backgroundForm.patchValue({ imageUrl: result.url });
  }

  onUploadError(error: string): void {
    this.errorMessage = error;
    this.hideMessageAfterDelay();
  }

  onImageRemoved(): void {
    this.backgroundForm.patchValue({ imageUrl: '' });
    this.backgroundForm.get('imageUrl')?.markAsTouched();
  }

  getPageTypeLabel(pageType: PageType): string {
    return pageType.charAt(0) + pageType.slice(1).toLowerCase();
  }

  updateOverlayColor(): void {
    // Rebuild overlayColor with the new opacity from the slider so the stored value stays in sync
    const opacity = this.backgroundForm.get('overlayOpacity')?.value ?? this.defaultOverlayOpacity;
    const current = this.backgroundForm.get('overlayColor')?.value || this.defaultOverlayColor;
    const updated = this.applyOpacityToColor(current, opacity);
    this.backgroundForm.patchValue({ overlayColor: updated }, { emitEvent: false });
  }

  /** Returns the overlay style for the live preview, applying the current opacity slider value. */
  getPreviewOverlayStyle(): { [key: string]: string } {
    const color   = this.backgroundForm.get('overlayColor')?.value  || this.defaultOverlayColor;
    const opacity = this.backgroundForm.get('overlayOpacity')?.value ?? this.defaultOverlayOpacity;
    return { 'background-color': this.applyOpacityToColor(color, opacity) };
  }

  getActiveOverlayStyle(): { [key: string]: string } {
    if (!this.activeBackground) return {};
    const color   = this.activeBackground.overlayColor   || this.defaultOverlayColor;
    const opacity = this.activeBackground.overlayOpacity ?? this.defaultOverlayOpacity;
    return { 'background-color': this.applyOpacityToColor(color, opacity) };
  }

  /** Extract R,G,B from an rgba/rgb string and return a new rgba with the given opacity. */
  private applyOpacityToColor(colorStr: string, opacity: number): string {
    const m = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    return m ? `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${opacity})` : colorStr;
  }
}
