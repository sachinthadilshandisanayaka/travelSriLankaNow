import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEntityFieldConfig(entityType: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/entity-field-configs/${entityType}`);
  }
}
