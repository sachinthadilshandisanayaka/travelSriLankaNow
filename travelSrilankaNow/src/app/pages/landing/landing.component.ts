import { Component, OnInit, OnDestroy, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { LocationService } from '../../services/location.service';
import { EventService } from '../../services/event.service';
import { PlaceService } from '../../services/place.service';
import { HeroSlideService } from '../../services/hero-slide.service';
import { HomepageSectionService } from '../../services/homepage-section.service';
import { SocialMediaContentService } from '../../services/social-media-content.service';
import { Location } from '../../models/location.model';
import { Event as EventModel } from '../../models/event.model';
import { Place } from '../../models/place.model';
import { HeroSlide } from '../../models/hero-slide.model';
import { HomepageSection, HomepageSectionConfig, GallerySliderConfig, CustomContentConfig } from '../../models/homepage-section.model';
import { SocialMediaContent } from '../../models/social-media-content.model';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy {
  // Hero Slider
  heroSlides: HeroSlide[] = [];
  currentSlideIndex = 0;
  slideInterval: any = null;
  isTransitioning = false;
  slidesLoaded = false;

  // Data
  featuredLocations: Location[] = [];
  featuredEvents: EventModel[] = [];
  featuredPlaces: Place[] = [];
  socialMediaContent: SocialMediaContent[] = [];

  // Dynamic Sections
  homepageSections: HomepageSection[] = [];
  sectionConfigs: Map<string, HomepageSectionConfig> = new Map();
  gallerySectionConfig: Map<number, GallerySliderConfig> = new Map();
  customSectionConfigs: Map<number, CustomContentConfig> = new Map();
  sectionsLoaded = false;
  useFallbackLayout = false;

  // Loading overlay
  showLoadingOverlay = true;
  loadingFadeOut = false;
  private minDisplayTimeMet = false;
  private dataReady = false;
  private readonly MIN_DISPLAY_TIME = 2500;

  constructor(
    private locationService: LocationService,
    private eventService: EventService,
    private placeService: PlaceService,
    private heroSlideService: HeroSlideService,
    private homepageSectionService: HomepageSectionService,
    private socialMediaContentService: SocialMediaContentService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.renderer.addClass(this.document.body, 'loading-active');

    setTimeout(() => {
      this.minDisplayTimeMet = true;
      this.checkDismissOverlay();
    }, this.MIN_DISPLAY_TIME);

    this.loadHomepageSections();
  }

  ngOnDestroy(): void {
    this.stopSlideTimer();
    this.renderer.removeClass(this.document.body, 'loading-active');
  }

  private checkDismissOverlay(): void {
    if (this.minDisplayTimeMet && this.dataReady) {
      this.loadingFadeOut = true;
      setTimeout(() => {
        this.showLoadingOverlay = false;
        this.renderer.removeClass(this.document.body, 'loading-active');
      }, 600);
    }
  }

  private loadHomepageSections(): void {
    this.homepageSectionService.getActiveSections().subscribe({
      next: (sections) => {
        this.homepageSections = sections;
        this.sectionsLoaded = true;
        this.dataReady = true;
        this.checkDismissOverlay();

        // Parse configs
        sections.forEach(section => {
          if (section.config) {
            try {
              const parsed = JSON.parse(section.config);
              if (section.sectionType === 'IMAGE_GALLERY_SLIDER') {
                this.gallerySectionConfig.set(section.id!, parsed);
              } else if (section.sectionType === 'CUSTOM_CONTENT') {
                this.customSectionConfigs.set(section.id!, parsed);
              } else {
                this.sectionConfigs.set(section.sectionType, parsed);
              }
            } catch {
              this.sectionConfigs.set(section.sectionType, {});
            }
          }
        });

        // Load data for active sections
        this.loadSectionData();
      },
      error: () => {
        // Fallback: load all data with defaults
        this.useFallbackLayout = true;
        this.sectionsLoaded = true;
        this.dataReady = true;
        this.checkDismissOverlay();
        this.loadHeroSlides();
        this.loadFallbackData();
      }
    });
  }

  private loadSectionData(): void {
    this.homepageSections.forEach(section => {
      const config = this.sectionConfigs.get(section.sectionType) || {};
      const itemsCount = config.itemsCount || 6;

      switch (section.sectionType) {
        case 'HERO_SLIDER':
          this.loadHeroSlides();
          break;
        case 'FEATURED_LOCATIONS':
          this.loadLocations(itemsCount);
          break;
        case 'UPCOMING_EVENTS':
          this.loadEvents(itemsCount);
          break;
        case 'PLACES':
          this.loadPlaces(itemsCount);
          break;
        case 'SOCIAL_MEDIA':
          this.loadSocialMedia();
          break;
        case 'IMAGE_GALLERY_SLIDER':
        case 'CUSTOM_CONTENT':
          // no data loading needed; config holds everything
          break;
      }
    });
  }

  private loadFallbackData(): void {
    this.loadLocations(6);
    this.loadEvents(6);
    this.loadPlaces(6);
  }

  private loadHeroSlides(): void {
    this.heroSlideService.getActiveHeroSlides().subscribe({
      next: (slides) => {
        this.heroSlides = slides;
        this.slidesLoaded = true;
        if (slides.length > 1) {
          this.startSlideTimer();
        }
      },
      error: () => {
        this.heroSlides = [];
        this.slidesLoaded = true;
      }
    });
  }

  private loadLocations(count: number): void {
    this.locationService.getFeaturedLocations().subscribe({
      next: (items) => this.featuredLocations = items.slice(0, count),
      error: () => {
        // Fallback to paginated if featured endpoint fails
        this.locationService.getLocationsPaginated(0, count).subscribe({
          next: (response) => this.featuredLocations = response.content || [],
          error: () => this.featuredLocations = []
        });
      }
    });
  }

  private loadEvents(count: number): void {
    this.eventService.getFeaturedEvents().subscribe({
      next: (items) => this.featuredEvents = items.slice(0, count),
      error: () => {
        this.eventService.getEventsPaginated(0, count).subscribe({
          next: (response) => this.featuredEvents = response.content || [],
          error: () => this.featuredEvents = []
        });
      }
    });
  }

  private loadPlaces(count: number): void {
    this.placeService.getFeaturedPlaces().subscribe({
      next: (items) => this.featuredPlaces = items.slice(0, count),
      error: () => {
        this.placeService.getPlacesPaginated(0, count).subscribe({
          next: (response) => this.featuredPlaces = response.content || [],
          error: () => this.featuredPlaces = []
        });
      }
    });
  }

  private loadSocialMedia(): void {
    this.socialMediaContentService.getActiveSocialMediaContent().subscribe({
      next: (items) => this.socialMediaContent = items,
      error: () => this.socialMediaContent = []
    });
  }

  // Section helpers
  isSectionActive(sectionType: string): boolean {
    if (this.useFallbackLayout) {
      return sectionType !== 'SOCIAL_MEDIA';
    }
    return this.homepageSections.some(s => s.sectionType === sectionType);
  }

  getSectionTitle(sectionType: string): string {
    const section = this.homepageSections.find(s => s.sectionType === sectionType);
    return section?.title || '';
  }

  getSectionSubtitle(sectionType: string): string {
    const section = this.homepageSections.find(s => s.sectionType === sectionType);
    return section?.subtitle || '';
  }

  getSectionConfig(sectionType: string): HomepageSectionConfig {
    return this.sectionConfigs.get(sectionType) || {};
  }

  getGalleryConfig(sectionId: number | undefined): GallerySliderConfig {
    return this.gallerySectionConfig.get(sectionId!) || { images: [], speed: 30, pauseOnHover: true };
  }

  getCustomConfig(sectionId: number | undefined): CustomContentConfig {
    return this.customSectionConfigs.get(sectionId!) || { template: 'minimal' };
  }

  getCustomSectionStyle(config: CustomContentConfig): { [key: string]: string } {
    const style: { [key: string]: string } = {};
    if (config.backgroundColor) style['background-color'] = config.backgroundColor;
    if (config.backgroundImage) {
      style['background-image'] = `url(${config.backgroundImage})`;
      style['background-size'] = 'cover';
      style['background-position'] = 'center';
    }
    if (config.textColor) style['color'] = config.textColor;
    if (config.minHeight) style['min-height'] = config.minHeight;
    if (config.padding) style['padding'] = config.padding;
    if (config.verticalAlign) {
      style['display'] = 'flex';
      style['flex-direction'] = 'column';
      const map: Record<string, string> = { top: 'flex-start', center: 'center', bottom: 'flex-end' };
      style['justify-content'] = map[config.verticalAlign] ?? 'flex-start';
    }
    return style;
  }

  getCustomTextStyle(config: CustomContentConfig): { [key: string]: string } {
    const style: { [key: string]: string } = {};
    if (config.textAlign) style['text-align'] = config.textAlign;
    return style;
  }

  getPlatformClass(platform: string): string {
    return `social-platform--${platform.toLowerCase()}`;
  }

  getPlatformLabel(platform: string): string {
    const labels: Record<string, string> = {
      'INSTAGRAM': 'Instagram',
      'FACEBOOK': 'Facebook',
      'TWITTER': 'X',
      'YOUTUBE': 'YouTube',
      'TIKTOK': 'TikTok'
    };
    return labels[platform] || platform;
  }

  // Hero Slider controls
  private startSlideTimer(): void {
    this.stopSlideTimer();
    if (this.heroSlides.length > 1) {
      const currentSlide = this.heroSlides[this.currentSlideIndex];
      const duration = currentSlide?.displayDuration || 5000;
      this.slideInterval = setTimeout(() => {
        this.nextSlide();
      }, duration);
    }
  }

  private stopSlideTimer(): void {
    if (this.slideInterval) {
      clearTimeout(this.slideInterval);
      this.slideInterval = null;
    }
  }

  nextSlide(): void {
    if (this.isTransitioning || this.heroSlides.length <= 1) return;
    this.isTransitioning = true;
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.heroSlides.length;
    setTimeout(() => {
      this.isTransitioning = false;
      this.startSlideTimer();
    }, 800);
  }

  prevSlide(): void {
    if (this.isTransitioning || this.heroSlides.length <= 1) return;
    this.isTransitioning = true;
    this.currentSlideIndex = this.currentSlideIndex === 0
      ? this.heroSlides.length - 1
      : this.currentSlideIndex - 1;
    setTimeout(() => {
      this.isTransitioning = false;
      this.startSlideTimer();
    }, 800);
  }

  goToSlide(index: number): void {
    if (this.isTransitioning || index === this.currentSlideIndex) return;
    this.isTransitioning = true;
    this.currentSlideIndex = index;
    setTimeout(() => {
      this.isTransitioning = false;
      this.startSlideTimer();
    }, 800);
  }

  get currentSlide(): HeroSlide | null {
    return this.heroSlides[this.currentSlideIndex] || null;
  }
}
