import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApiService, PageResponse } from '../../services/admin-api.service';
import { HeroSlide, SlideTextStyle } from '../../../models/hero-slide.model';

export interface FontOption  { label: string; value: string; preview: string; }
export interface ShadowPreset { label: string; value: string; }
export interface WeightOption { label: string; value: string; }
export interface SizeOption   { label: string; value: string; }
export interface SpacingOption{ label: string; value: string; }

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
      mediaType: ['image'],
      imageUrl: [''],
      videoUrl: [''],
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

  // ── Text Style Panel ────────────────────────────────────────────────────────
  titleStyleOpen    = false;
  subtitleStyleOpen = false;
  titleStyle:    SlideTextStyle = {};
  subtitleStyle: SlideTextStyle = {};
  contentAlign: 'left' | 'center' | 'right' = 'center';

  readonly fontOptions: FontOption[] = [
    { label: 'System UI',        value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", preview: 'System UI' },
    { label: 'Playfair Display', value: "'Playfair Display', Georgia, serif",         preview: 'Playfair Display' },
    { label: 'Montserrat',       value: "'Montserrat', Helvetica, sans-serif",         preview: 'Montserrat' },
    { label: 'Lato',             value: "'Lato', Arial, sans-serif",                  preview: 'Lato' },
    { label: 'Cinzel',           value: "'Cinzel', Georgia, serif",                   preview: 'Cinzel' },
    { label: 'Georgia',          value: "Georgia, 'Times New Roman', serif",          preview: 'Georgia' },
    { label: 'Tahoma',           value: 'Tahoma, Verdana, sans-serif',                preview: 'Tahoma' },
    { label: 'Courier',          value: "'Courier New', Courier, monospace",          preview: 'Courier New' },
  ];

  readonly sizeOptions: SizeOption[] = [
    { label: 'XS – 1.5rem', value: '1.5rem'  },
    { label: 'S  – 2rem',   value: '2rem'    },
    { label: 'M  – 2.5rem', value: '2.5rem'  },
    { label: 'L  – 3rem',   value: '3rem'    },
    { label: 'XL – 3.5rem', value: '3.5rem'  },
    { label: '2X – 4rem',   value: '4rem'    },
    { label: '3X – 5rem',   value: '5rem'    },
    { label: '4X – 6rem',   value: '6rem'    },
    { label: '5X – 7rem',   value: '7rem'    },
  ];

  readonly weightOptions: WeightOption[] = [
    { label: 'Light',  value: '300' },
    { label: 'Normal', value: '400' },
    { label: 'Medium', value: '500' },
    { label: 'Bold',   value: '700' },
    { label: 'Black',  value: '900' },
  ];

  readonly shadowPresets: ShadowPreset[] = [
    { label: 'None',     value: 'none' },
    { label: 'Soft',     value: '0 1px 6px rgba(0,0,0,0.4)' },
    { label: 'Dramatic', value: '0 2px 20px rgba(0,0,0,0.75), 0 4px 40px rgba(0,0,0,0.5)' },
    { label: 'Glow',     value: '0 0 20px rgba(255,255,255,0.4), 0 2px 10px rgba(0,0,0,0.5)' },
    { label: 'Hard',     value: '2px 2px 0 rgba(0,0,0,0.9), 4px 4px 0 rgba(0,0,0,0.4)' },
  ];

  readonly spacingOptions: SpacingOption[] = [
    { label: '−0.05',  value: '-0.05em' },
    { label: '−0.02',  value: '-0.02em' },
    { label: '0',      value: '0' },
    { label: '0.05',   value: '0.05em' },
    { label: '0.1',    value: '0.1em' },
    { label: '0.15',   value: '0.15em' },
    { label: '0.2',    value: '0.2em' },
    { label: '0.3',    value: '0.3em' },
  ];

  readonly colorPresets = ['#ffffff','#f8fafc','#fbbf24','#fb923c','#7dd3fc','#4ade80','#f9a8d4','#e2e8f0'];

  setStyle(target: 'title' | 'subtitle', key: keyof SlideTextStyle, value: string): void {
    if (target === 'title') {
      this.titleStyle = { ...this.titleStyle, [key]: value };
    } else {
      this.subtitleStyle = { ...this.subtitleStyle, [key]: value };
    }
  }

  getStyleProp(target: 'title' | 'subtitle', key: keyof SlideTextStyle): string {
    const s = target === 'title' ? this.titleStyle : this.subtitleStyle;
    return (s as any)[key] || '';
  }

  previewStyle(target: 'title' | 'subtitle'): { [k: string]: string } {
    const s = target === 'title' ? this.titleStyle : this.subtitleStyle;
    const css: { [k: string]: string } = {};
    if (s.fontFamily)     css['font-family']    = s.fontFamily;
    if (s.fontSize)       css['font-size']       = s.fontSize;
    if (s.fontWeight)     css['font-weight']     = s.fontWeight;
    if (s.color)          css['color']           = s.color;
    if (s.textShadow !== undefined) css['text-shadow'] = s.textShadow === 'none' ? 'none' : (s.textShadow || '');
    if (s.letterSpacing)  css['letter-spacing']  = s.letterSpacing;
    if (s.textTransform)  css['text-transform']  = s.textTransform;
    if (s.textAlign)      css['text-align']      = s.textAlign;
    return css;
  }
  // ──────────────────────────────────────────────────────────────────────────

  openAddModal(): void {
    this.isEditMode = false;
    this.isVideoUploading = false;
    this.titleStyle    = {};
    this.subtitleStyle = {};
    this.contentAlign  = 'center';
    this.titleStyleOpen    = false;
    this.subtitleStyleOpen = false;
    this.heroSlideForm.reset({
      mediaType: 'image',
      displayOrder: 0,
      active: true,
      displayDuration: 5000
    });
    this.showModal = true;
  }

  openEditModal(slide: HeroSlide): void {
    this.isEditMode = true;
    this.titleStyle    = slide.titleStyle    ? { ...slide.titleStyle }    : {};
    this.subtitleStyle = slide.subtitleStyle ? { ...slide.subtitleStyle } : {};
    this.contentAlign  = (slide.contentAlign as any) || 'center';
    this.titleStyleOpen    = false;
    this.subtitleStyleOpen = false;
    this.heroSlideForm.patchValue({ ...slide });
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
      ...formValue,
      titleStyle:    Object.keys(this.titleStyle).length    ? this.titleStyle    : undefined,
      subtitleStyle: Object.keys(this.subtitleStyle).length ? this.subtitleStyle : undefined,
      contentAlign:  this.contentAlign,
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

  isVideoUploading = false;
  videoUploadError = '';

  onVideoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    this.isVideoUploading = true;
    this.videoUploadError = '';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'travel-sri-lanka/videos');

    this.apiService.uploadVideo(formData).subscribe({
      next: (res: any) => {
        this.heroSlideForm.patchValue({ videoUrl: res.data.url });
        this.isVideoUploading = false;
      },
      error: (err: any) => {
        this.videoUploadError = err?.error?.message || 'Video upload failed';
        this.isVideoUploading = false;
      }
    });
  }

  get isVideoMode(): boolean {
    return this.heroSlideForm.get('mediaType')?.value === 'video';
  }

  formatDuration(ms: number): string {
    return `${ms / 1000}s`;
  }

  getStatusClass(active: boolean): string {
    return active ? 'admin-badge--success' : 'admin-badge--gray';
  }
}
