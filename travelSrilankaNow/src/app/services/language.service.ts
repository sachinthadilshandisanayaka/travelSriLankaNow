import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

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
  { code: 'zh', label: 'Chinese',    nativeLabel: '中文',        flag: '🇨🇳' },
  { code: 'ja', label: 'Japanese',   nativeLabel: '日本語',      flag: '🇯🇵' },
  { code: 'ko', label: 'Korean',     nativeLabel: '한국어',      flag: '🇰🇷' },
  { code: 'ar', label: 'Arabic',     nativeLabel: 'العربية',    flag: '🇸🇦', dir: 'rtl' }
];

const STORAGE_KEY = 'tsln_language';
const BROWSER_LANG_MAP: { [key: string]: string } = {
  si: 'si', ta: 'ta', de: 'de', fr: 'fr', ru: 'ru',
  es: 'es', it: 'it', pt: 'pt', zh: 'zh', ja: 'ja', ko: 'ko', ar: 'ar'
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translations: { [key: string]: string } = {};
  private currentLangSubject = new BehaviorSubject<string>(this.getInitialLang());
  currentLang$ = this.currentLangSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTranslations(this.currentLang).subscribe(() => {
      this.currentLangSubject.next(this.currentLang);
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
    this.loadTranslations(code).subscribe(() => {
      this.currentLangSubject.next(code);
      const lang = LANGUAGES.find(l => l.code === code);
      document.documentElement.dir = lang?.dir || 'ltr';
      document.documentElement.lang = code;
    });
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
