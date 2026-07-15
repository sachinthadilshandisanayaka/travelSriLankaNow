import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Branding {
  siteName: string;
  logoUrl: string | null;
  tagline: string;
}

const DEFAULTS: Branding = {
  siteName: 'Admin Panel',
  logoUrl: null,
  tagline: ''
};

@Injectable({ providedIn: 'root' })
export class BrandingService {
  private readonly publicUrl = `${environment.apiUrl.replace('/admin', '')}/site-settings/map`;
  private state = new BehaviorSubject<Branding>(DEFAULTS);

  readonly branding$: Observable<Branding> = this.state.asObservable();

  constructor(private http: HttpClient) {
    this.load();
  }

  get snapshot(): Branding {
    return this.state.getValue();
  }

  private load(): void {
    this.http.get<Record<string, string>>(this.publicUrl).pipe(
      tap(map => {
        this.state.next({
          siteName: map['site_name'] || DEFAULTS.siteName,
          logoUrl:  map['logo_url']  || null,
          tagline:  map['site_tagline'] || ''
        });
      }),
      catchError(() => of(null))
    ).subscribe();
  }
}
