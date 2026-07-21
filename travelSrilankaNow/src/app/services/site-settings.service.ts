import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { HeroSearchConfig } from '../models/hero-slide.model';

export interface SiteSetting {
  id: number;
  category: string;
  key: string;
  label: string;
  value: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface SiteSettingsMap {
  [key: string]: string;
}

export interface GroupedSettings {
  [category: string]: SiteSetting[];
}

@Injectable({
  providedIn: 'root'
})
export class SiteSettingsService {
  private apiUrl = `${environment.apiUrl}/site-settings`;
  private settingsCache$: Observable<SiteSetting[]> | null = null;
  private settingsMapCache$: Observable<SiteSettingsMap> | null = null;

  constructor(private http: HttpClient) {}

  getSettings(): Observable<SiteSetting[]> {
    if (!this.settingsCache$) {
      this.settingsCache$ = this.http.get<SiteSetting[]>(this.apiUrl).pipe(
        shareReplay(1),
        catchError(() => of([]))
      );
    }
    return this.settingsCache$;
  }

  getSettingsAsMap(): Observable<SiteSettingsMap> {
    if (!this.settingsMapCache$) {
      this.settingsMapCache$ = this.http.get<SiteSettingsMap>(`${this.apiUrl}/map`).pipe(
        shareReplay(1),
        catchError(() => of({}))
      );
    }
    return this.settingsMapCache$;
  }

  getSettingsGrouped(): Observable<GroupedSettings> {
    return this.http.get<GroupedSettings>(`${this.apiUrl}/grouped`).pipe(
      catchError(() => of({}))
    );
  }

  getSettingsByCategory(category: string): Observable<SiteSetting[]> {
    return this.http.get<SiteSetting[]>(`${this.apiUrl}/category/${category}`).pipe(
      catchError(() => of([]))
    );
  }

  getSettingByKey(key: string): Observable<SiteSetting | null> {
    return this.http.get<SiteSetting>(`${this.apiUrl}/key/${key}`).pipe(
      catchError(() => of(null))
    );
  }

  getSocialMediaLinks(): Observable<SiteSetting[]> {
    return this.getSettingsByCategory('SOCIAL_MEDIA');
  }

  getContactInfo(): Observable<{ email: string; phone: string; address: string }> {
    return this.getSettingsAsMap().pipe(
      map(settings => ({
        email: settings['contact_email'] || '',
        phone: settings['contact_phone'] || '',
        address: settings['contact_address'] || ''
      }))
    );
  }

  getHeroSearchConfig(): Observable<HeroSearchConfig | null> {
    return this.getSettingByKey('hero_search_bar').pipe(
      map(setting => {
        if (!setting?.value) return null;
        try { return JSON.parse(setting.value) as HeroSearchConfig; }
        catch { return null; }
      })
    );
  }

  clearCache(): void {
    this.settingsCache$ = null;
    this.settingsMapCache$ = null;
  }
}
