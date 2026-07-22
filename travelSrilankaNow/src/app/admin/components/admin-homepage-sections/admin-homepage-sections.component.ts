import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';
import { GallerySliderConfig, GallerySliderImage, CustomContentConfig, CustomerFeedbackConfig, FeedbackItem, ScrollCardsConfig, ScrollCardItem, MoreSectionBlockConfig } from '../../../models/homepage-section.model';
import { forkJoin } from 'rxjs';

interface HomepageSection {
  id?: number;
  sectionType: string;
  title: string;
  subtitle?: string;
  displayOrder: number;
  isActive: boolean;
  config?: string;
}

interface SectionConfig {
  autoPlay?: boolean;
  displayDuration?: number;
  itemsCount?: number;
  showViewAll?: boolean;
}

interface AvailableImage {
  url: string;
  title: string;
  sourceType: string;
  sourceId: number;
  selected?: boolean;
}

const CUSTOM_TEMPLATES = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean light background with centered text',
    preview: 'bg-light'
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Bold dark background with white text',
    preview: 'bg-dark'
  },
  {
    id: 'image-overlay',
    name: 'Image Overlay',
    description: 'Full background image with text overlay',
    preview: 'bg-image'
  },
  {
    id: 'split',
    name: 'Split Layout',
    description: 'Image on left, text on right',
    preview: 'bg-split'
  }
];

@Component({
  selector: 'app-admin-homepage-sections',
  templateUrl: './admin-homepage-sections.component.html',
  styleUrls: ['./admin-homepage-sections.component.scss']
})
export class AdminHomepageSectionsComponent implements OnInit {
  sections: HomepageSection[] = [];
  isLoading = false;
  isSaving = false;
  hasOrderChanged = false;

  successMessage = '';
  errorMessage = '';

  // Standard edit modal
  showEditModal = false;
  editForm: FormGroup;
  editingSection: HomepageSection | null = null;

  // Delete confirmation dialog
  showDeleteDialog = false;
  sectionToDelete: HomepageSection | null = null;

  // Gallery slider image picker modal
  showGalleryPickerModal = false;
  gallerySection: HomepageSection | null = null;
  availableImages: AvailableImage[] = [];
  selectedImages: GallerySliderImage[] = [];
  imageSearchTerm = '';
  isLoadingImages = false;
  gallerySpeed = 30;
  galleryPauseOnHover = true;
  galleryStyle = 'slider';
  galleryColumns = 3;
  galleryGap = 'normal';
  galleryShowTitles = false;

  readonly GALLERY_STYLES = [
    { id: 'slider',    name: 'Auto Slider', desc: 'Horizontal scrolling ribbon' },
    { id: 'masonry',   name: 'Masonry',     desc: 'Pinterest-style varying heights' },
    { id: 'bento',     name: 'Bento Grid',  desc: 'Featured focal image + tiles' },
    { id: 'grid-tilt', name: '3D Tilt Grid',desc: 'Cursor-responsive 3D effect' },
  ];

  // Custom content modal
  showCustomModal = false;
  editingCustomSection: HomepageSection | null = null;
  customConfig: CustomContentConfig = {};
  customTemplates = CUSTOM_TEMPLATES;
  customTitle = '';
  customSubtitle = '';
  customIsActive = true;

  readonly MIN_HEIGHT_OPTIONS = [
    { label: 'Auto (fit content)', value: '' },
    { label: 'Small — 250 px', value: '250px' },
    { label: 'Medium — 350 px', value: '350px' },
    { label: 'Large — 500 px', value: '500px' },
    { label: 'Extra Large — 650 px', value: '650px' },
    { label: '50% viewport height', value: '50vh' },
    { label: '60% viewport height', value: '60vh' },
    { label: '80% viewport height', value: '80vh' },
    { label: 'Full screen', value: '100vh' },
  ];

  readonly PADDING_OPTIONS = [
    { label: 'Normal (48 px)', value: '' },
    { label: 'Compact (24 px)', value: '24px 20px' },
    { label: 'Relaxed (80 px)', value: '80px 20px' },
    { label: 'Extra (120 px)', value: '120px 20px' },
  ];

  readonly BACKGROUND_EFFECT_OPTIONS = [
    { label: 'Cover (fill & crop)', value: 'cover' },
    { label: 'Parallax (fixed scroll)', value: 'parallax' },
    { label: 'Contain (fit inside)', value: 'contain' },
    { label: 'Tile (repeat)', value: 'tile' },
  ];

  readonly ANIMATION_OPTIONS = [
    { value: '',             label: 'None' },
    { value: 'fade-in',     label: 'Fade In' },
    { value: 'fade-up',     label: 'Fade Up' },
    { value: 'fade-down',   label: 'Fade Down' },
    { value: 'slide-left',  label: 'Slide Left' },
    { value: 'slide-right', label: 'Slide Right' },
    { value: 'zoom-in',     label: 'Zoom In' },
    { value: 'bounce-in',   label: 'Bounce In' },
  ];

  readonly TITLE_SIZE_OPTIONS = [
    { label: 'Small (1.25 rem)', value: '1.25rem' },
    { label: 'Medium (1.75 rem)', value: '1.75rem' },
    { label: 'Large (2.25 rem)', value: '2.25rem' },
    { label: 'Extra Large (3 rem)', value: '3rem' },
    { label: 'Huge (4 rem)', value: '4rem' },
  ];

