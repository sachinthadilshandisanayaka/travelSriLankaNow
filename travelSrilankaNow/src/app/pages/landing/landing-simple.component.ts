import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-landing-simple',
  template: `
    <div style="padding: 40px; background: white;">
      <h1 style="color: #333;">Simple Data Test</h1>

      <div style="margin: 20px 0; padding: 20px; background: #f0f0f0;">
        <h2 style="color: #333;">Locations: {{ locations.length }}</h2>
        <ul>
          <li *ngFor="let loc of locations" style="color: #333; padding: 5px;">
            {{ loc.name }} - {{ loc.category }}
          </li>
        </ul>
      </div>

      <div style="margin: 20px 0; padding: 20px; background: #f0f0f0;">
        <h2 style="color: #333;">Events: {{ events.length }}</h2>
        <ul>
          <li *ngFor="let evt of events" style="color: #333; padding: 5px;">
            {{ evt.title }} - Price: {{ evt.price }}
          </li>
        </ul>
      </div>

      <div style="margin: 20px 0; padding: 20px; background: #f0f0f0;">
        <h2 style="color: #333;">Places: {{ places.length }}</h2>
        <ul>
          <li *ngFor="let place of places" style="color: #333; padding: 5px;">
            {{ place.name }} - {{ place.type }}
          </li>
        </ul>
      </div>
    </div>
  `
})
export class LandingSimpleComponent implements OnInit {
  locations: any[] = [];
  events: any[] = [];
  places: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    console.log('Simple component initialized');

    // Direct HTTP calls
    this.http.get<any>('http://localhost:8080/api/locations?page=0&size=10').subscribe(
      response => {
        console.log('Direct locations response:', response);
        this.locations = response.content || [];
        console.log('Locations array:', this.locations);
      },
      error => console.error('Error:', error)
    );

    this.http.get<any>('http://localhost:8080/api/events?page=0&size=10').subscribe(
      response => {
        console.log('Direct events response:', response);
        this.events = response.content || [];
        console.log('Events array:', this.events);
      },
      error => console.error('Error:', error)
    );

    this.http.get<any>('http://localhost:8080/api/places?page=0&size=10').subscribe(
      response => {
        console.log('Direct places response:', response);
        this.places = response.content || [];
        console.log('Places array:', this.places);
      },
      error => console.error('Error:', error)
    );
  }
}
