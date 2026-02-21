import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaceService } from '../../services/place.service';
import { Place } from '../../models/place.model';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private placeService: PlaceService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPlaceDetails(+id);
    } else {
      this.error = 'No place ID provided';
      this.loading = false;
    }
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

  goBack(): void {
    this.router.navigate(['/places']);
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
