import { Component, HostListener, NgZone, OnDestroy, OnInit } from '@angular/core';
import { LanguageService, Language } from '../../services/language.service';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss']
})
export class LanguageSwitcherComponent implements OnInit, OnDestroy {
  isOpen = false;
  isScrolled = false;
  searchQuery = '';
  languages: Language[] = [];
  current: Language = { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' };

  constructor(public langService: LanguageService, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.languages = this.langService.languages;
    this.current = this.langService.getCurrentLanguage();
    this.langService.currentLang$.subscribe(() => {
      this.current = this.langService.getCurrentLanguage();
    });

    // Outside Angular's zone so this doesn't force a full change-detection
    // pass on every scroll event; only re-enters the zone when isScrolled
    // actually flips.
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onWindowScroll, { passive: true });
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onWindowScroll);
  }

  get filteredLanguages(): Language[] {
    if (!this.searchQuery.trim()) return this.languages;
    const q = this.searchQuery.toLowerCase();
    return this.languages.filter(l =>
      l.label.toLowerCase().includes(q) ||
      l.nativeLabel.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q)
    );
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchQuery = '';
    }
  }

  select(code: string): void {
    this.langService.setLanguage(code);
    this.isOpen = false;
    this.searchQuery = '';
  }

  private onWindowScroll = (): void => {
    const scrolled = window.scrollY > 50;
    if (scrolled !== this.isScrolled) {
      this.ngZone.run(() => { this.isScrolled = scrolled; });
    }
  };

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const el = event.target as HTMLElement;
    if (!el.closest('.lang-switcher')) {
      this.isOpen = false;
    }
  }
}
