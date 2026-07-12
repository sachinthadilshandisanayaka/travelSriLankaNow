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

@Injectable({ providedIn: 'root' })
export class StorageService {
  private uploadUrl = `${environment.apiUrl}/admin/upload`;

  constructor(private http: HttpClient) {}

  uploadImage(file: File, folder: string = 'travel-sri-lanka'): Observable<UploadProgress> {
    const progress$ = new Subject<UploadProgress>();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    this.http.request(new HttpRequest('POST', `${this.uploadUrl}/image`, formData, { reportProgress: true }))
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            const pct = event.total ? Math.round((event.loaded / event.total) * 100) : 0;
            progress$.next({ progress: pct, status: 'uploading' });
          } else if (event.type === HttpEventType.Response) {
            const body = event.body as UploadResponse;
            if (body.success && body.data) {
              progress$.next({ progress: 100, status: 'completed', url: body.data.url });
            } else {
              progress$.next({ progress: 0, status: 'error', error: body.message || 'Upload failed' });
            }
            progress$.complete();
          }
        },
        error: (err) => {
          progress$.next({ progress: 0, status: 'error', error: err.error?.message || 'Network error' });
          progress$.complete();
        }
      });

    return progress$.asObservable();
  }

  uploadMultipleImages(files: File[], folder: string = 'travel-sri-lanka'): Observable<UploadProgress[]> {
    const results$ = new Subject<UploadProgress[]>();
    const results: UploadProgress[] = files.map(() => ({ progress: 0, status: 'uploading' as const }));
    let done = 0;

    files.forEach((file, i) => {
      this.uploadImage(file, folder).subscribe({
        next: (p) => { results[i] = p; results$.next([...results]); },
        complete: () => { if (++done === files.length) results$.complete(); }
      });
    });

    return results$.asObservable();
  }
}
