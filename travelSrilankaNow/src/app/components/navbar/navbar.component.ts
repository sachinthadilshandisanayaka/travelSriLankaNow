import { Component, OnInit, OnDestroy, HostListener, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isScrolled = false;
  isMoreOpen = false;
  isUserMenuOpen = false;
  currentUser: CustomerUser | null = null;
  logoUrl = '';
  siteName = '';

  navLinks: NavConfig[] = FALLBACK_NAV;
  moreSections: MoreSection[] = [];

  private userSub?: Subscription;

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
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
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
