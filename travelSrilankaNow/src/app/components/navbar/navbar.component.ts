import { Component, OnInit, HostListener } from '@angular/core';
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
    { path: '/', label: 'Home' },
    { path: '/locations', label: 'Locations' },
    { path: '/events', label: 'Events' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/places', label: 'Hotels & Restaurants' }
  ];

  moreSections: MoreSection[] = [];

  constructor(private moreSectionService: MoreSectionService) {}

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
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.isMoreOpen = false;
  }

  toggleMore(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.isMoreOpen = !this.isMoreOpen;
  }
}
