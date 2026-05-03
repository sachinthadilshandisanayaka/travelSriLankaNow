import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FieldDefinition } from '../../models/more-section.model';

export interface EntityFieldConfig {
  id?: number;
  entityType: string;
  fieldDefinitions: FieldDefinition[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Locations
  getLocations(page: number = 0, size: number = 10, sort: string = 'name,asc'): Observable<PageResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/locations/paginated`, { params });
  }

  getLocation(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/locations/${id}`);
  }

  createLocation(location: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/locations`, location);
  }

  updateLocation(id: number, location: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/locations/${id}`, location);
  }

  deleteLocation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/locations/${id}`);
  }

  // Events
  getEvents(page: number = 0, size: number = 10, sort: string = 'title,asc'): Observable<PageResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/events/paginated`, { params });
  }

  getEvent(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/events/${id}`);
  }

  createEvent(event: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/events`, event);
  }

  updateEvent(id: number, event: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/events/${id}`, event);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${id}`);
  }

  // Places
  getPlaces(page: number = 0, size: number = 10, sort: string = 'name,asc'): Observable<PageResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/places/paginated`, { params });
  }

  getPlace(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/places/${id}`);
  }

  createPlace(place: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/places`, place);
  }

  updatePlace(id: number, place: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/places/${id}`, place);
  }

  deletePlace(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/places/${id}`);
  }

  // Gallery
  getGalleryItems(page: number = 0, size: number = 10, sort: string = 'uploadDate,desc'): Observable<PageResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/gallery/paginated`, { params });
  }

  getGalleryItem(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/gallery/${id}`);
  }

  createGalleryItem(item: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/gallery`, item);
  }

  updateGalleryItem(id: number, item: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/gallery/${id}`, item);
  }

  deleteGalleryItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/gallery/${id}`);
  }

  // Master Data
  getMasterData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/master-data`);
  }

  getMasterDataTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/master-data/types`);
  }

  getMasterDataByType(type: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/master-data/type/${type}`);
  }

  getMasterDataById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/master-data/${id}`);
  }

  createMasterData(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/master-data`, data);
  }

  updateMasterData(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/master-data/${id}`, data);
  }

  deleteMasterData(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/master-data/${id}`);
  }

  toggleMasterDataActive(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/master-data/${id}/toggle-active`, {});
  }

  // Site Settings
  getSiteSettings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/site-settings`);
  }

  getSiteSettingById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/site-settings/${id}`);
  }

  createSiteSetting(setting: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/site-settings`, setting);
  }

  updateSiteSetting(id: number, setting: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/site-settings/${id}`, setting);
  }

  deleteSiteSetting(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/site-settings/${id}`);
  }

  toggleSiteSettingStatus(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/site-settings/${id}/toggle-status`, {});
  }

  // Hero Slides
  getHeroSlides(page: number = 0, size: number = 10, sort: string = 'displayOrder,asc'): Observable<PageResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/hero-slides/paginated`, { params });
  }

  getHeroSlide(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/hero-slides/${id}`);
  }

  createHeroSlide(slide: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/hero-slides`, slide);
  }

  updateHeroSlide(id: number, slide: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/hero-slides/${id}`, slide);
  }

  deleteHeroSlide(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/hero-slides/${id}`);
  }

  toggleHeroSlideActive(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/hero-slides/${id}/toggle-active`, {});
  }

  updateHeroSlideOrder(id: number, displayOrder: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/hero-slides/${id}/order`, { displayOrder });
  }

  // Page Header Backgrounds
  getAllPageHeaderBackgrounds(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/page-header-backgrounds`);
  }

  getPageHeaderBackgroundsByType(pageType: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/page-header-backgrounds/type/${pageType}`);
  }

  getPageHeaderBackground(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/page-header-backgrounds/${id}`);
  }

  createPageHeaderBackground(background: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/page-header-backgrounds`, background);
  }

  updatePageHeaderBackground(id: number, background: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/page-header-backgrounds/${id}`, background);
  }

  deletePageHeaderBackground(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/page-header-backgrounds/${id}`);
  }

  activatePageHeaderBackground(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/page-header-backgrounds/${id}/activate`, {});
  }

  deactivatePageHeaderBackground(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/page-header-backgrounds/${id}/deactivate`, {});
  }

  // Social Media Content
  getSocialMediaContent(page: number = 0, size: number = 10, sort: string = 'displayOrder,asc'): Observable<PageResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/social-media-content/paginated`, { params });
  }

  getSocialMediaContentById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/social-media-content/${id}`);
  }

  createSocialMediaContent(content: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/social-media-content`, content);
  }

  updateSocialMediaContent(id: number, content: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/social-media-content/${id}`, content);
  }

  deleteSocialMediaContent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/social-media-content/${id}`);
  }

  toggleSocialMediaContentActive(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/social-media-content/${id}/toggle-active`, {});
  }

  updateSocialMediaContentOrder(id: number, displayOrder: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/social-media-content/${id}/order`, { displayOrder });
  }

  // Homepage Sections
  getHomepageSections(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/homepage-sections`);
  }

  getHomepageSectionById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/homepage-sections/${id}`);
  }

  createHomepageSection(section: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/homepage-sections`, section);
  }

  updateHomepageSection(id: number, section: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/homepage-sections/${id}`, section);
  }

  deleteHomepageSection(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/homepage-sections/${id}`);
  }

  toggleHomepageSectionActive(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/homepage-sections/${id}/toggle-active`, {});
  }

  reorderHomepageSections(sectionIds: number[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/homepage-sections/reorder`, sectionIds);
  }

  // More Sections
  getMoreSections(page: number = 0, size: number = 10, sort: string = 'displayOrder,asc'): Observable<PageResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/more-sections/paginated`, { params });
  }

  getMoreSection(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/more-sections/${id}`);
  }

  createMoreSection(section: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/more-sections`, section);
  }

  updateMoreSection(id: number, section: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/more-sections/${id}`, section);
  }

  deleteMoreSection(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/more-sections/${id}`);
  }

  toggleMoreSectionActive(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/more-sections/${id}/toggle-active`, {});
  }

  // Profile
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }

  changePassword(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile/password`, data);
  }

  // More Section Items
  getMoreSectionItems(sectionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/more-sections/${sectionId}/items`);
  }

  createMoreSectionItem(sectionId: number, item: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/more-sections/${sectionId}/items`, item);
  }

  updateMoreSectionItem(itemId: number, item: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/more-sections/items/${itemId}`, item);
  }

  deleteMoreSectionItem(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/more-sections/items/${itemId}`);
  }

  toggleMoreSectionItemActive(itemId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/more-sections/items/${itemId}/toggle-active`, {});
  }

  // File Upload
  uploadImage(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload/image`, formData);
  }

  // Entity Field Configs
  getEntityFieldConfig(entityType: string): Observable<EntityFieldConfig> {
    return this.http.get<EntityFieldConfig>(`${this.apiUrl}/entity-field-configs/${entityType}`);
  }

  upsertEntityFieldConfig(entityType: string, fieldDefinitions: FieldDefinition[]): Observable<EntityFieldConfig> {
    return this.http.put<EntityFieldConfig>(`${this.apiUrl}/entity-field-configs/${entityType}`, fieldDefinitions);
  }
}
