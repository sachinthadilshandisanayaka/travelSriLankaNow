import { Component, OnInit, AfterViewInit, OnDestroy, HostListener, Renderer2, Inject, ViewChild, ElementRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MoreSectionService } from '../../services/more-section.service';
import { NavConfigService } from '../../services/nav-config.service';
import { CustomerAuthService, CustomerUser } from '../../services/customer-auth.service';
import { SiteSettingsService } from '../../services/site-settings.service';
import { MoreSection } from '../../models/more-section.model';
import { NavConfig } from '../../models/nav-config.model';

// Fallback nav links used if API is unavailable
const FALLBACK_NAV: NavConfig[] = [
  { routePath: '/',          labelKey: 'nav.home',      displayOrder: 1, isVisible: true, isFixed: true  },
  { routePath: '/locations', labelKey: 'nav.locations', displayOrder: 2, isVisible: true, isFixed: false },
  { routePath: '/events',    labelKey: 'nav.events',    displayOrder: 3, isVisible: true, isFixed: false },
  { routePath: '/gallery',   labelKey: 'nav.gallery',   displayOrder: 4, isVisible: true, isFixed: false },
  { routePath: '/places',    labelKey: 'nav.places',    displayOrder: 5, isVisible: true, isFixed: false },
];

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  isMenuOpen = false;
  isScrolled = false;
  isMoreOpen = false;
  isUserMenuOpen = false;
  currentUser: CustomerUser | null = null;
  logoUrl = '';
  siteName = '';
  navbarStyle: 'classic' | 'liquid' | 'collapsible' = 'classic';

  navLinks: NavConfig[] = FALLBACK_NAV;
  moreSections: MoreSection[] = [];

  @ViewChild('liqIndicator') liqIndicator?: ElementRef<HTMLSpanElement>;

  private userSub?: Subscription;
  private navSub?: Subscription;

  constructor(
    private moreSectionService: MoreSectionService,
    private navConfigService: NavConfigService,
    private customerAuthService: CustomerAuthService,
    private siteSettingsService: SiteSettingsService,
    private renderer: Renderer2,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.loadNavConfig();
    this.loadMoreSections();
    this.userSub = this.customerAuthService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.siteSettingsService.getSettingByKey('logo_url').subscribe({
      next: (setting) => { if (setting?.value) this.logoUrl = setting.value; },
      error: () => {}
    });
    this.siteSettingsService.getSettingByKey('site_name').subscribe({
      next: (setting) => { if (setting?.value) this.siteName = setting.value; },
      error: () => {}
    });
    this.siteSettingsService.getSettingByKey('navbar_style').subscribe({
      next: (setting) => {
        if (setting?.value) this.navbarStyle = setting.value as 'classic' | 'liquid' | 'collapsible';
        setTimeout(() => this.updateLiquidIndicator(false), 80);
      },
      error: () => {}
    });

    this.navSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => setTimeout(() => this.updateLiquidIndicator(), 60));
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateLiquidIndicator(false), 120);
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.navSub?.unsubscribe();
  }

  private updateLiquidIndicator(animate = true): void {
    if (!this.liqIndicator) return;
    const el = this.liqIndicator.nativeElement;
    const container = el.closest('.nav-links') as HTMLElement | null;
    if (!container) return;

    const active = container.querySelector<HTMLElement>('a.nav-link.active');
    if (!active) {
      el.classList.remove('liq-indicator--visible');
      return;
    }

    const cRect = container.getBoundingClientRect();
    const aRect = active.getBoundingClientRect();
    const left = aRect.left - cRect.left;
    const width = aRect.width;

    if (!animate) {
      el.style.transition = 'none';
      el.style.left = `${left}px`;
      el.style.width = `${width}px`;
      requestAnimationFrame(() => { el.style.transition = ''; });
    } else {
      el.style.left = `${left}px`;
      el.style.width = `${width}px`;
    }

    el.classList.add('liq-indicator--visible');
  }

  private loadNavConfig(): void {
    this.navConfigService.getVisibleNavLinks().subscribe({
      next: (links) => { if (links.length) this.navLinks = links; },
      error: () => { /* keep fallback */ }
    });
  }

  private loadMoreSections(): void {
    this.moreSectionService.getActiveSections().subscribe({
      next: (sections) => this.moreSections = sections,
      error: () => this.moreSections = []
    });
  }

  getNavLabel(link: NavConfig): string {
    return link.labelOverride || '';
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.more-dropdown')) this.isMoreOpen = false;
    if (!target.closest('.nav-user-menu')) this.isUserMenuOpen = false;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.updateBodyScroll();
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.isMoreOpen = false;
    this.isUserMenuOpen = false;
    this.updateBodyScroll();
  }

  toggleMore(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.isMoreOpen = !this.isMoreOpen;
  }

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout() {
    this.customerAuthService.logout();
    this.isUserMenuOpen = false;
    this.router.navigate(['/']);
  }

  private updateBodyScroll(): void {
    if (this.isMenuOpen) {
      this.renderer.addClass(this.document.body, 'menu-open');
    } else {
      this.renderer.removeClass(this.document.body, 'menu-open');
    }
  }
}
