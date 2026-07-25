import { Component, OnInit, OnDestroy, AfterViewInit, ViewChildren, ViewChild, QueryList, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription, Observable, merge, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError, timeout, tap } from 'rxjs/operators';
import { LocationService } from '../../services/location.service';
import { EventService } from '../../services/event.service';
import { PlaceService } from '../../services/place.service';
import { PackageService } from '../../services/package.service';
import { HeroSlideService } from '../../services/hero-slide.service';
import { HomepageSectionService } from '../../services/homepage-section.service';
import { MoreSectionService } from '../../services/more-section.service';
import { SocialMediaContentService } from '../../services/social-media-content.service';
import { SiteSettingsService } from '../../services/site-settings.service';
import { NavConfigService } from '../../services/nav-config.service';
import { MasterDataService, MasterData } from '../../services/master-data.service';
import { Location } from '../../models/location.model';
import { Event as EventModel } from '../../models/event.model';
import { Place } from '../../models/place.model';
import { TourPackage } from '../../models/package.model';
import { HeroSlide, HeroSearchConfig } from '../../models/hero-slide.model';
import { HomepageSection, HomepageSectionConfig, GallerySliderConfig, CustomContentConfig, CustomerFeedbackConfig, ScrollCardsConfig, MoreSectionBlockConfig } from '../../models/homepage-section.model';
import { SocialMediaContent } from '../../models/social-media-content.model';
import { MoreSectionItem } from '../../models/more-section.model';

interface GlobalSearchResult {
  type: 'package' | 'event' | 'location' | 'place';
  title: string;
  subtitle: string;
  route: string;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  // Hero Slider
  heroSlides: HeroSlide[] = [];
  currentSlideIndex = 0;
  slideInterval: any = null;
  isTransitioning = false;
  slidesLoaded = false;

  // Hero Search Bar
  heroSearchConfig: HeroSearchConfig | null = null;
  activeSearchTab: string = 'events';
  searchCategory: string = '';
  searchCategories: MasterData[] = [];
  pillLeft = 0;
  pillWidth = 0;
  private tabNavLabels: Record<string, string> = {};
  private readonly TAB_ROUTE_MAP: Record<string, string> = {
    events:    '/events',
    locations: '/locations',
    gallery:   '/gallery',
    places:    '/places',
    packages:  '/packages',
  };

  // ── Global (no-tabs) search — free-text typeahead across all content types ──
  globalSearchQuery = '';
  globalSearchResults: GlobalSearchResult[] = [];
  globalSearchLoading = false;
  showGlobalSuggestions = false;
  activeGlobalSuggestionIndex = -1;
  private readonly GLOBAL_RESULTS_PAGE_SIZE = 6;
  visibleGlobalResultsCount = this.GLOBAL_RESULTS_PAGE_SIZE;
  private globalSearchSubject = new Subject<string>();
  private globalSearchSub?: Subscription;

  @ViewChildren('hsbTabBtn') hsbTabBtns!: QueryList<ElementRef>;
  @ViewChild('hsbTabsContainer') hsbTabsContainer!: ElementRef;

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
  feedbackSectionConfigs: Map<number, CustomerFeedbackConfig> = new Map();
  scrollCardsSectionConfigs: Map<number, ScrollCardsConfig> = new Map();
  moreSectionBlockConfigs: Map<number, MoreSectionBlockConfig> = new Map();
  moreSectionItemsMap: Map<number, MoreSectionItem[]> = new Map();
  sectionsLoaded = false;
  useFallbackLayout = false;

  private visibilityObserver: IntersectionObserver | null = null;
  private customAnimObserver: IntersectionObserver | null = null;
  private scrollCardsListeners: Array<() => void> = [];
  private onPageVisible = () => this.syncVideoPlayback();

  constructor(
    private locationService: LocationService,
    private eventService: EventService,
    private placeService: PlaceService,
    private packageService: PackageService,
    private heroSlideService: HeroSlideService,
    private homepageSectionService: HomepageSectionService,
    private moreSectionService: MoreSectionService,
    private socialMediaContentService: SocialMediaContentService,
    private siteSettings: SiteSettingsService,
    private navConfigService: NavConfigService,
    private masterDataService: MasterDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHomepageSections();
    this.loadHeroSearchConfig();
    this.loadTabNavLabels();
    this.initGlobalSearch();
  }

