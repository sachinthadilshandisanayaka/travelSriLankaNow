import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Media, MediaType, UploadProgress, CropData, MediaStats } from '../models/media.model';

/**
 * Service for managing media files through the admin API.
 * Provides upload, edit, and management functionality.
 */
@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private apiUrl = `${environment.apiUrl}/admin/media`;

  // Observable for tracking active uploads
  private uploadProgress$ = new BehaviorSubject<UploadProgress[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * Get the current upload progress observable.
   */
  getUploadProgress(): Observable<UploadProgress[]> {
    return this.uploadProgress$.asObservable();
  }

  /**
   * Upload a single image with progress tracking.
   */
  uploadImage(
    file: File,
    mediaType: MediaType,
    altText?: string,
    caption?: string
  ): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mediaType', mediaType);
    if (altText) formData.append('altText', altText);
    if (caption) formData.append('caption', caption);

    const progress$ = new Subject<UploadProgress>();
    const uploadItem: UploadProgress = {
      file,
      progress: 0,
      status: 'pending'
    };

    const req = new HttpRequest('POST', `${this.apiUrl}/upload`, formData, {
      reportProgress: true
    });

    this.http.request(req).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          uploadItem.progress = Math.round((100 * event.loaded) / (event.total || 1));
          uploadItem.status = 'uploading';
          progress$.next({ ...uploadItem });
        } else if (event.type === HttpEventType.Response) {
          if (event.body?.success) {
            uploadItem.progress = 100;
            uploadItem.status = 'completed';
            uploadItem.media = event.body.data;
            progress$.next({ ...uploadItem });
            progress$.complete();
          } else {
            uploadItem.status = 'error';
            uploadItem.error = event.body?.message || 'Upload failed';
            progress$.next({ ...uploadItem });
            progress$.error(new Error(uploadItem.error));
          }
        }
      },
      error: (err) => {
        uploadItem.status = 'error';
        uploadItem.error = err.message || 'Upload failed';
        progress$.next({ ...uploadItem });
        progress$.error(err);
      }
    });

    return progress$.asObservable();
  }

  /**
   * Upload image with transformation (crop, rotate).
   */
  uploadWithTransformation(
    file: File,
    mediaType: MediaType,
    cropData?: CropData,
    rotate?: number,
    altText?: string
  ): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mediaType', mediaType);
    if (cropData) {
      formData.append('cropX', cropData.x.toString());
      formData.append('cropY', cropData.y.toString());
      formData.append('cropWidth', cropData.width.toString());
      formData.append('cropHeight', cropData.height.toString());
    }
    if (rotate) formData.append('rotate', rotate.toString());
    if (altText) formData.append('altText', altText);

    const progress$ = new Subject<UploadProgress>();
    const uploadItem: UploadProgress = {
      file,
      progress: 0,
      status: 'pending'
    };

    const req = new HttpRequest('POST', `${this.apiUrl}/upload/transform`, formData, {
      reportProgress: true
    });

    this.http.request(req).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          uploadItem.progress = Math.round((100 * event.loaded) / (event.total || 1));
          uploadItem.status = 'uploading';
          progress$.next({ ...uploadItem });
        } else if (event.type === HttpEventType.Response) {
          if (event.body?.success) {
            uploadItem.progress = 100;
            uploadItem.status = 'completed';
            uploadItem.media = event.body.data;
            progress$.next({ ...uploadItem });
            progress$.complete();
          } else {
            uploadItem.status = 'error';
            uploadItem.error = event.body?.message || 'Upload failed';
            progress$.next({ ...uploadItem });
            progress$.error(new Error(uploadItem.error));
          }
        }
      },
      error: (err) => {
        uploadItem.status = 'error';
        uploadItem.error = err.message || 'Upload failed';
        progress$.next({ ...uploadItem });
        progress$.error(err);
      }
    });

    return progress$.asObservable();
  }

  /**
   * Upload multiple images.
   */
  uploadMultiple(files: File[], mediaType: MediaType): Observable<UploadProgress[]> {
    const progress$ = new Subject<UploadProgress[]>();
    const uploads: UploadProgress[] = files.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const
    }));

    let completedCount = 0;

    files.forEach((file, index) => {
      this.uploadImage(file, mediaType).subscribe({
        next: (progress) => {
          uploads[index] = progress;
          progress$.next([...uploads]);
        },
        complete: () => {
          completedCount++;
          if (completedCount === files.length) {
            progress$.complete();
          }
        },
        error: () => {
          completedCount++;
          if (completedCount === files.length) {
            progress$.complete();
          }
        }
      });
    });

    return progress$.asObservable();
  }

  /**
   * Replace an existing image.
   */
  replaceImage(mediaId: number, file: File): Observable<Media> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.put<any>(`${this.apiUrl}/${mediaId}/replace`, formData).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message);
      })
    );
  }

  /**
   * Update media metadata.
   */
  updateMetadata(id: number, updates: { altText?: string; caption?: string; sortOrder?: number }): Observable<Media> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, updates).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message);
      })
    );
  }

  /**
   * Link media to an entity.
   */
  linkToEntity(mediaId: number, entityType: string, entityId: number): Observable<void> {
    return this.http.post<any>(`${this.apiUrl}/${mediaId}/link`, { entityType, entityId }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
      })
    );
  }

  /**
   * Get media by ID.
   */
  getById(id: number): Observable<Media> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message);
      })
    );
  }

  /**
   * Get all media with pagination.
   */
  getAll(page: number = 0, size: number = 20): Observable<{ data: Media[]; total: number; pages: number }> {
    return this.http.get<any>(`${this.apiUrl}`, { params: { page: page.toString(), size: size.toString() } }).pipe(
      map(response => ({
        data: response.data || [],
        total: response.totalElements || 0,
        pages: response.totalPages || 0
      }))
    );
  }

  /**
   * Get media by type.
   */
  getByType(type: MediaType, page: number = 0, size: number = 20): Observable<{ data: Media[]; total: number; pages: number }> {
    return this.http.get<any>(`${this.apiUrl}/type/${type}`, { params: { page: page.toString(), size: size.toString() } }).pipe(
      map(response => ({
        data: response.data || [],
        total: response.totalElements || 0,
        pages: response.totalPages || 0
      }))
    );
  }

  /**
   * Search media.
   */
  search(query: string, page: number = 0, size: number = 20): Observable<{ data: Media[]; total: number; pages: number }> {
    return this.http.get<any>(`${this.apiUrl}/search`, { params: { query, page: page.toString(), size: size.toString() } }).pipe(
      map(response => ({
        data: response.data || [],
        total: response.totalElements || 0,
        pages: response.totalPages || 0
      }))
    );
  }

  /**
   * Get recent uploads.
   */
  getRecentUploads(): Observable<Media[]> {
    return this.http.get<any>(`${this.apiUrl}/recent`).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Get media for a specific entity.
   */
  getForEntity(entityType: string, entityId: number): Observable<Media[]> {
    return this.http.get<any>(`${this.apiUrl}/entity/${entityType}/${entityId}`).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Get storage statistics.
   */
  getStats(): Observable<MediaStats> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get transformed URL for an image.
   */
  getTransformedUrl(
    mediaId: number,
    options: { width?: number; height?: number; quality?: number; crop?: string }
  ): Observable<string> {
    const params: any = {};
    if (options.width) params.width = options.width.toString();
    if (options.height) params.height = options.height.toString();
    if (options.quality) params.quality = options.quality.toString();
    if (options.crop) params.crop = options.crop;

    return this.http.get<any>(`${this.apiUrl}/${mediaId}/transform`, { params }).pipe(
      map(response => response.url)
    );
  }

  /**
   * Delete media permanently.
   */
  delete(id: number): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
      })
    );
  }

  /**
   * Soft delete (deactivate) media.
   */
  softDelete(id: number): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/${id}/soft`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
      })
    );
  }

  /**
   * Cleanup unused media.
   */
  cleanupUnused(daysOld: number = 30): Observable<number> {
    return this.http.post<any>(`${this.apiUrl}/cleanup`, null, { params: { daysOld: daysOld.toString() } }).pipe(
      map(response => response.deletedCount || 0)
    );
  }

  /**
   * Validate file before upload.
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    return { valid: true };
  }

  /**
   * Format file size for display.
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
