import { Component, HostListener, OnInit } from '@angular/core';
import { LanguageService, Language } from '../../services/language.service';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss']
})
export class LanguageSwitcherComponent implements OnInit {
  isOpen = false;
  isScrolled = false;
  searchQuery = '';
  languages: Language[] = [];
  current: Language = { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' };

  constructor(public langService: LanguageService) {}

  ngOnInit(): void {
    this.languages = this.langService.languages;
    this.current = this.langService.getCurrentLanguage();
    this.langService.currentLang$.subscribe(() => {
      this.current = this.langService.getCurrentLanguage();
    });
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

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const el = event.target as HTMLElement;
    if (!el.closest('.lang-switcher')) {
      this.isOpen = false;
    }
  }
}
