import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { FieldDefinition } from '../../models/more-section.model';
import { ContentTypeInfo, ContentItem, HeroSlideGallery } from '../../models/hero-slide.model';

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
  getLocations(page: number = 0, size: number = 10, sort: string = 'name,asc',
               search?: string, category?: string, region?: string): Observable<PageResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) params = params.set('sort', sort);
    if (search) params = params.set('search', search);
    if (category) params = params.set('category', category);
    if (region) params = params.set('region', region);
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
  getEvents(page: number = 0, size: number = 10, sort: string = 'title,asc',
            search?: string, category?: string): Observable<PageResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) params = params.set('sort', sort);
    if (search) params = params.set('search', search);
    if (category) params = params.set('category', category);
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

  // Packages
  getPackagesPaginated(page: number = 0, size: number = 10, sort: string = 'title,asc',
            search?: string, category?: string): Observable<PageResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) params = params.set('sort', sort);
    if (search) params = params.set('search', search);
    if (category) params = params.set('category', category);
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/packages/paginated`, { params });
  }

  getPackage(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/packages/${id}`);
  }

  createPackage(pkg: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/packages`, pkg);
  }

  updatePackage(id: number, pkg: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/packages/${id}`, pkg);
  }

  deletePackage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/packages/${id}`);
  }

  // Places
  getPlaces(page: number = 0, size: number = 10, sort: string = 'name,asc',
            search?: string, type?: string, priceRange?: string): Observable<PageResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) params = params.set('sort', sort);
    if (search) params = params.set('search', search);
    if (type) params = params.set('type', type);
    if (priceRange) params = params.set('priceRange', priceRange);
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

  getMasterDataByTypePaginated(type: string, page: number = 0, size: number = 10,
                                sort: string = 'sortOrder,asc', search?: string): Observable<PageResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) params = params.set('sort', sort);
    if (search) params = params.set('search', search);
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/master-data/type/${type}/paginated`, { params });
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

  upsertSiteSetting(setting: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/site-settings/upsert`, setting);
  }

  getHeroSearchConfig(): Observable<any> {
    return this.http.get(`${this.apiUrl}/site-settings/key/hero_search_bar`).pipe(
      catchError(() => of(null))
    );
  }

  saveHeroSearchConfig(config: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/site-settings/upsert`, {
      category: 'HERO',
      key: 'hero_search_bar',
      label: 'Hero Search Bar Configuration',
      value: JSON.stringify(config),
      isActive: true,
      sortOrder: 0
    });
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
  getMoreSectionItems(sectionId: number, page: number = 0, size: number = 20,
                      search?: string, active?: boolean, contentType?: string): Observable<PageResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (search) params = params.set('search', search);
    if (active !== undefined && active !== null) params = params.set('active', String(active));
    if (contentType) params = params.set('contentType', contentType);
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/more-sections/${sectionId}/items/paginated`, { params });
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

  uploadVideo(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload/video`, formData);
  }

  // Media Library
  getAllMedia(page = 0, size = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}/media`, { params: { page: String(page), size: String(size) } });
  }

  getMediaByType(type: string, page = 0, size = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}/media/type/${type}`, { params: { page: String(page), size: String(size) } });
  }

  searchMedia(query: string, page = 0, size = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}/media/search`, { params: { query, page: String(page), size: String(size) } });
  }

  getMediaStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/media/stats`);
  }

  deleteMedia(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/media/${id}`);
  }

  // Entity Field Configs
  getEntityFieldConfig(entityType: string): Observable<EntityFieldConfig> {
    return this.http.get<EntityFieldConfig>(`${this.apiUrl}/entity-field-configs/${entityType}`);
  }

  upsertEntityFieldConfig(entityType: string, fieldDefinitions: FieldDefinition[]): Observable<EntityFieldConfig> {
    return this.http.put<EntityFieldConfig>(`${this.apiUrl}/entity-field-configs/${entityType}`, fieldDefinitions);
  }

  // Hero Slide Gallery
  getHeroSlideGallery(slideId: number): Observable<HeroSlideGallery> {
    return this.http.get<HeroSlideGallery>(`${this.apiUrl}/hero-slides/${slideId}/gallery`);
  }

  saveHeroSlideGallery(slideId: number, gallery: { enabled: boolean; items: any[] }): Observable<HeroSlideGallery> {
    return this.http.put<HeroSlideGallery>(`${this.apiUrl}/hero-slides/${slideId}/gallery`, gallery);
  }

  // Dynamic Content Types (for gallery image picker)
  getContentTypes(): Observable<ContentTypeInfo[]> {
    return this.http.get<ContentTypeInfo[]>(`${this.apiUrl}/content-types`);
  }

  getContentTypeItems(type: string, page = 0, size = 24, search?: string): Observable<{ content: ContentItem[]; totalElements: number; totalPages: number; page: number }> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (search) params = params.set('search', search);
    return this.http.get<any>(`${this.apiUrl}/content-types/${type}/items`, { params });
  }

  // ─── Companies ───────────────────────────────────────────────────────────────
  getCompanies(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/companies`); }
  getCompany(id: number): Observable<any> { return this.http.get(`${this.apiUrl}/companies/${id}`); }
  getMyCompany(): Observable<any> { return this.http.get(`${this.apiUrl}/companies/my-company`); }
  createCompany(data: any): Observable<any> { return this.http.post(`${this.apiUrl}/companies`, data); }
  updateCompany(id: number, data: any): Observable<any> { return this.http.put(`${this.apiUrl}/companies/${id}`, data); }
  deactivateCompany(id: number): Observable<any> { return this.http.patch(`${this.apiUrl}/companies/${id}/deactivate`, {}); }
  getCompanyUsers(companyId: number): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/companies/${companyId}/users`); }
  addCompanyUser(companyId: number, data: any): Observable<any> { return this.http.post(`${this.apiUrl}/companies/${companyId}/users`, data); }
  removeCompanyUser(companyId: number, userId: number): Observable<any> { return this.http.delete(`${this.apiUrl}/companies/${companyId}/users/${userId}`); }
  getCompanyChangeLog(companyId: number): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/companies/${companyId}/change-log`); }
  uploadCompanyLogo(companyId: number, formData: FormData): Observable<any> { return this.http.post(`${this.apiUrl}/companies/${companyId}/logo`, formData); }
  uploadCompanySignature(companyId: number, formData: FormData): Observable<any> { return this.http.post(`${this.apiUrl}/companies/${companyId}/signature`, formData); }

  // ─── Invoice Templates ────────────────────────────────────────────────────────
  getInvoiceTemplates(companyId?: number): Observable<any[]> {
    const params = companyId ? new HttpParams().set('companyId', String(companyId)) : new HttpParams();
    return this.http.get<any[]>(`${this.apiUrl}/invoice-templates`, { params });
  }
  uploadInvoiceTemplate(formData: FormData): Observable<any> { return this.http.post(`${this.apiUrl}/invoice-templates`, formData); }
  assignInvoiceTemplate(id: number, data: any): Observable<any> { return this.http.put(`${this.apiUrl}/invoice-templates/${id}/assign`, data); }
  removeTemplateAssignment(assignmentId: number): Observable<any> { return this.http.delete(`${this.apiUrl}/invoice-templates/assignments/${assignmentId}`); }
  deactivateInvoiceTemplate(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/invoice-templates/${id}`); }

  // ─── Invoice Forms ────────────────────────────────────────────────────────────
  getInvoiceForms(companyId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/invoice-forms`, { params: new HttpParams().set('companyId', String(companyId)) });
  }
  getInvoiceFormById(id: number): Observable<any> { return this.http.get(`${this.apiUrl}/invoice-forms/${id}`); }
  createInvoiceForm(companyId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/invoice-forms?companyId=${companyId}`, data);
  }
  updateInvoiceForm(id: number, data: any): Observable<any> { return this.http.put(`${this.apiUrl}/invoice-forms/${id}`, data); }
  deactivateInvoiceForm(id: number): Observable<any> { return this.http.patch(`${this.apiUrl}/invoice-forms/${id}/deactivate`, {}); }
  addInvoiceFormField(formId: number, data: any): Observable<any> { return this.http.post(`${this.apiUrl}/invoice-forms/${formId}/fields`, data); }
  updateInvoiceFormField(formId: number, fieldId: number, data: any): Observable<any> { return this.http.put(`${this.apiUrl}/invoice-forms/${formId}/fields/${fieldId}`, data); }
  deleteInvoiceFormField(formId: number, fieldId: number): Observable<any> { return this.http.delete(`${this.apiUrl}/invoice-forms/${formId}/fields/${fieldId}`); }

  // ─── Invoices ─────────────────────────────────────────────────────────────────
  getInvoices(companyId: number, status?: string, page = 0, size = 20): Observable<any> {
    let params = new HttpParams().set('companyId', String(companyId)).set('page', String(page)).set('size', String(size));
    if (status) params = params.set('status', status);
    return this.http.get(`${this.apiUrl}/invoices`, { params });
  }
  getInvoice(id: number): Observable<any> { return this.http.get(`${this.apiUrl}/invoices/${id}`); }
  previewInvoice(data: any): Observable<any> { return this.http.post(`${this.apiUrl}/invoices/preview`, data); }
  generateInvoice(data: any): Observable<any> { return this.http.post(`${this.apiUrl}/invoices`, data); }
  getInvoicePdfUrl(id: number): Observable<any> { return this.http.get(`${this.apiUrl}/invoices/${id}/pdf-url`); }
  sendInvoiceEmail(id: number, data: any): Observable<any> { return this.http.post(`${this.apiUrl}/invoices/${id}/send-email`, data); }
  voidInvoice(id: number, reason?: string): Observable<any> { return this.http.patch(`${this.apiUrl}/invoices/${id}/void`, { reason }); }
  updateInvoiceStatus(id: number, status: string): Observable<any> { return this.http.patch(`${this.apiUrl}/invoices/${id}/status`, { status }); }

}
