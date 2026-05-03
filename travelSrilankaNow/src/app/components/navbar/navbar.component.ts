import { Component, OnInit, HostListener, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MoreSectionService } from '../../services/more-section.service';
import { MoreSection } from '../../models/more-section.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  isScrolled = false;
  isMoreOpen = false;

  navLinks = [
    { path: '/', label: 'Home', key: 'nav.home' },
    { path: '/locations', label: 'Locations', key: 'nav.locations' },
    { path: '/events', label: 'Events', key: 'nav.events' },
    { path: '/gallery', label: 'Gallery', key: 'nav.gallery' },
    { path: '/places', label: 'Hotels & Restaurants', key: 'nav.places' }
  ];

  moreSections: MoreSection[] = [];

  constructor(
    private moreSectionService: MoreSectionService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.loadMoreSections();
  }

  private loadMoreSections(): void {
    this.moreSectionService.getActiveSections().subscribe({
      next: (sections) => this.moreSections = sections,
      error: () => this.moreSections = []
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.more-dropdown')) {
      this.isMoreOpen = false;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.updateBodyScroll();
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.isMoreOpen = false;
    this.updateBodyScroll();
  }

  private updateBodyScroll(): void {
    if (this.isMenuOpen) {
      this.renderer.addClass(this.document.body, 'menu-open');
    } else {
      this.renderer.removeClass(this.document.body, 'menu-open');
    }
  }

  toggleMore(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.isMoreOpen = !this.isMoreOpen;
  }
}
