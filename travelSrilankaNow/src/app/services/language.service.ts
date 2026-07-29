import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, filter } from 'rxjs/operators';

export interface Language {
  code: string;
  label: string;
  nativeLabel: string;
  flag: string;
  dir?: 'ltr' | 'rtl';
}

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English',    nativeLabel: 'English',    flag: '🇬🇧' },
  { code: 'si', label: 'Sinhala',    nativeLabel: 'සිංහල',      flag: '🇱🇰' },
  { code: 'ta', label: 'Tamil',      nativeLabel: 'தமிழ்',      flag: '🇱🇰' },
  { code: 'de', label: 'German',     nativeLabel: 'Deutsch',    flag: '🇩🇪' },
  { code: 'fr', label: 'French',     nativeLabel: 'Français',   flag: '🇫🇷' },
  { code: 'ru', label: 'Russian',    nativeLabel: 'Русский',    flag: '🇷🇺' },
  { code: 'es', label: 'Spanish',    nativeLabel: 'Español',    flag: '🇪🇸' },
  { code: 'it', label: 'Italian',    nativeLabel: 'Italiano',   flag: '🇮🇹' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português',  flag: '🇧🇷' },
  { code: 'nl', label: 'Dutch',      nativeLabel: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', label: 'Polish',     nativeLabel: 'Polski',     flag: '🇵🇱' },
  { code: 'sv', label: 'Swedish',    nativeLabel: 'Svenska',    flag: '🇸🇪' },
  { code: 'no', label: 'Norwegian',  nativeLabel: 'Norsk',      flag: '🇳🇴' },
  { code: 'da', label: 'Danish',     nativeLabel: 'Dansk',      flag: '🇩🇰' },
  { code: 'el', label: 'Greek',      nativeLabel: 'Ελληνικά',   flag: '🇬🇷' },
  { code: 'tr', label: 'Turkish',    nativeLabel: 'Türkçe',     flag: '🇹🇷' },
  { code: 'uk', label: 'Ukrainian',  nativeLabel: 'Українська', flag: '🇺🇦' },
  { code: 'zh', label: 'Chinese',    nativeLabel: '中文',        flag: '🇨🇳' },
  { code: 'ja', label: 'Japanese',   nativeLabel: '日本語',      flag: '🇯🇵' },
  { code: 'ko', label: 'Korean',     nativeLabel: '한국어',      flag: '🇰🇷' },
];

const STORAGE_KEY = 'tsln_language';

// English translations embedded as a constant so the pipe has data on the very
// first render — before the async HTTP request for the JSON file returns.
const EN_TRANSLATIONS: { [key: string]: string } = {
  'nav.home': 'Home', 'nav.locations': 'Locations', 'nav.events': 'Events',
  'nav.packages': 'Packages',
  'nav.gallery': 'Gallery', 'nav.places': 'Places', 'nav.more': 'More',
  'hero.explore': 'Explore Destinations', 'hero.events': 'View Events',
  'hero.title1': 'Journey Through', 'hero.title2': 'Ancient Sri Lanka',
  'hero.subtitle': 'Experience the majestic heritage and discover the rich culture of an ancient kingdom',
  'section.subtitle.locations': 'Popular Destinations',
  'section.subtitle.events': 'Experiences', 'section.subtitle.places': 'Accommodations',
  'section.subtitle.packages': 'Packages',
  'section.viewAll.locations': 'View All Locations',
  'section.viewAll.events': 'View All Events', 'section.viewAll.places': 'View All Places',
  'section.viewAll.packages': 'View All Packages',
  'common.bookTour': 'Book a Tour', 'common.loading': 'Loading...', 'common.error': 'Something went wrong',
  'loading.tagline': 'Discover the Wonder of Sri Lanka',
  'locations.title': 'Locations', 'locations.search': 'Search locations...',
  'locations.filter.category': 'All Categories', 'locations.filter.region': 'All Regions',
  'events.title': 'Events', 'events.search': 'Search events...',
  'gallery.title': 'Gallery', 'gallery.search': 'Search gallery...',
  'places.title': 'Places', 'places.search': 'Search places...',
  'footer.description': 'Discover the pearl of the Indian Ocean. Explore pristine beaches, ancient temples, lush tea plantations, and vibrant wildlife.',
  'footer.quickLinks': 'Quick Links', 'footer.contact': 'Contact',
  'footer.followUs': 'Follow Us', 'footer.email': 'Email', 'footer.phone': 'Phone',
  'footer.rights': 'All rights reserved', 'footer.tagline': 'Discover the Wonder of Sri Lanka'
};
const BROWSER_LANG_MAP: { [key: string]: string } = {
  si: 'si', ta: 'ta', de: 'de', fr: 'fr', ru: 'ru',
  es: 'es', it: 'it', pt: 'pt', nl: 'nl', pl: 'pl',
  sv: 'sv', no: 'no', da: 'da', el: 'el', tr: 'tr',
  uk: 'uk', zh: 'zh', ja: 'ja', ko: 'ko'
};

// Our language codes → Google Translate codes (only overrides that differ)
const GT_CODE_MAP: { [key: string]: string } = {
  zh: 'zh-CN'
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  // Start with English so the pipe never renders raw keys on first paint.
  private translations: { [key: string]: string } = { ...EN_TRANSLATIONS };
  private currentLangSubject = new BehaviorSubject<string>(this.getInitialLang());
  currentLang$ = this.currentLangSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const lang = this.currentLang;
    if (lang === 'en') {
      this.currentLangSubject.next(lang);
    } else {
      this.loadTranslations(lang).subscribe(() => {
        this.currentLangSubject.next(lang);
      });
      // Apply Google Translate on page load for the saved language.
      // GT widget may not be ready yet — triggerGT retries until the select appears.
      setTimeout(() => this.triggerGT(GT_CODE_MAP[lang] || lang), 800);
    }

    // Re-apply Google Translate after every Angular route change so newly rendered
    // content gets translated (Angular re-renders DOM; GT doesn't know about it).
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      const current = this.currentLang;
      if (current !== 'en') {
        setTimeout(() => this.triggerGT(GT_CODE_MAP[current] || current), 500);
      }
    });
  }

  get currentLang(): string {
    return this.currentLangSubject.getValue();
  }

  get languages(): Language[] {
    return LANGUAGES;
  }

  getCurrentLanguage(): Language {
    return LANGUAGES.find(l => l.code === this.currentLang) || LANGUAGES[0];
  }

  setLanguage(code: string): void {
    if (code === this.currentLang) return;
    localStorage.setItem(STORAGE_KEY, code);
    const applyLang = () => {
      const lang = LANGUAGES.find(l => l.code === code);
      document.documentElement.dir  = lang?.dir || 'ltr';
      document.documentElement.lang = code;
      this.currentLangSubject.next(code);
      if (code === 'en') {
        this.restoreGT();
      } else {
        this.triggerGT(GT_CODE_MAP[code] || code);
      }
    };
    if (code === 'en') {
      this.translations = { ...EN_TRANSLATIONS };
      applyLang();
    } else {
      this.loadTranslations(code).subscribe(() => applyLang());
    }
  }

  private triggerGT(gtCode: string, attempt = 0): void {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (select) {
      select.value = gtCode;
      select.dispatchEvent(new Event('change'));
    } else if (attempt < 20) {
      // GT widget not ready yet — retry every 300 ms (up to 6 s total)
      setTimeout(() => this.triggerGT(gtCode, attempt + 1), 300);
    }
  }

  private restoreGT(): void {
    // GT rewrites the entire DOM — there is no clean programmatic undo.
    // The only reliable restore is: clear the googtrans cookie, then reload.
    // localStorage already holds 'en' at this point, so the reload starts fresh in English.
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${location.hostname}`;
    location.reload();
  }

  translate(key: string): string {
    return this.translations[key] || key;
  }

  private getInitialLang(): string {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES.some(l => l.code === saved)) return saved;
    const browserLang = navigator.language?.split('-')[0];
    return BROWSER_LANG_MAP[browserLang] || 'en';
  }

  private loadTranslations(lang: string): Observable<{ [key: string]: string }> {
    return this.http.get<{ [key: string]: string }>(`assets/i18n/${lang}.json`).pipe(
      tap(t => { this.translations = t; }),
      catchError(() => {
        return this.http.get<{ [key: string]: string }>('assets/i18n/en.json').pipe(
          tap(t => { this.translations = t; })
        );
      })
    );
  }
}
