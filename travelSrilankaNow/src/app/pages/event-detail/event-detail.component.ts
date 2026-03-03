import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { ImageLightboxComponent } from '../../shared/components/image-lightbox/image-lightbox.component';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  loading: boolean = true;
  error: string | null = null;
  selectedImageIndex: number = 0;
  @ViewChild('lightbox') lightbox!: ImageLightboxComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEventDetails(+id);
    } else {
      this.error = 'No event ID provided';
      this.loading = false;
    }
  }

  loadEventDetails(id: number): void {
    this.loading = true;
    this.error = null;

    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
        console.log('Loaded event:', event);
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.error = 'Failed to load event details. Please try again later.';
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
    this.router.navigate(['/events']);
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'cultural': '🏛️',
      'adventure': '⛰️',
      'food': '🍽️',
      'festival': '🎉',
      'tour': '🗺️'
    };
    return icons[category] || '🎯';
  }

  getAvailabilityStatus(): string {
    if (!this.event) return '';

    const available = this.event.availableSpots;
    const max = this.event.maxParticipants;
    const percentage = (available / max) * 100;

    if (percentage > 50) return 'available';
    if (percentage > 20) return 'limited';
    return 'filling-fast';
  }

  getAvailabilityText(): string {
    if (!this.event) return '';

    const available = this.event.availableSpots;

    if (available === 0) return 'Sold Out';
    if (available <= 5) return `Only ${available} spots left!`;
    return `${available} spots available`;
  }
}