  sectionTypeLabels: Record<string, string> = {
    HERO_SLIDER: 'Hero Slider',
    FEATURED_LOCATIONS: 'Featured Locations',
    UPCOMING_EVENTS: 'Upcoming Events',
    PLACES: 'Where to Stay',
    SOCIAL_MEDIA: 'Social Media',
    IMAGE_GALLERY_SLIDER: 'Image Gallery Slider',
    CUSTOM_CONTENT: 'Custom Content Section',
    PACKAGES: 'Tour Packages',
    CUSTOMER_FEEDBACK: 'Customer Feedback',
    SCROLL_CARDS: 'Scroll Cards',
    MORE_SECTION: 'Featured More Section'
  };

  sectionTypeIcons: Record<string, string> = {
    HERO_SLIDER: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    FEATURED_LOCATIONS: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    UPCOMING_EVENTS: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    PLACES: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    SOCIAL_MEDIA: 'M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4',
    IMAGE_GALLERY_SLIDER: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    CUSTOM_CONTENT: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
    PACKAGES: 'M20 7h-3V6a4 4 0 00-4-4h-2a4 4 0 00-4 4v1H4a1 1 0 00-1 1v11a2 2 0 002 2h14a2 2 0 002-2V8a1 1 0 00-1-1zM9 6a2 2 0 012-2h2a2 2 0 012 2v1H9V6zm11 13a.5.5 0 01-.5.5h-15a.5.5 0 01-.5-.5V9h4v2a1 1 0 002 0V9h2v2a1 1 0 002 0V9h4v10z',
    CUSTOMER_FEEDBACK: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    SCROLL_CARDS: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    MORE_SECTION: 'M19 11H5m14-4H5m14 8H5m14 4H5'
  };

  // Gallery creation modal
  showGalleryCreateModal = false;
  galleryCreateTitle = '';
  galleryCreateSubtitle = '';
  galleryCreating = false;

  // Additional Content picker
  showAdditionalContentPicker = false;

  readonly ADDITIONAL_CONTENT_TYPES = [
    {
      type: 'CUSTOMER_FEEDBACK',
      name: 'Customer Feedback',
      description: 'Horizontal testimonial carousel with star ratings, reviewer name, role, and photo.',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
    },
    {
      type: 'SCROLL_CARDS',
      name: 'Scroll Cards',
      description: 'Stacked cards that fan out as the user scrolls — ideal for process steps, features, or highlights.',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
    },
    {
      type: 'MORE_SECTION',
      name: 'Feature a More Section',
      description: 'Showcase items from an existing More Section (e.g. Articles) as a card grid, with a "View All" link.',
      icon: 'M19 11H5m14-4H5m14 8H5m14 4H5'
    }
  ];

  // More Section feature block modal
  showMoreSectionModal = false;
  editingMoreSection: HomepageSection | null = null;
  moreSectionsList: any[] = [];
  isLoadingMoreSections = false;
  moreSectionConfig: MoreSectionBlockConfig = { moreSectionSlug: '', itemCount: 6, displayStyle: 'grid' };
  moreSectionTitle = '';
  moreSectionSubtitle = '';
  moreSectionIsActive = true;

  // Customer Feedback modal
  showFeedbackModal = false;
  editingFeedbackSection: HomepageSection | null = null;
  feedbackConfig: CustomerFeedbackConfig = { feedbacks: [] };
  feedbackSectionTitle = '';
  feedbackSectionSubtitle = '';
  feedbackSectionActive = true;
  showFeedbackItemForm = false;
  editingFeedbackItem: FeedbackItem | null = null;
  feedbackItemForm: FeedbackItem = { id: '', name: '', rating: 5, text: '' };
  feedbackCreating = false;

  // Scroll Cards modal
  showScrollCardsModal = false;
  editingScrollCardsSection: HomepageSection | null = null;
  scrollCardsConfig: ScrollCardsConfig = { cards: [] };
  scrollCardsSectionTitle = '';
  scrollCardsSectionSubtitle = '';
  scrollCardsSectionActive = true;
  showScrollCardItemForm = false;
  editingScrollCardItem: ScrollCardItem | null = null;
  scrollCardItemForm: ScrollCardItem = { id: '', title: '', description: '' };
  scrollCardsCreating = false;

  // Drag and Drop
  draggedIndex: number | null = null;
  dragOverIndex = -1;