  ngAfterViewInit(): void {
    this.hsbTabBtns.changes.subscribe(() => {
      setTimeout(() => this.syncPill(), 0);
    });
  }

  private syncPill(): void {
    const buttons = this.hsbTabBtns?.toArray() ?? [];
    const tabs = this.enabledSearchTabs;
    const activeIdx = tabs.findIndex(t => t.key === this.activeSearchTab);
    if (activeIdx < 0 || !buttons[activeIdx]) return;
    const btn = buttons[activeIdx].nativeElement as HTMLElement;
    const container = this.hsbTabsContainer?.nativeElement as HTMLElement;
    if (!btn || !container) return;
    const bRect = btn.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    this.pillLeft = bRect.left - cRect.left + container.scrollLeft;
    this.pillWidth = bRect.width;
  }

  ngOnDestroy(): void {
    this.stopSlideTimer();
    if (this.visibilityObserver) { this.visibilityObserver.disconnect(); this.visibilityObserver = null; }
    if (this.customAnimObserver) { this.customAnimObserver.disconnect(); this.customAnimObserver = null; }
    this.scrollCardsListeners.forEach(fn => window.removeEventListener('scroll', fn));
    this.scrollCardsListeners = [];
    document.removeEventListener('visibilitychange', this.onPageVisible);
    this.globalSearchSub?.unsubscribe();
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
              } else if (section.sectionType === 'CUSTOMER_FEEDBACK') {
                this.feedbackSectionConfigs.set(section.id!, parsed);
              } else if (section.sectionType === 'SCROLL_CARDS') {
                this.scrollCardsSectionConfigs.set(section.id!, parsed);
              } else if (section.sectionType === 'MORE_SECTION') {
                this.moreSectionBlockConfigs.set(section.id!, parsed);
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
        setTimeout(() => {
          this.setupCustomContentAnimations();
          this.setupScrollCardsAnimations();
          this.setupFeedbackCarouselDrag();
        }, 200);
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
        case 'MORE_SECTION':
          this.loadMoreSectionItems(section);
          break;
        case 'IMAGE_GALLERY_SLIDER':
        case 'CUSTOM_CONTENT':
        case 'CUSTOMER_FEEDBACK':
        case 'SCROLL_CARDS':
          // no data loading needed; config holds everything
          break;
      }
    });
  }

  private loadMoreSectionItems(section: HomepageSection): void {
    const config = this.moreSectionBlockConfigs.get(section.id!);
    if (!config?.moreSectionSlug) return;
    this.moreSectionService.getSectionItems(config.moreSectionSlug, 0, config.itemCount || 6).subscribe({
      next: (response) => this.moreSectionItemsMap.set(section.id!, response.content),
      error: () => this.moreSectionItemsMap.set(section.id!, [])
    });
  }

  getMoreSectionConfig(sectionId: number | undefined): MoreSectionBlockConfig | undefined {
    return this.moreSectionBlockConfigs.get(sectionId!);
  }

  getMoreSectionItems(sectionId: number | undefined): MoreSectionItem[] {
    return this.moreSectionItemsMap.get(sectionId!) || [];
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

  private setupCustomContentAnimations(): void {
    if (this.customAnimObserver) {
      this.customAnimObserver.disconnect();
    }
    const targets = document.querySelectorAll<HTMLElement>('.cc-anim');
    if (!targets.length) { return; }

    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach(el => el.classList.add('cc-anim--play'));
      return;
    }

    this.customAnimObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('cc-anim--play');
          this.customAnimObserver?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    targets.forEach(el => this.customAnimObserver!.observe(el));
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
          const firstEnabled = config.tabs.find(t => t.enabled && t.key in this.TAB_ROUTE_MAP);
          if (firstEnabled) this.setSearchTab(firstEnabled.key);
        }
      },
      error: () => {}
    });
  }

  get enabledSearchTabs() {
    return this.heroSearchConfig?.tabs?.filter(t => t.enabled && t.key in this.TAB_ROUTE_MAP) || [];
  }

  get activeTabConfig() {
    return this.heroSearchConfig?.tabs?.find(t => t.key === this.activeSearchTab) || null;
  }

  private loadTabNavLabels(): void {
    this.navConfigService.getVisibleNavLinks().subscribe({
      next: (navLinks) => {
        const map: Record<string, string> = {};
        for (const [tabKey, route] of Object.entries(this.TAB_ROUTE_MAP)) {
          const match = navLinks.find(n => n.routePath === route);
          if (match) {
            const seg = route.replace(/^\//, '');
            map[tabKey] = match.labelOverride || (seg.charAt(0).toUpperCase() + seg.slice(1));
          }
        }
        this.tabNavLabels = map;
      },
      error: () => {}
    });
  }

  getTabLabel(tab: { key: string; label: string }): string {
    return this.tabNavLabels[tab.key] || tab.label;
  }

  getTabCategoryLabel(tabKey: string): string {
    const tab = this.heroSearchConfig?.tabs?.find(t => t.key === tabKey);
    const navLabel = this.tabNavLabels[tabKey];
    if (navLabel) return 'All ' + navLabel;
    return tab?.categoryLabel || 'All';
  }

  setSearchTab(key: string): void {
    this.activeSearchTab = key;
    this.searchCategory = '';
    this.loadSearchCategories(key);
    setTimeout(() => this.syncPill(), 0);
  }

  private loadSearchCategories(tabKey: string): void {
    let obs$;
    switch (tabKey) {
      case 'events':    obs$ = this.masterDataService.getEventCategories();    break;
      case 'locations': obs$ = this.masterDataService.getLocationCategories(); break;
      case 'places':    obs$ = this.masterDataService.getPlaceTypes();         break;
      case 'packages':  obs$ = this.masterDataService.getPackageCategories();  break;
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
      events:    '/events',
      locations: '/locations',
      gallery:   '/gallery',
      places:    '/places',
      packages:  '/packages'
    };
    this.router.navigate([routes[this.activeSearchTab] || '/'], { queryParams });
  }

  // ── Global (no-tabs) search — free-text typeahead across all content types ──
  // Sources are merged (not forkJoin'd) so fast ones render immediately instead
  // of the whole dropdown waiting on the slowest content type; each source also
  // gets its own timeout so one slow/unreachable endpoint can't hang the UI.
  private initGlobalSearch(): void {
    this.globalSearchSub = this.globalSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        const q = query.trim();
        this.globalSearchResults = [];
        this.visibleGlobalResultsCount = this.GLOBAL_RESULTS_PAGE_SIZE;
        if (q.length < 2) {
          this.globalSearchLoading = false;
          return of(null);
        }
        this.globalSearchLoading = true;

        const sources: Observable<GlobalSearchResult[]>[] = [
          this.packageService.searchPackages(q).pipe(
            map(list => list.slice(0, 10).map(p => ({ type: 'package' as const, title: p.title, subtitle: 'Tour Package', route: `/packages/${p.slug}` }))),
            timeout(12000), catchError(() => of([] as GlobalSearchResult[]))
          ),
          this.eventService.searchEvents(q).pipe(
            map(list => list.slice(0, 10).map(e => ({ type: 'event' as const, title: e.title, subtitle: 'Event', route: `/events/${e.slug}` }))),
            timeout(12000), catchError(() => of([] as GlobalSearchResult[]))
          ),
          this.locationService.searchLocations(q).pipe(
            map(list => list.slice(0, 10).map(l => ({ type: 'location' as const, title: l.name, subtitle: 'Location', route: `/locations/${l.slug}` }))),
            timeout(12000), catchError(() => of([] as GlobalSearchResult[]))
          ),
          this.placeService.searchPlaces(q).pipe(
            map(list => list.slice(0, 10).map(pl => ({ type: 'place' as const, title: pl.name, subtitle: 'Place', route: `/places/${pl.slug}` }))),
            timeout(12000), catchError(() => of([] as GlobalSearchResult[]))
          ),
        ];

        let remaining = sources.length;
        return merge(...sources).pipe(
          tap(batch => {
            this.globalSearchResults = [...this.globalSearchResults, ...batch];
            if (--remaining <= 0) this.globalSearchLoading = false;
          })
        );
      })
    ).subscribe();
  }

  // Only the first page is rendered; scrolling near the bottom of the dropdown
  // reveals more of the already-fetched results (see onGlobalDropdownScroll).
  get visibleGlobalResults(): GlobalSearchResult[] {
    return this.globalSearchResults.slice(0, this.visibleGlobalResultsCount);
  }

  onGlobalSearchInput(): void {
    this.activeGlobalSuggestionIndex = -1;
    this.showGlobalSuggestions = true;
    this.globalSearchSubject.next(this.globalSearchQuery);
  }

  onGlobalSearchFocus(): void {
    if (this.globalSearchQuery.trim().length >= 2) this.showGlobalSuggestions = true;
  }

  onGlobalSearchBlur(): void {
    setTimeout(() => this.showGlobalSuggestions = false, 150);
  }

  onGlobalDropdownScroll(event: Event): void {
    const el = event.target as HTMLElement;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
    if (nearBottom && this.visibleGlobalResultsCount < this.globalSearchResults.length) {
      this.visibleGlobalResultsCount = Math.min(
        this.visibleGlobalResultsCount + this.GLOBAL_RESULTS_PAGE_SIZE,
        this.globalSearchResults.length
      );
    }
  }

  onGlobalSearchKeydown(event: KeyboardEvent): void {
    if (!this.showGlobalSuggestions || !this.globalSearchResults.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = this.activeGlobalSuggestionIndex + 1;
      if (nextIndex >= this.visibleGlobalResultsCount && this.visibleGlobalResultsCount < this.globalSearchResults.length) {
        this.visibleGlobalResultsCount = Math.min(this.visibleGlobalResultsCount + this.GLOBAL_RESULTS_PAGE_SIZE, this.globalSearchResults.length);
      }
      this.activeGlobalSuggestionIndex = Math.min(nextIndex, this.visibleGlobalResultsCount - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeGlobalSuggestionIndex = Math.max(this.activeGlobalSuggestionIndex - 1, -1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const idx = this.activeGlobalSuggestionIndex >= 0 ? this.activeGlobalSuggestionIndex : 0;
      this.selectGlobalResult(this.globalSearchResults[idx]);
    } else if (event.key === 'Escape') {
      this.showGlobalSuggestions = false;
    }
  }

  selectGlobalResult(result: GlobalSearchResult): void {
    this.showGlobalSuggestions = false;
    this.globalSearchQuery = '';
    this.globalSearchResults = [];
    this.router.navigate([result.route]);
  }

  // ── Scroll Cards animation ───────────────────────────────────────────────
  private setupScrollCardsAnimations(): void {
    // Clean up old scroll listeners
    this.scrollCardsListeners.forEach(fn => window.removeEventListener('scroll', fn));
    this.scrollCardsListeners = [];

    // Centered grid cards: staggered fade-in via IntersectionObserver
    if (typeof IntersectionObserver !== 'undefined') {
      const centeredCards = document.querySelectorAll<HTMLElement>('.scroll-card--centered-item');
      if (centeredCards.length) {
        const centeredObs = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const idx = parseInt((entry.target as HTMLElement).dataset['index'] || '0');
              setTimeout(() => entry.target.classList.add('sc--revealed'), idx * 120);
              centeredObs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });
        centeredCards.forEach(el => centeredObs.observe(el));
      }
    } else {
      document.querySelectorAll<HTMLElement>('.scroll-card--centered-item').forEach(el => el.classList.add('sc--revealed'));
    }

    // Split layout: scroll-driven sticky reveal — cards peel off one by one upward
    const wrappers = document.querySelectorAll<HTMLElement>('.sc-scroll-wrapper');
    wrappers.forEach(wrapper => {
      const stack = wrapper.querySelector<HTMLElement>('.scroll-cards-stack');
      if (!stack) return;

      const cards = Array.from(stack.querySelectorAll<HTMLElement>('.scroll-card--stacked'));
      const n = cards.length;
      if (!n) return;

      const movingCount = n - 1;
      if (movingCount <= 0) return;

      // ── Core idea ────────────────────────────────────────────────────────────
      // All cards start stacked at y=0.  As the user scrolls:
      //   • Card N starts moving once Card N-1 has risen exactly one card-height
      //     (clearing the space so Card N is revealed below it).
      //   • All cards travel the same EXIT_DIST at the same eased rate.
      //   • When Card N+2 begins moving, Card N disappears (opacity 0).
      // ─────────────────────────────────────────────────────────────────────────
      const winH = window.innerHeight;
      const CARD_H  = cards[0]?.offsetHeight || 260;
      const EXIT_DIST = Math.round(winH * 0.75); // enough to clear section top
      const STAGGER   = CARD_H;                   // px of scroll before next card starts

      // Total scroll the animation needs:  (n-1 staggers) + one full card exit
      const totalScroll = (movingCount - 1) * STAGGER + EXIT_DIST;
      wrapper.style.height = `${totalScroll + winH}px`;

      // The actual per-frame work (forces a layout read via getBoundingClientRect,
      // then writes styles). Only ever invoked from a requestAnimationFrame
      // callback below — never directly from the scroll event — so it runs at
      // most once per rendered frame no matter how many scroll events the
      // browser fires in between.
      const update = () => {
        ticking = false;
        const rect    = wrapper.getBoundingClientRect();
        const scrolled = Math.max(0, Math.min(totalScroll, -rect.top));

        cards.forEach((card, ci) => {
          if (ci === n - 1) {
            card.style.transform = 'translateY(0px)';
            card.style.opacity   = '1';
            return;
          }

          // How far this card has scrolled relative to its own start
          const cardScrolled = Math.max(0, scrolled - ci * STAGGER);
          const t     = Math.min(1, cardScrolled / EXIT_DIST);
          const eased = 1 - Math.pow(1 - t, 3);
          card.style.transform = `translateY(${-EXIT_DIST * eased}px)`;

          // Disappear the moment card ci+2 begins moving (if ci+2 is a moving card)
          if (ci + 2 < n - 1) {
            card.style.opacity = scrolled >= (ci + 2) * STAGGER ? '0' : '1';
          } else {
            card.style.opacity = '1';
          }
        });
      };

      // rAF-throttled scroll handler: coalesces any number of scroll events
      // fired within a single frame into one layout read + style write,
      // instead of doing forced-reflow work per raw scroll event (the
      // original cause of scroll jank in this section).
      let ticking = false;
      const handler = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      };

      window.addEventListener('scroll', handler, { passive: true });
      this.scrollCardsListeners.push(handler);
      update(); // sync on first render
    });
  }

  // ── Feedback carousel drag-to-scroll ─────────────────────────────────────
  private setupFeedbackCarouselDrag(): void {
    const carousels = document.querySelectorAll<HTMLElement>('.feedback-carousel');
    carousels.forEach(el => {
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;

      el.addEventListener('mousedown', (e: MouseEvent) => {
        isDown = true;
        el.style.cursor = 'grabbing';
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
      });
      el.addEventListener('mouseleave', () => { isDown = false; el.style.cursor = 'grab'; });
      el.addEventListener('mouseup', () => { isDown = false; el.style.cursor = 'grab'; });
      el.addEventListener('mousemove', (e: MouseEvent) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 2;
        el.scrollLeft = scrollLeft - walk;
      });
    });
  }

  // ── Customer Feedback helpers ────────────────────────────────────────────
  getFeedbackConf(sectionId?: number): CustomerFeedbackConfig {
    return this.feedbackSectionConfigs.get(sectionId!) || { feedbacks: [] };
  }

  getStarArray(): number[] { return [1, 2, 3, 4, 5]; }

  // ── Scroll Cards helpers ─────────────────────────────────────────────────
  getScrollCardsConf(sectionId?: number): ScrollCardsConfig {
    return this.scrollCardsSectionConfigs.get(sectionId!) || { cards: [] };
  }

  // ─────────────────────────────────────────────────────────────────────────
}
