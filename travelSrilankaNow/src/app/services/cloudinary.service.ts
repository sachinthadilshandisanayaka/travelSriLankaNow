import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private uploadUrl = `${environment.apiUrl}/admin/upload`;

  constructor(private http: HttpClient) {}

  uploadImage(file: File, folder: string = 'travel-sri-lanka'): Observable<UploadProgress> {
    const progressSubject = new Subject<UploadProgress>();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const request = new HttpRequest('POST', `${this.uploadUrl}/image`, formData, {
      reportProgress: true
    });

    this.http.request(request).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = event.total ? Math.round((event.loaded / event.total) * 100) : 0;
          progressSubject.next({
            progress,
            status: 'uploading'
          });
        } else if (event.type === HttpEventType.Response) {
          const response = event.body as UploadResponse;
          if (response.success && response.data) {
            progressSubject.next({
              progress: 100,
              status: 'completed',
              url: response.data.url
            });
          } else {
            progressSubject.next({
              progress: 0,
              status: 'error',
              error: response.message || 'Upload failed'
            });
          }
          progressSubject.complete();
        }
      },
      error: (error) => {
        progressSubject.next({
          progress: 0,
          status: 'error',
          error: error.error?.message || 'Network error occurred'
        });
        progressSubject.complete();
      }
    });

    return progressSubject.asObservable();
  }

  uploadMultipleImages(files: File[], folder: string = 'travel-sri-lanka'): Observable<UploadProgress[]> {
    const resultsSubject = new Subject<UploadProgress[]>();
    const results: UploadProgress[] = new Array(files.length).fill(null).map(() => ({
      progress: 0,
      status: 'uploading' as const
    }));

    let completedCount = 0;

    files.forEach((file, index) => {
      this.uploadImage(file, folder).subscribe({
        next: (progress) => {
          results[index] = progress;
          resultsSubject.next([...results]);
        },
        complete: () => {
          completedCount++;
          if (completedCount === files.length) {
            resultsSubject.complete();
          }
        }
      });
    });

    return resultsSubject.asObservable();
  }

  getOptimizedUrl(url: string, width?: number, height?: number, quality: number = 80): string {
    if (!url || !url.includes('cloudinary.com')) {
      return url;
    }

    const transformations: string[] = [`q_${quality}`, 'f_auto'];

    if (width) {
      transformations.push(`w_${width}`);
    }
    if (height) {
      transformations.push(`h_${height}`);
    }
    transformations.push('c_fill');

    const parts = url.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
    }

    return url;
  }

  getThumbnailUrl(url: string, size: number = 150): string {
    return this.getOptimizedUrl(url, size, size, 70);
  }
}