  constructor(
    private apiService: AdminApiService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      subtitle: [''],
      isActive: [true],
      itemsCount: [6, [Validators.min(1), Validators.max(20)]],
      showViewAll: [true]
    });
  }

  ngOnInit(): void {
    this.loadSections();
  }

  loadSections(): void {
    this.isLoading = true;
    this.apiService.getHomepageSections().subscribe({
      next: (sections: HomepageSection[]) => {
        this.sections = sections;
        this.isLoading = false;
        this.hasOrderChanged = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load homepage sections';
        this.isLoading = false;
        this.hideMessageAfterDelay();
      }
    });
  }

  getSectionLabel(sectionType: string): string {
    return this.sectionTypeLabels[sectionType] || sectionType;
  }

  getSectionIcon(sectionType: string): string {
    return this.sectionTypeIcons[sectionType] || '';
  }

  parseConfig(configStr?: string): SectionConfig {
    if (!configStr) return {};
    try { return JSON.parse(configStr); } catch { return {}; }
  }

  parseGalleryConfig(configStr?: string): GallerySliderConfig {
    if (!configStr) return { images: [], speed: 30, pauseOnHover: true };
    try { return JSON.parse(configStr); } catch { return { images: [], speed: 30, pauseOnHover: true }; }
  }

  parseCustomConfig(configStr?: string): CustomContentConfig {
    if (!configStr) return { template: 'minimal' };
    try { return JSON.parse(configStr); } catch { return { template: 'minimal' }; }
  }

  isDeletable(section: HomepageSection): boolean {
    return ['CUSTOM_CONTENT', 'IMAGE_GALLERY_SLIDER', 'CUSTOMER_FEEDBACK', 'SCROLL_CARDS', 'MORE_SECTION'].includes(section.sectionType);
  }

  // ---- Gallery Section Creation ----
  openGalleryCreateModal(): void {
    this.galleryCreateTitle = 'Photo Gallery';
    this.galleryCreateSubtitle = '';
    this.showGalleryCreateModal = true;
  }

  closeGalleryCreateModal(): void {
    this.showGalleryCreateModal = false;
    this.galleryCreateTitle = '';
    this.galleryCreateSubtitle = '';
  }

  createGallerySection(): void {
    if (!this.galleryCreateTitle.trim()) return;
    this.galleryCreating = true;

    const maxOrder = this.sections.length
      ? Math.max(...this.sections.map(s => s.displayOrder || 0)) + 1
      : 1;

    const newSection: HomepageSection = {
      sectionType: 'IMAGE_GALLERY_SLIDER',
      title: this.galleryCreateTitle.trim(),
      subtitle: this.galleryCreateSubtitle.trim() || undefined,
      displayOrder: maxOrder,
      isActive: true
    };

    this.apiService.createHomepageSection(newSection).subscribe({
      next: (created: HomepageSection) => {
        this.galleryCreating = false;
        this.closeGalleryCreateModal();
        this.loadSections();
        this.successMessage = 'Photo Gallery section created!';
        this.hideMessageAfterDelay();
        // Auto-open the gallery picker so user can immediately configure images
        setTimeout(() => this.openGalleryPickerModal(created), 400);
      },
      error: () => {
        this.galleryCreating = false;
        this.errorMessage = 'Failed to create gallery section';
        this.hideMessageAfterDelay();
      }
    });
  }

  // ---- Additional Content Picker ----
  openAdditionalContentPicker(): void {
    this.showAdditionalContentPicker = true;
  }

  closeAdditionalContentPicker(): void {
    this.showAdditionalContentPicker = false;
  }

  selectAdditionalContentType(type: string): void {
    this.closeAdditionalContentPicker();
    if (type === 'CUSTOMER_FEEDBACK') {
      this.openFeedbackModal();
    } else if (type === 'SCROLL_CARDS') {
      this.openScrollCardsModal();
    } else if (type === 'MORE_SECTION') {
      this.openMoreSectionModal();
    }
  }

  // ---- Feature a More Section ----
  parseMoreSectionConfig(configStr?: string): MoreSectionBlockConfig {
    if (!configStr) return { moreSectionSlug: '', itemCount: 6, displayStyle: 'grid' };
    try { return JSON.parse(configStr); } catch { return { moreSectionSlug: '', itemCount: 6, displayStyle: 'grid' }; }
  }

  openMoreSectionModal(section?: HomepageSection): void {
    this.editingMoreSection = section || null;
    if (section) {
      this.moreSectionConfig = { ...this.parseMoreSectionConfig(section.config) };
      this.moreSectionTitle = section.title;
      this.moreSectionSubtitle = section.subtitle || '';
      this.moreSectionIsActive = section.isActive;
    } else {
      this.moreSectionConfig = { moreSectionSlug: '', itemCount: 6, displayStyle: 'grid' };
      this.moreSectionTitle = '';
      this.moreSectionSubtitle = '';
      this.moreSectionIsActive = true;
    }
    this.showMoreSectionModal = true;
    this.loadMoreSectionsList();
  }

  closeMoreSectionModal(): void {
    this.showMoreSectionModal = false;
    this.editingMoreSection = null;
  }

  loadMoreSectionsList(): void {
    this.isLoadingMoreSections = true;
    this.apiService.getMoreSections(0, 100).subscribe({
      next: (response) => {
        this.moreSectionsList = response.content;
        this.isLoadingMoreSections = false;
      },
      error: () => {
        this.isLoadingMoreSections = false;
        this.errorMessage = 'Failed to load More Sections';
        this.hideMessageAfterDelay();
      }
    });
  }

  onMoreSectionPicked(): void {
    const picked = this.moreSectionsList.find(s => s.slug === this.moreSectionConfig.moreSectionSlug);
    if (picked && !this.editingMoreSection) {
      this.moreSectionTitle = picked.name;
      this.moreSectionSubtitle = picked.description || '';
    }
  }

  saveMoreSectionSection(): void {
    if (!this.moreSectionConfig.moreSectionSlug || !this.moreSectionTitle.trim()) return;
    this.isSaving = true;
    const configStr = JSON.stringify(this.moreSectionConfig);
    const maxOrder = this.sections.length ? Math.max(...this.sections.map(s => s.displayOrder || 0)) + 1 : 1;

    if (this.editingMoreSection?.id) {
      const updateData: HomepageSection = {
        ...this.editingMoreSection,
        title: this.moreSectionTitle,
        subtitle: this.moreSectionSubtitle,
        isActive: this.moreSectionIsActive,
        config: configStr
      };
      this.apiService.updateHomepageSection(this.editingMoreSection.id, updateData).subscribe({
        next: () => { this.successMessage = 'Section updated!'; this.closeMoreSectionModal(); this.loadSections(); this.isSaving = false; this.hideMessageAfterDelay(); },
        error: () => { this.errorMessage = 'Failed to update'; this.isSaving = false; this.hideMessageAfterDelay(); }
      });
    } else {
      const newSection: any = {
        sectionType: 'MORE_SECTION',
        title: this.moreSectionTitle,
        subtitle: this.moreSectionSubtitle,
        isActive: this.moreSectionIsActive,
        displayOrder: maxOrder,
        config: configStr
      };
      this.apiService.createHomepageSection(newSection).subscribe({
        next: () => { this.successMessage = 'Section created!'; this.closeMoreSectionModal(); this.loadSections(); this.isSaving = false; this.hideMessageAfterDelay(); },
        error: () => { this.errorMessage = 'Failed to create'; this.isSaving = false; this.hideMessageAfterDelay(); }
      });
    }
  }

  // ---- Customer Feedback ----
  parseFeedbackConfig(configStr?: string): CustomerFeedbackConfig {
    if (!configStr) return { feedbacks: [] };
    try { return JSON.parse(configStr); } catch { return { feedbacks: [] }; }
  }

  openFeedbackModal(section?: HomepageSection): void {
    this.editingFeedbackSection = section || null;
    if (section) {
      this.feedbackConfig = { ...this.parseFeedbackConfig(section.config) };
      this.feedbackSectionTitle = section.title;
      this.feedbackSectionSubtitle = section.subtitle || '';
      this.feedbackSectionActive = section.isActive;
    } else {
      this.feedbackConfig = { displayStyle: 'carousel', cardStyle: 'light', autoScroll: false, feedbacks: [] };
      this.feedbackSectionTitle = 'Customer Feedback';
      this.feedbackSectionSubtitle = 'What our clients are saying';
      this.feedbackSectionActive = true;
    }
    this.showFeedbackItemForm = false;
    this.showFeedbackModal = true;
  }

  closeFeedbackModal(): void {
    this.showFeedbackModal = false;
    this.editingFeedbackSection = null;
    this.showFeedbackItemForm = false;
  }

  openAddFeedbackItem(): void {
    this.editingFeedbackItem = null;
    this.feedbackItemForm = { id: this.generateId(), name: '', role: '', company: '', rating: 5, text: '', imageUrl: '' };
    this.showFeedbackItemForm = true;
  }

  editFeedbackItem(item: FeedbackItem): void {
    this.editingFeedbackItem = item;
    this.feedbackItemForm = { ...item };
    this.showFeedbackItemForm = true;
  }

  saveFeedbackItem(): void {
    if (!this.feedbackItemForm.name.trim() || !this.feedbackItemForm.text.trim()) return;
    const items = [...(this.feedbackConfig.feedbacks || [])];
    if (this.editingFeedbackItem) {
      const idx = items.findIndex(i => i.id === this.editingFeedbackItem!.id);
      if (idx !== -1) items[idx] = { ...this.feedbackItemForm };
    } else {
      items.push({ ...this.feedbackItemForm });
    }
    this.feedbackConfig = { ...this.feedbackConfig, feedbacks: items };
    this.showFeedbackItemForm = false;
  }

  deleteFeedbackItem(id: string): void {
    this.feedbackConfig = { ...this.feedbackConfig, feedbacks: this.feedbackConfig.feedbacks.filter(i => i.id !== id) };
  }

  onFeedbackImageUploaded(url: string): void {
    this.feedbackItemForm = { ...this.feedbackItemForm, imageUrl: url };
  }

  saveFeedbackSection(): void {
    this.isSaving = true;
    const configStr = JSON.stringify(this.feedbackConfig);
    const maxOrder = this.sections.length ? Math.max(...this.sections.map(s => s.displayOrder || 0)) + 1 : 1;

    if (this.editingFeedbackSection?.id) {
      const updateData: HomepageSection = {
        ...this.editingFeedbackSection,
        title: this.feedbackSectionTitle,
        subtitle: this.feedbackSectionSubtitle,
        isActive: this.feedbackSectionActive,
        config: configStr
      };
      this.apiService.updateHomepageSection(this.editingFeedbackSection.id, updateData).subscribe({
        next: () => { this.successMessage = 'Feedback section updated!'; this.closeFeedbackModal(); this.loadSections(); this.isSaving = false; this.hideMessageAfterDelay(); },
        error: () => { this.errorMessage = 'Failed to update'; this.isSaving = false; this.hideMessageAfterDelay(); }
      });
    } else {
      const newSection: any = {
        sectionType: 'CUSTOMER_FEEDBACK',
        title: this.feedbackSectionTitle,
        subtitle: this.feedbackSectionSubtitle,
        isActive: this.feedbackSectionActive,
        displayOrder: maxOrder,
        config: configStr
      };
      this.apiService.createHomepageSection(newSection).subscribe({
        next: () => { this.successMessage = 'Feedback section created!'; this.closeFeedbackModal(); this.loadSections(); this.isSaving = false; this.hideMessageAfterDelay(); },
        error: () => { this.errorMessage = 'Failed to create'; this.isSaving = false; this.hideMessageAfterDelay(); }
      });
    }
  }

  // ---- Scroll Cards ----
  parseScrollCardsConfig(configStr?: string): ScrollCardsConfig {
    if (!configStr) return { cards: [] };
    try { return JSON.parse(configStr); } catch { return { cards: [] }; }
  }

  openScrollCardsModal(section?: HomepageSection): void {
    this.editingScrollCardsSection = section || null;
    if (section) {
      this.scrollCardsConfig = { ...this.parseScrollCardsConfig(section.config) };
      this.scrollCardsSectionTitle = section.title;
      this.scrollCardsSectionSubtitle = section.subtitle || '';
      this.scrollCardsSectionActive = section.isActive;
    } else {
      this.scrollCardsConfig = { label: '', title: '', subtitle: '', ctaText: '', ctaUrl: '', layoutStyle: 'split', cards: [] };
      this.scrollCardsSectionTitle = 'Scroll Cards';
      this.scrollCardsSectionSubtitle = '';
      this.scrollCardsSectionActive = true;
    }
    this.showScrollCardItemForm = false;
    this.showScrollCardsModal = true;
  }

  closeScrollCardsModal(): void {
    this.showScrollCardsModal = false;
    this.editingScrollCardsSection = null;
    this.showScrollCardItemForm = false;
  }

  openAddScrollCardItem(): void {
    this.editingScrollCardItem = null;
    const num = ((this.scrollCardsConfig.cards?.length || 0) + 1).toString().padStart(2, '0');
    this.scrollCardItemForm = { id: this.generateId(), number: num, icon: '', title: '', description: '', backgroundColor: '' };
    this.showScrollCardItemForm = true;
  }

  editScrollCardItem(item: ScrollCardItem): void {
    this.editingScrollCardItem = item;
    this.scrollCardItemForm = { ...item };
    this.showScrollCardItemForm = true;
  }

  saveScrollCardItem(): void {
    if (!this.scrollCardItemForm.title.trim() || !this.scrollCardItemForm.description.trim()) return;
    const items = [...(this.scrollCardsConfig.cards || [])];
    if (this.editingScrollCardItem) {
      const idx = items.findIndex(i => i.id === this.editingScrollCardItem!.id);
      if (idx !== -1) items[idx] = { ...this.scrollCardItemForm };
    } else {
      items.push({ ...this.scrollCardItemForm });
    }
    this.scrollCardsConfig = { ...this.scrollCardsConfig, cards: items };
    this.showScrollCardItemForm = false;
  }

  deleteScrollCardItem(id: string): void {
    this.scrollCardsConfig = { ...this.scrollCardsConfig, cards: this.scrollCardsConfig.cards.filter(i => i.id !== id) };
  }

  saveScrollCardsSection(): void {
    this.isSaving = true;
    const configStr = JSON.stringify(this.scrollCardsConfig);
    const maxOrder = this.sections.length ? Math.max(...this.sections.map(s => s.displayOrder || 0)) + 1 : 1;

    if (this.editingScrollCardsSection?.id) {
      const updateData: HomepageSection = {
        ...this.editingScrollCardsSection,
        title: this.scrollCardsSectionTitle,
        subtitle: this.scrollCardsSectionSubtitle,
        isActive: this.scrollCardsSectionActive,
        config: configStr
      };
      this.apiService.updateHomepageSection(this.editingScrollCardsSection.id, updateData).subscribe({
        next: () => { this.successMessage = 'Scroll cards section updated!'; this.closeScrollCardsModal(); this.loadSections(); this.isSaving = false; this.hideMessageAfterDelay(); },
        error: () => { this.errorMessage = 'Failed to update'; this.isSaving = false; this.hideMessageAfterDelay(); }
      });
    } else {
      const newSection: any = {
        sectionType: 'SCROLL_CARDS',
        title: this.scrollCardsSectionTitle,
        subtitle: this.scrollCardsSectionSubtitle,
        isActive: this.scrollCardsSectionActive,
        displayOrder: maxOrder,
        config: configStr
      };
      this.apiService.createHomepageSection(newSection).subscribe({
        next: () => { this.successMessage = 'Scroll cards section created!'; this.closeScrollCardsModal(); this.loadSections(); this.isSaving = false; this.hideMessageAfterDelay(); },
        error: () => { this.errorMessage = 'Failed to create'; this.isSaving = false; this.hideMessageAfterDelay(); }
      });
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  getStarArray(rating: number): number[] {
    return [1, 2, 3, 4, 5];
  }

  // ---- Standard Edit Modal ----
  openEditModal(section: HomepageSection): void {
    if (section.sectionType === 'IMAGE_GALLERY_SLIDER') {
      this.openGalleryPickerModal(section);
      return;
    }
    if (section.sectionType === 'CUSTOM_CONTENT') {
      this.openCustomModal(section);
      return;
    }
    if (section.sectionType === 'CUSTOMER_FEEDBACK') {
      this.openFeedbackModal(section);
      return;
    }
    if (section.sectionType === 'SCROLL_CARDS') {
      this.openScrollCardsModal(section);
      return;
    }
    if (section.sectionType === 'MORE_SECTION') {
      this.openMoreSectionModal(section);
      return;
    }

    this.editingSection = section;
    const config = this.parseConfig(section.config);
    this.editForm.patchValue({
      id: section.id,
      title: section.title,
      subtitle: section.subtitle || '',
      isActive: section.isActive,
      itemsCount: config.itemsCount || 6,
      showViewAll: config.showViewAll !== undefined ? config.showViewAll : true
    });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingSection = null;
  }

  saveSection(): void {
    if (this.editForm.invalid || !this.editingSection) return;
    const formValue = this.editForm.value;
    const existingConfig = this.parseConfig(this.editingSection.config);
    const updatedConfig = { ...existingConfig, itemsCount: formValue.itemsCount, showViewAll: formValue.showViewAll };
    const updateData: HomepageSection = {
      ...this.editingSection,
      title: formValue.title,
      subtitle: formValue.subtitle,
      isActive: formValue.isActive,
      config: JSON.stringify(updatedConfig)
    };
    this.isSaving = true;
    this.apiService.updateHomepageSection(this.editingSection.id!, updateData).subscribe({
      next: () => {
        this.successMessage = 'Section updated!';
        this.closeEditModal();
        this.loadSections();
        this.isSaving = false;
        this.hideMessageAfterDelay();
      },
      error: () => {
        this.errorMessage = 'Failed to update section';
        this.isSaving = false;
        this.hideMessageAfterDelay();
      }
    });
  }

  // ---- Gallery Slider Image Picker ----
  openGalleryPickerModal(section: HomepageSection): void {
    this.gallerySection = section;
    const config = this.parseGalleryConfig(section.config);
    this.selectedImages    = [...(config.images || [])];
    this.gallerySpeed      = config.speed || 30;
    this.galleryPauseOnHover = config.pauseOnHover !== false;
    this.galleryStyle      = (config as any).galleryStyle  || 'slider';
    this.galleryColumns    = (config as any).columns       || 3;
    this.galleryGap        = (config as any).gap           || 'normal';
    this.galleryShowTitles = (config as any).showTitles    || false;
    this.imageSearchTerm   = '';
    this.showGalleryPickerModal = true;
    this.loadAvailableImages();
  }

  closeGalleryPickerModal(): void {
    this.showGalleryPickerModal = false;
    this.gallerySection = null;
    this.availableImages = [];
  }

  loadAvailableImages(): void {
    this.isLoadingImages = true;
    forkJoin({
      locations: this.apiService.getLocations(0, 500),
      events:    this.apiService.getEvents(0, 500),
      places:    this.apiService.getPlaces(0, 500),
      gallery:   this.apiService.getGalleryItems(0, 500)
    }).subscribe({
      next: ({ locations, events, places, gallery }) => {
        const imgs: AvailableImage[] = [];
        (locations?.content || []).forEach((l: any) => {
          if (l.imageUrl) imgs.push({ url: l.imageUrl, title: l.name, sourceType: 'location', sourceId: l.id });
          (l.images || []).forEach((img: string) => imgs.push({ url: img, title: l.name, sourceType: 'location', sourceId: l.id }));
        });
        (events?.content || []).forEach((e: any) => {
          if (e.imageUrl) imgs.push({ url: e.imageUrl, title: e.title || e.name, sourceType: 'event', sourceId: e.id });
          (e.images || []).forEach((img: string) => imgs.push({ url: img, title: e.title || e.name, sourceType: 'event', sourceId: e.id }));
        });
        (places?.content || []).forEach((p: any) => {
          if (p.imageUrl) imgs.push({ url: p.imageUrl, title: p.name, sourceType: 'place', sourceId: p.id });
          (p.images || []).forEach((img: string) => imgs.push({ url: img, title: p.name, sourceType: 'place', sourceId: p.id }));
        });
        // Gallery items use `url` (not `imageUrl`) — this was the primary bug
        (gallery?.content || []).forEach((g: any) => {
          const imageUrl = g.url || g.imageUrl;
          if (imageUrl) imgs.push({ url: imageUrl, title: g.title || 'Gallery', sourceType: 'gallery', sourceId: g.id });
        });

        // De-duplicate by URL
        const seen = new Set<string>();
        this.availableImages = imgs.filter(img => {
          if (seen.has(img.url)) return false;
          seen.add(img.url);
          return true;
        }).map(img => ({
          ...img,
          selected: this.selectedImages.some(s => s.url === img.url)
        }));
        this.isLoadingImages = false;
      },
      error: () => {
        this.isLoadingImages = false;
        this.errorMessage = 'Failed to load images';
        this.hideMessageAfterDelay();
      }
    });
  }

  get filteredImages(): AvailableImage[] {
    if (!this.imageSearchTerm.trim()) return this.availableImages;
    const term = this.imageSearchTerm.toLowerCase();
    return this.availableImages.filter(i =>
      i.title.toLowerCase().includes(term) || i.sourceType.toLowerCase().includes(term)
    );
  }

  toggleImageSelection(image: AvailableImage): void {
    image.selected = !image.selected;
    if (image.selected) {
      this.selectedImages.push({ url: image.url, title: image.title, sourceType: image.sourceType, sourceId: image.sourceId });
    } else {
      this.selectedImages = this.selectedImages.filter(s => s.url !== image.url);
    }
  }

  removeSelectedImage(index: number): void {
    const removed = this.selectedImages[index];
    this.selectedImages.splice(index, 1);
    const avail = this.availableImages.find(i => i.url === removed.url);
    if (avail) avail.selected = false;
  }

  saveGalleryConfig(): void {
    if (!this.gallerySection) return;
    const config: GallerySliderConfig = {
      images:        this.selectedImages,
      speed:         this.gallerySpeed,
      pauseOnHover:  this.galleryPauseOnHover,
      galleryStyle:  this.galleryStyle as any,
      columns:       this.galleryColumns as any,
      gap:           this.galleryGap as any,
      showTitles:    this.galleryShowTitles,
    };
    const updateData: HomepageSection = { ...this.gallerySection, config: JSON.stringify(config) };
    this.isSaving = true;
    this.apiService.updateHomepageSection(this.gallerySection.id!, updateData).subscribe({
      next: () => {
        this.successMessage = 'Gallery slider updated!';
        this.closeGalleryPickerModal();
        this.loadSections();
        this.isSaving = false;
        this.hideMessageAfterDelay();
      },
      error: () => {
        this.errorMessage = 'Failed to save gallery config';
        this.isSaving = false;
        this.hideMessageAfterDelay();
      }
    });
  }

  // ---- Custom Content Sections ----
  openCustomModal(section?: HomepageSection): void {
    this.editingCustomSection = section || null;
    if (section) {
      const config = this.parseCustomConfig(section.config);
      this.customConfig = { ...config };
      this.customTitle = section.title;
      this.customSubtitle = section.subtitle || '';
      this.customIsActive = section.isActive;
    } else {
      this.customConfig = {
        template: 'minimal',
        backgroundColor: '#f8fafc',
        title: '',
        titleColor: '#1e293b',
        titleAlign: 'center',
        description: '',
        descriptionColor: '#64748b',
        descriptionAlign: 'center'
      };
      this.customTitle = 'Custom Section';
      this.customSubtitle = '';
      this.customIsActive = true;
    }
    this.showCustomModal = true;
  }

  closeCustomModal(): void {
    this.showCustomModal = false;
    this.editingCustomSection = null;
  }

  selectTemplate(templateId: string): void {
    const defaults: Record<string, Partial<CustomContentConfig>> = {
      minimal: {
        backgroundColor: '#f8fafc',
        titleColor: '#1e293b', titleAlign: 'center',
        descriptionColor: '#64748b', descriptionAlign: 'center'
      },
      dark: {
        backgroundColor: '#1a3a5c',
        titleColor: '#ffffff', titleAlign: 'center',
        descriptionColor: 'rgba(255,255,255,0.8)', descriptionAlign: 'center'
      },
      'image-overlay': {
        titleColor: '#ffffff', titleAlign: 'center',
        descriptionColor: 'rgba(255,255,255,0.85)', descriptionAlign: 'center',
        overlayColor: '#000000', overlayOpacity: 0.45,
        backgroundEffect: 'cover'
      },
      split: {
        backgroundColor: '#ffffff',
        titleColor: '#1e293b', titleAlign: 'left',
        descriptionColor: '#64748b', descriptionAlign: 'left',
        splitImagePosition: 'left'
      }
    };
    this.customConfig = { ...this.customConfig, template: templateId as any, ...defaults[templateId] };
  }

  onBgImageUploaded(url: string): void {
    this.customConfig = { ...this.customConfig, backgroundImage: url };
  }

  clearBgImage(): void {
    this.customConfig = { ...this.customConfig, backgroundImage: '' };
  }

  onSplitImageUploaded(url: string): void {
    this.customConfig = { ...this.customConfig, splitImage: url };
  }

  clearSplitImage(): void {
    this.customConfig = { ...this.customConfig, splitImage: '' };
  }

  setSplitImagePosition(pos: 'left' | 'right'): void {
    this.customConfig = { ...this.customConfig, splitImagePosition: pos };
  }

  getOverlayStyle(): { [key: string]: string } {
    if (!this.customConfig.backgroundImage) return {};
    const color = this.customConfig.overlayColor || '#000000';
    const opacity = this.customConfig.overlayOpacity ?? 0;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { background: `rgba(${r},${g},${b},${opacity})` };
  }

  getOverlayOpacityPct(): number {
    return Math.round((this.customConfig.overlayOpacity || 0) * 100);
  }

  hasOverlay(): boolean {
    return !!(this.customConfig.backgroundImage && (this.customConfig.overlayOpacity || 0) > 0);
  }

  getPreviewBgStyle(): { [key: string]: string } {
    const style: { [key: string]: string } = {};
    if (this.customConfig.backgroundColor) style['backgroundColor'] = this.customConfig.backgroundColor;
    if (this.customConfig.backgroundImage) {
      style['backgroundImage'] = `url(${this.customConfig.backgroundImage})`;
      style['backgroundSize'] = this.customConfig.backgroundEffect === 'contain' ? 'contain' :
                                 this.customConfig.backgroundEffect === 'tile' ? 'auto' : 'cover';
      style['backgroundRepeat'] = this.customConfig.backgroundEffect === 'tile' ? 'repeat' : 'no-repeat';
      style['backgroundPosition'] = this.customConfig.backgroundEffect === 'parallax' ? 'center center' : 'center';
    }
    // Section Height — show in preview
    if (this.customConfig.minHeight) style['minHeight'] = this.customConfig.minHeight;
    if (this.customConfig.padding)   style['padding']   = this.customConfig.padding;
    // Vertical alignment — show in preview
    if (this.customConfig.verticalAlign) {
      style['display'] = 'flex';
      style['flexDirection'] = 'column';
      const vMap: Record<string, string> = { top: 'flex-start', center: 'center', bottom: 'flex-end' };
      style['justifyContent'] = vMap[this.customConfig.verticalAlign] || 'flex-start';
    }
    return style;
  }

  /** Preview inner content alignment (mirrors landing getCustomInnerStyle) */
  getPreviewInnerStyle(): { [k: string]: string } {
    const align = this.customConfig.titleAlign || 'left';
    return { 'textAlign': align };
  }

  saveCustomSection(): void {
    const configStr = JSON.stringify(this.customConfig);
    this.isSaving = true;

    if (this.editingCustomSection?.id) {
      const updateData: HomepageSection = {
        ...this.editingCustomSection,
        title: this.customTitle,
        subtitle: this.customSubtitle,
        isActive: this.customIsActive,
        config: configStr
      };
      this.apiService.updateHomepageSection(this.editingCustomSection.id, updateData).subscribe({
        next: () => {
          this.successMessage = 'Custom section updated!';
          this.closeCustomModal();
          this.loadSections();
          this.isSaving = false;
          this.hideMessageAfterDelay();
        },
        error: () => { this.errorMessage = 'Failed to update'; this.isSaving = false; this.hideMessageAfterDelay(); }
      });
    } else {
      const newSection: any = {
        sectionType: 'CUSTOM_CONTENT',
        title: this.customTitle,
        subtitle: this.customSubtitle,
        isActive: this.customIsActive,
        displayOrder: 99,
        config: configStr
      };
      this.apiService.createHomepageSection(newSection).subscribe({
        next: () => {
          this.successMessage = 'Custom section created!';
          this.closeCustomModal();
          this.loadSections();
          this.isSaving = false;
          this.hideMessageAfterDelay();
        },
        error: () => { this.errorMessage = 'Failed to create'; this.isSaving = false; this.hideMessageAfterDelay(); }
      });
    }
  }

  deleteSection(section: HomepageSection): void {
    this.sectionToDelete = section;
    this.showDeleteDialog = true;
  }

  confirmDeleteSection(): void {
    if (!this.sectionToDelete?.id) return;
    const section = this.sectionToDelete;
    this.showDeleteDialog = false;
    this.sectionToDelete = null;
    this.apiService.deleteHomepageSection(section.id!).subscribe({
      next: () => {
        this.successMessage = 'Section deleted!';
        this.loadSections();
        this.hideMessageAfterDelay();
      },
      error: () => { this.errorMessage = 'Failed to delete'; this.hideMessageAfterDelay(); }
    });
  }

  // ---- Toggle / Reorder ----
  toggleActive(section: HomepageSection): void {
    if (!section.id) return;
    this.apiService.toggleHomepageSectionActive(section.id).subscribe({
      next: (updated) => {
        const idx = this.sections.findIndex(s => s.id === section.id);
        if (idx !== -1) this.sections[idx] = updated;
        this.successMessage = `Section ${updated.isActive ? 'activated' : 'deactivated'}!`;
        this.hideMessageAfterDelay();
      },
      error: () => { this.errorMessage = 'Failed to toggle'; this.hideMessageAfterDelay(); }
    });
  }

  moveUp(index: number): void {
    if (index > 0) { [this.sections[index], this.sections[index - 1]] = [this.sections[index - 1], this.sections[index]]; this.hasOrderChanged = true; }
  }

  moveDown(index: number): void {
    if (index < this.sections.length - 1) { [this.sections[index], this.sections[index + 1]] = [this.sections[index + 1], this.sections[index]]; this.hasOrderChanged = true; }
  }

  saveOrder(): void {
    const sectionIds = this.sections.map(s => s.id!);
    this.isSaving = true;
    this.apiService.reorderHomepageSections(sectionIds).subscribe({
      next: () => {
        this.successMessage = 'Order saved!';
        this.isSaving = false;
        this.hasOrderChanged = false;
        this.loadSections();
        this.hideMessageAfterDelay();
      },
      error: () => { this.errorMessage = 'Failed to save order'; this.isSaving = false; this.hideMessageAfterDelay(); }
    });
  }

  onDragStart(event: DragEvent, index: number): void {
    this.draggedIndex = index;
    if (event.dataTransfer) { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', index.toString()); }
  }

  onDragOver(event: DragEvent, index: number): void { event.preventDefault(); this.dragOverIndex = index; }
  onDragLeave(): void { this.dragOverIndex = -1; }
  onDragEnd(): void { this.draggedIndex = null; this.dragOverIndex = -1; }

  onDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    this.dragOverIndex = -1;
    if (this.draggedIndex === null || this.draggedIndex === targetIndex) return;
    const [removed] = this.sections.splice(this.draggedIndex, 1);
    this.sections.splice(targetIndex, 0, removed);
    this.hasOrderChanged = true;
    this.draggedIndex = null;
  }

  hideMessageAfterDelay(): void {
    setTimeout(() => { this.successMessage = ''; this.errorMessage = ''; }, 3000);
  }
}
