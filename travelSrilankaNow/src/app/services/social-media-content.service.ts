import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SocialMediaContent } from '../models/social-media-content.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocialMediaContentService {
  private apiUrl = `${environment.apiUrl}/social-media-content`;

  constructor(private http: HttpClient) { }

  getActiveSocialMediaContent(): Observable<SocialMediaContent[]> {
    return this.http.get<SocialMediaContent[]>(this.apiUrl);
  }
}
