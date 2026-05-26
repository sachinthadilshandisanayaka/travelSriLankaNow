import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { Location } from '../../models/location.model';
import { ImageLightboxComponent } from '../../shared/components/image-lightbox/image-lightbox.component';
import { DataService } from '../../services/data.service';
import { FieldDefinition } from '../../models/more-section.model';

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
  fieldDefinitions: FieldDefinition[] = [];
  @ViewChild('lightbox') lightbox!: ImageLightboxComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private locationService: LocationService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      if (/^\d+$/.test(slug)) {
        this.loadLocationDetails(+slug);
      } else {
        this.loadLocationDetailsBySlug(slug);
      }
    } else {
      this.error = 'No location provided';
      this.loading = false;
    }
    this.dataService.getEntityFieldConfig('location').subscribe({
      next: (config) => { this.fieldDefinitions = config.fieldDefinitions || []; },
      error: () => {}
    });
  }

  loadLocationDetailsBySlug(slug: string): void {
    this.loading = true;
    this.error = null;
    this.locationService.getLocationBySlug(slug).subscribe({
      next: (location) => { this.location = location; this.loading = false; },
      error: () => { this.error = 'Failed to load location details. Please try again later.'; this.loading = false; }
    });
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

  hasDetails(entity: any): boolean {
    if (!entity?.additionalDetails) return false;
    return Object.keys(entity.additionalDetails).some(key => this.isNonEmpty(entity.additionalDetails[key]));
  }

  isNonEmpty(value: any): boolean {
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') {
      return Object.values(value).some(v => v !== null && v !== undefined && v !== '');
    }
    return true;
  }

  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
      if (value.from !== undefined && value.to !== undefined) return `${value.from || '?'} - ${value.to || '?'}`;
      if (value.min !== undefined && value.max !== undefined) return `${value.min !== null ? value.min : '?'} - ${value.max !== null ? value.max : '?'}`;
    }
    return String(value);
  }

  getFieldLabel(key: string): string {
    const def = this.fieldDefinitions.find(d => d.key === key);
    return def?.label || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  isLinkField(key: string): boolean {
    const def = this.fieldDefinitions.find(d => d.key === key);
    return def?.type === 'link';
  }

  getLinkHref(value: any): string {
    if (!value) return '#';
    return typeof value === 'object' ? (value.url || '#') : value;
  }

  getLinkText(value: any): string {
    if (!value) return '';
    if (typeof value === 'object') return value.displayName || value.url || '';
    return value;
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
