import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { EventService } from '../../services/event.service';
import { PlaceService } from '../../services/place.service';
import { PackageService } from '../../services/package.service';
import { HeroSlideService } from '../../services/hero-slide.service';
import { HomepageSectionService } from '../../services/homepage-section.service';
import { SocialMediaContentService } from '../../services/social-media-content.service';
import { SiteSettingsService } from '../../services/site-settings.service';
import { MasterDataService, MasterData } from '../../services/master-data.service';
import { Location } from '../../models/location.model';
import { Event as EventModel } from '../../models/event.model';
import { Place } from '../../models/place.model';
import { TourPackage } from '../../models/package.model';
import { HeroSlide, HeroSearchConfig } from '../../models/hero-slide.model';
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

  // Hero Search Bar
  heroSearchConfig: HeroSearchConfig | null = null;
  activeSearchTab: string = 'packages';
  searchCategory: string = '';
  searchCategories: MasterData[] = [];

  // Data
  featuredLocations: Location[] = [];
  featuredEvents: EventModel[] = [];
  featuredPlaces: Place[] = [];
  featuredPackages: TourPackage[] = [];
  socialMediaContent: SocialMediaContent[] = [];

  // Dynamic Sections
  homepageSections: HomepageSection[] = [];
  sectionConfigs: Map<string, HomepageSectionConfig> = new Map();
  gallerySectionConfig: Map<number, GallerySliderConfig> = new Map();
  customSectionConfigs: Map<number, CustomContentConfig> = new Map();
  sectionsLoaded = false;
  useFallbackLayout = false;

  private visibilityObserver: IntersectionObserver | null = null;
  private onPageVisible = () => this.syncVideoPlayback();

  constructor(
    private locationService: LocationService,
    private eventService: EventService,
    private placeService: PlaceService,
    private packageService: PackageService,
    private heroSlideService: HeroSlideService,
    private homepageSectionService: HomepageSectionService,
    private socialMediaContentService: SocialMediaContentService,
    private siteSettings: SiteSettingsService,
    private masterDataService: MasterDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHomepageSections();
    this.loadHeroSearchConfig();
  }

  ngOnDestroy(): void {
    this.stopSlideTimer();
    if (this.visibilityObserver) { this.visibilityObserver.disconnect(); this.visibilityObserver = null; }
    document.removeEventListener('visibilitychange', this.onPageVisible);
  }

  private loadHomepageSections(): void {
    this.homepageSectionService.getActiveSections().subscribe({
      next: (sections) => {
        this.homepageSections = sections;
        this.sectionsLoaded = true;

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
        case 'PACKAGES':
          this.loadPackages(itemsCount);
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
    this.loadPackages(6);
  }

  private loadHeroSlides(): void {
    this.heroSlideService.getActiveHeroSlides().subscribe({
      next: (slides) => {
        this.heroSlides = slides;
        this.slidesLoaded = true;
        if (slides.length > 1) {
          this.startSlideTimer();
        }
        // Defer to let Angular render the video elements, then set up resume listeners
        setTimeout(() => this.setupVideoResume(), 400);
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

  private loadPackages(count: number): void {
    this.packageService.getFeaturedPackages().subscribe({
      next: (items) => this.featuredPackages = items.slice(0, count),
      error: () => {
        this.packageService.getPackagesPaginated(0, count).subscribe({
          next: (response) => this.featuredPackages = response.content || [],
          error: () => this.featuredPackages = []
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
    return this.gallerySectionConfig.get(sectionId!) || { images: [], speed: 30, pauseOnHover: true, galleryStyle: 'slider' };
  }

  // Called from slide transitions and visibility-restore — forces the active video to play.
  syncVideoPlayback(): void {
    const active = document.querySelector<HTMLVideoElement>(
      '.hero-carousel .carousel-slide--active video'
    );
    // IMPORTANT: only pause/play when there IS a video in the active slide.
    // If active is null the current slide is an image — leave other videos alone.
    if (!active) return;
    document.querySelectorAll<HTMLVideoElement>('.hero-carousel video').forEach(v => {
      if (v !== active) { try { v.pause(); } catch (_) {} }
    });
    active.play().catch(() => {});
  }

  // Attach the visibility/scroll listeners once after slides are rendered.
  private setupVideoResume(): void {
    document.addEventListener('visibilitychange', this.onPageVisible);

    if (typeof IntersectionObserver !== 'undefined') {
      const carousel = document.querySelector('.hero-carousel');
      if (carousel) {
        if (this.visibilityObserver) { this.visibilityObserver.disconnect(); }
        this.visibilityObserver = new IntersectionObserver(
          entries => { if (entries[0].isIntersecting) this.syncVideoPlayback(); },
          { threshold: 0.2 }
        );
        this.visibilityObserver.observe(carousel);
      }
    }
  }

  // Hero slide text styles ───────────────────────────────────────────────────
  getTextStyle(style: any): { [k: string]: string } {
    if (!style || typeof style !== 'object') return {};
    const css: { [k: string]: string } = {};
    if (style['fontFamily'])    css['font-family']    = style['fontFamily'];
    if (style['fontSize'])      css['font-size']      = style['fontSize'];
    if (style['fontWeight'])    css['font-weight']    = style['fontWeight'];
    if (style['letterSpacing']) css['letter-spacing'] = style['letterSpacing'];
    if (style['textTransform']) css['text-transform'] = style['textTransform'];
    if (style['textAlign'])     css['text-align']     = style['textAlign'];
    if (style['lineHeight'])    css['line-height']    = style['lineHeight'];
    if (style['textShadow'] !== undefined && style['textShadow'] !== '')
      css['text-shadow'] = style['textShadow'];
    // Outline/stroke support
    if (style['textStroke']) {
      css['-webkit-text-stroke'] = style['textStroke'];
    }
    // Fill mode: hollow = transparent fill, semi = faint fill
    if (style['fillMode'] === 'hollow') {
      css['color'] = 'transparent';
    } else if (style['fillMode'] === 'semi') {
      css['color'] = 'rgba(255,255,255,0.2)';
    } else if (style['color']) {
      css['color'] = style['color'];
    }
    return css;
  }

  // Gallery image click navigation ─────────────────────────────────────────
  /** Returns the RouterLink commands for a gallery image, or null if not navigable. */
  getGalleryItemLink(img: any): any[] | null {
    if (!img || !img.sourceType || !img.sourceId) return null;
    switch (img.sourceType) {
      case 'location': return ['/locations', img.sourceId];
      case 'event':    return ['/events',    img.sourceId];
      case 'place':    return ['/places',    img.sourceId];
      default:         return null;
    }
  }

  onGalleryImageClick(img: any): void {
    const link = this.getGalleryItemLink(img);
    if (link) { this.router.navigate(link); }
  }

  // Gallery 3D tilt ──────────────────────────────────────────────────────────
  onTiltMove(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const inner = el.querySelector('.gallery-tilt-item__inner') as HTMLElement;
    if (!inner) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width  - 0.5;
    const y = (event.clientY - rect.top)  / rect.height - 0.5;
    inner.style.transition = 'transform 0.05s ease';
    inner.style.transform  = `perspective(800px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale3d(1.03,1.03,1.03)`;
  }

  onTiltLeave(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const inner = el.querySelector('.gallery-tilt-item__inner') as HTMLElement;
    if (!inner) return;
    inner.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
    inner.style.transform  = '';
  }

  getCustomConfig(sectionId: number | undefined): CustomContentConfig {
    return this.customSectionConfigs.get(sectionId!) || { template: 'minimal' };
  }

  /** Returns inline styles for the __inner content wrapper: text-align + block alignment */
  getCustomInnerStyle(config: CustomContentConfig): { [k: string]: string } {
    const align = config.titleAlign || 'left';
    const css: { [k: string]: string } = { 'text-align': align };
    // Also align the block itself so right/center-aligned sections look correct
    if (align === 'center') { css['margin-left'] = 'auto'; css['margin-right'] = 'auto'; }
    else if (align === 'right') { css['margin-left'] = 'auto'; css['margin-right'] = '0'; }
    else                        { css['margin-left'] = '0';    css['margin-right'] = 'auto'; }
    return css;
  }

  getCustomSectionStyle(config: CustomContentConfig): { [key: string]: string } {
    const style: { [key: string]: string } = {};
    if (config.backgroundColor) style['background-color'] = config.backgroundColor;
    if (config.backgroundImage) {
      style['background-image'] = `url(${config.backgroundImage})`;
      const effect = config.backgroundEffect || 'cover';
      if (effect === 'parallax') {
        style['background-size'] = 'cover';
        style['background-attachment'] = 'fixed';
        style['background-position'] = 'center';
        style['background-repeat'] = 'no-repeat';
      } else if (effect === 'contain') {
        style['background-size'] = 'contain';
        style['background-repeat'] = 'no-repeat';
        style['background-position'] = 'center';
      } else if (effect === 'tile') {
        style['background-size'] = 'auto';
        style['background-repeat'] = 'repeat';
        style['background-position'] = 'top left';
      } else {
        style['background-size'] = 'cover';
        style['background-position'] = 'center';
        style['background-repeat'] = 'no-repeat';
      }
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

  getCustomOverlayStyle(config: CustomContentConfig): { [key: string]: string } {
    if (!config.backgroundImage || !(config.overlayOpacity ?? 0)) return { display: 'none' };
    const color = config.overlayColor || '#000000';
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return { background: `rgba(${r},${g},${b},${config.overlayOpacity ?? 0})` };
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

  // ── Hero slide gallery slit state ─────────────────────────────────────────
  /** Tracks which slit panel is expanded in each slide (keyed by slideIndex). */
  activeGallerySlit: Map<number, number> = new Map();

  getActiveGallerySlit(slideIndex: number): number {
    return this.activeGallerySlit.get(slideIndex) ?? 0;
  }

  setGallerySlit(slideIndex: number, slitIndex: number, event: Event): void {
    event.stopPropagation();
    this.activeGallerySlit.set(slideIndex, slitIndex);
  }

  slideHasGallery(slide: HeroSlide): boolean {
    return !!(slide.galleryImages && slide.galleryImages.length > 0);
  }
  // ──────────────────────────────────────────────────────────────────────────

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
      this.syncVideoPlayback();
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
      this.syncVideoPlayback();
    }, 800);
  }

  goToSlide(index: number): void {
    if (this.isTransitioning || index === this.currentSlideIndex) return;
    this.isTransitioning = true;
    this.currentSlideIndex = index;
    setTimeout(() => {
      this.isTransitioning = false;
      this.startSlideTimer();
      this.syncVideoPlayback();
    }, 800);
  }

  get currentSlide(): HeroSlide | null {
    return this.heroSlides[this.currentSlideIndex] || null;
  }

  trackSlideById(_index: number, slide: HeroSlide): number {
    return slide.id || _index;
  }

  // ── Hero Search Bar ───────────────────────────────────────────────────────

  private loadHeroSearchConfig(): void {
    this.siteSettings.getHeroSearchConfig().subscribe({
      next: (config) => {
        this.heroSearchConfig = config;
        if (config?.enabled && config.tabs?.length) {
          const firstEnabled = config.tabs.find(t => t.enabled);
          if (firstEnabled) this.setSearchTab(firstEnabled.key);
        }
      },
      error: () => {}
    });
  }

  get enabledSearchTabs() {
    return this.heroSearchConfig?.tabs?.filter(t => t.enabled) || [];
  }

  get activeTabConfig() {
    return this.heroSearchConfig?.tabs?.find(t => t.key === this.activeSearchTab) || null;
  }

  setSearchTab(key: string): void {
    this.activeSearchTab = key;
    this.searchCategory = '';
    this.loadSearchCategories(key);
  }

  private loadSearchCategories(tabKey: string): void {
    let obs$;
    switch (tabKey) {
      case 'packages':  obs$ = this.masterDataService.getPackageCategories();  break;
      case 'events':    obs$ = this.masterDataService.getEventCategories();     break;
      case 'locations': obs$ = this.masterDataService.getLocationCategories();  break;
      case 'places':    obs$ = this.masterDataService.getPlaceTypes();          break;
      default: this.searchCategories = []; return;
    }
    obs$.subscribe({
      next: (cats) => this.searchCategories = cats.filter(c => c.isActive),
      error: () => this.searchCategories = []
    });
  }

  performSearch(): void {
    const queryParams: any = {};
    if (this.activeSearchTab === 'places') {
      if (this.searchCategory) queryParams['type'] = this.searchCategory;
    } else {
      if (this.searchCategory) queryParams['category'] = this.searchCategory;
    }

    const routes: Record<string, string> = {
      packages:  '/packages',
      events:    '/events',
      locations: '/locations',
      places:    '/places'
    };
    this.router.navigate([routes[this.activeSearchTab] || '/'], { queryParams });
  }

  // ─────────────────────────────────────────────────────────────────────────
}
