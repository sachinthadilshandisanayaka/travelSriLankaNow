import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { Location } from '../../models/location.model';
import { ImageLightboxComponent } from '../../shared/components/image-lightbox/image-lightbox.component';

@Component({
  selector: 'app-location-detail',
  templateUrl: './location-detail.component.html',
  styleUrls: ['./location-detail.component.scss']
})
export class LocationDetailComponent implements OnInit {
  location: Location | null = null;
  loading: boolean = true;
  error: string | null = null;
  selectedImageIndex: number = 0;
  @ViewChild('lightbox') lightbox!: ImageLightboxComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private locationService: LocationService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadLocationDetails(+id);
    } else {
      this.error = 'No location ID provided';
      this.loading = false;
    }
  }

  loadLocationDetails(id: number): void {
    this.loading = true;
    this.error = null;

    this.locationService.getLocationById(id).subscribe({
      next: (location) => {
        this.location = location;
        this.loading = false;
        console.log('Loaded location:', location);
      },
      error: (error) => {
        console.error('Error loading location:', error);
        this.error = 'Failed to load location details. Please try again later.';
        this.loading = false;
      }
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  openLightbox(index: number): void {
    if (this.lightbox) {
      this.lightbox.open(index);
    }
  }

  goBack(): void {
    this.router.navigate(['/locations']);
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'beach': '🏖️',
      'mountain': '⛰️',
      'cultural': '🏛️',
      'wildlife': '🦁',
      'city': '🏙️'
    };
    return icons[category] || '📍';
  }

  getRegionName(region: string): string {
    const regions: { [key: string]: string } = {
      'north': 'Northern Province',
      'south': 'Southern Province',
      'east': 'Eastern Province',
      'west': 'Western Province',
      'central': 'Central Province'
    };
    return regions[region] || region;
  }
}
