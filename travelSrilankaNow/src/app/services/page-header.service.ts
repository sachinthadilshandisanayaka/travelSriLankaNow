import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { PageHeaderBackground, PageType } from '../models/page-header-background.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PageHeaderService {
  private apiUrl = `${environment.apiUrl}/public/page-header-backgrounds`;
  private cache = new Map<string, PageHeaderBackground>();

  constructor(private http: HttpClient) { }

  /**
   * Get the active background for a specific page type.
   * Results are cached to avoid repeated API calls.
   */
  getActiveBackground(pageType: string): Observable<PageHeaderBackground | null> {
    const cacheKey = pageType.toUpperCase();

    // Return cached result if available
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey)!);
    }

    return this.http.get<PageHeaderBackground>(`${this.apiUrl}/${cacheKey}`).pipe(
      tap(bg => {
        if (bg) {
          this.cache.set(cacheKey, bg);
        }
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Clear the cache. Call this when backgrounds are updated in admin panel.
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear cache for a specific page type.
   */
  clearCacheForType(pageType: PageType): void {
    this.cache.delete(pageType);
  }
}
