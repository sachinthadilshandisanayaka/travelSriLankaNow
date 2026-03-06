import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaceService } from '../../services/place.service';
import { Place } from '../../models/place.model';
import { ImageLightboxComponent } from '../../shared/components/image-lightbox/image-lightbox.component';
import { DataService } from '../../services/data.service';
import { FieldDefinition } from '../../models/more-section.model';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.component.html',
  styleUrls: ['./place-detail.component.scss']
})
export class PlaceDetailComponent implements OnInit {
  place: Place | null = null;
  loading: boolean = true;
  error: string | null = null;
  selectedImageIndex: number = 0;
  fieldDefinitions: FieldDefinition[] = [];
  @ViewChild('lightbox') lightbox!: ImageLightboxComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private placeService: PlaceService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPlaceDetails(+id);
    } else {
      this.error = 'No place ID provided';
      this.loading = false;
    }
    this.dataService.getEntityFieldConfig('place').subscribe({
      next: (config) => { this.fieldDefinitions = config.fieldDefinitions || []; },
      error: () => {}
    });
  }

  loadPlaceDetails(id: number): void {
    this.loading = true;
    this.error = null;

    this.placeService.getPlaceById(id).subscribe({
      next: (place) => {
        this.place = place;
        this.loading = false;
        console.log('Loaded place:', place);
      },
      error: (error) => {
        console.error('Error loading place:', error);
        this.error = 'Failed to load place details. Please try again later.';
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
    this.router.navigate(['/places']);
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

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'hotel': '🏨',
      'restaurant': '🍽️',
      'cafe': '☕',
      'guesthouse': '🏡',
      'resort': '🏖️'
    };
    return icons[type] || '🏢';
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

  getPriceRangeText(priceRange: string): string {
    const ranges: { [key: string]: string } = {
      '$': 'Budget-friendly',
      '$$': 'Mid-range',
      '$$$': 'Upscale',
      '$$$$': 'Luxury'
    };
    return ranges[priceRange] || priceRange;
  }
}
