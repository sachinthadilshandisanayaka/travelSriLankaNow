import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface MasterData {
  id: number;
  type: string;
  code: string;
  displayName: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt?: string;
}

export enum MasterDataType {
  EVENT_CATEGORY = 'EVENT_CATEGORY',
  PACKAGE_CATEGORY = 'PACKAGE_CATEGORY',
  LOCATION_CATEGORY = 'LOCATION_CATEGORY',
  PLACE_TYPE = 'PLACE_TYPE',
  REGION = 'REGION',
  PRICE_RANGE = 'PRICE_RANGE',
  GALLERY_CATEGORY = 'GALLERY_CATEGORY',
  GALLERY_TYPE = 'GALLERY_TYPE',
  CURRENCY = 'CURRENCY'
}

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {
  private apiUrl = `${environment.apiUrl}/master-data`;
  private cache = new Map<string, Observable<MasterData[]>>();
  private allCache = new Map<string, Observable<MasterData[]>>();

  constructor(private http: HttpClient) {}

  getTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/types`);
  }

  getByType(type: MasterDataType | string): Observable<MasterData[]> {
    if (!this.cache.has(type)) {
      const request$ = this.http.get<MasterData[]>(`${this.apiUrl}/type/${type}`).pipe(
        shareReplay(1)
      );
      this.cache.set(type, request$);
    }
    return this.cache.get(type)!;
  }

  // Unfiltered (active + inactive) — use for filter dropdowns that must always
  // list every category regardless of whether "Browse by Category" is toggled on
  getAllByType(type: MasterDataType | string): Observable<MasterData[]> {
    if (!this.allCache.has(type)) {
      const request$ = this.http.get<MasterData[]>(`${this.apiUrl}/type/${type}/all`).pipe(
        shareReplay(1)
      );
      this.allCache.set(type, request$);
    }
    return this.allCache.get(type)!;
  }

  getByTypeAndCode(type: MasterDataType | string, code: string): Observable<MasterData> {
    return this.http.get<MasterData>(`${this.apiUrl}/type/${type}/code/${code}`);
  }

  clearCache(type?: string): void {
    if (type) {
      this.cache.delete(type);
      this.allCache.delete(type);
    } else {
      this.cache.clear();
      this.allCache.clear();
    }
  }

  // Convenience methods for specific types
  getEventCategories(): Observable<MasterData[]> {
    return this.getByType(MasterDataType.EVENT_CATEGORY);
  }

  getPackageCategories(): Observable<MasterData[]> {
    return this.getByType(MasterDataType.PACKAGE_CATEGORY);
  }

  getLocationCategories(): Observable<MasterData[]> {
    return this.getByType(MasterDataType.LOCATION_CATEGORY);
  }

  getPlaceTypes(): Observable<MasterData[]> {
    return this.getByType(MasterDataType.PLACE_TYPE);
  }

  // Unfiltered variants — for filter dropdowns (see getAllByType)
  getAllEventCategories(): Observable<MasterData[]> {
    return this.getAllByType(MasterDataType.EVENT_CATEGORY);
  }

  getAllPackageCategories(): Observable<MasterData[]> {
    return this.getAllByType(MasterDataType.PACKAGE_CATEGORY);
  }

  getAllLocationCategories(): Observable<MasterData[]> {
    return this.getAllByType(MasterDataType.LOCATION_CATEGORY);
  }

  getAllPlaceTypes(): Observable<MasterData[]> {
    return this.getAllByType(MasterDataType.PLACE_TYPE);
  }

  getRegions(): Observable<MasterData[]> {
    return this.getByType(MasterDataType.REGION);
  }

  getPriceRanges(): Observable<MasterData[]> {
    return this.getByType(MasterDataType.PRICE_RANGE);
  }

  getGalleryCategories(): Observable<MasterData[]> {
    return this.getByType(MasterDataType.GALLERY_CATEGORY);
  }

  getGalleryTypes(): Observable<MasterData[]> {
    return this.getByType(MasterDataType.GALLERY_TYPE);
  }

  getCurrencies(): Observable<MasterData[]> {
    return this.getByType(MasterDataType.CURRENCY);
  }
}
