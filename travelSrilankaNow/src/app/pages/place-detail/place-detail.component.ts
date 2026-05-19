import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { PlaceService } from '../../services/place.service';
import { Place } from '../../models/place.model';
import { ImageLightboxComponent } from '../../shared/components/image-lightbox/image-lightbox.component';
import { DataService } from '../../services/data.service';
import { FieldDefinition } from '../../models/more-section.model';
import { environment } from '../../../environments/environment';
import { CustomerAuthService, CustomerUser, RegisterRequest } from '../../services/customer-auth.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.component.html',
  styleUrls: ['./place-detail.component.scss']
})
export class PlaceDetailComponent implements OnInit, OnDestroy {
  place: Place | null = null;
  loading: boolean = true;
  error: string | null = null;
  selectedImageIndex: number = 0;
  fieldDefinitions: FieldDefinition[] = [];
  currentUser: CustomerUser | null = null;
  private userSub!: Subscription;
  @ViewChild('lightbox') lightbox!: ImageLightboxComponent;

  // Reservation modal
  showReservationModal = false;
  reservationStep: 'auth' | 'form' | 'success' = 'form';
  reservationLoading = false;
  reservationError = '';
  reservationReference = '';
  blockedDates: string[] = [];

  reservation = {
    visitorName: '',
    email: '',
    phone: '',
    checkInDate: '',
    checkOutDate: '',
    visitDate: '',
    preferredTime: '',
    partySize: 1,
    message: ''
  };

  // Inline auth state
  authTab: 'login' | 'register' = 'login';
  authUsername = '';
  authPassword = '';
  authEmail = '';
  authFirstName = '';
  authLastName = '';
  authPhone = '';
  authConfirmPassword = '';
  authLoading = false;
  authError = '';

  readonly TIME_SLOTS = [
    '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM',
    '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM',
    '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM',
    '07:00 PM', '08:00 PM', '09:00 PM'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private placeService: PlaceService,
    private dataService: DataService,
    private customerAuthService: CustomerAuthService
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
    this.userSub = this.customerAuthService.currentUser$.subscribe(u => {
      this.currentUser = u;
    });
  }

  ngOnDestroy(): void {
    if (this.userSub) this.userSub.unsubscribe();
    document.body.style.overflow = '';
  }

  loadPlaceDetails(id: number): void {
    this.loading = true;
    this.error = null;

    this.placeService.getPlaceById(id).subscribe({
      next: (place) => {
        this.place = place;
        this.loading = false;
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

  getLinkHref(value: any): string {
    if (!value) return '#';
    return typeof value === 'object' ? (value.url || '#') : value;
  }

  getLinkText(value: any): string {
    if (!value) return '';
    if (typeof value === 'object') return value.displayName || value.url || '';
    return value;
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

  get isAccommodation(): boolean {
    return ['hotel', 'guesthouse', 'resort'].includes(this.place?.type || '');
  }

  get isDining(): boolean {
    return ['restaurant', 'cafe'].includes(this.place?.type || '');
  }

  get reservationModalTitle(): string {
    if (this.reservationStep === 'auth') return 'Sign in to Continue';
    if (this.isAccommodation) return 'Book a Stay';
    if (this.isDining) return 'Reserve a Table';
    return 'Make a Reservation';
  }

  get todayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // ── Blocked dates ─────────────────────────────────────────────────────────

  fetchBlockedDates(year: number, month: number): void {
    if (!this.place) return;
    const params = `bookingType=PLACE&entityId=${this.place.id}&year=${year}&month=${month + 1}`;
    this.http.get<string[]>(`${environment.apiUrl}/availability/blocked-dates?${params}`).subscribe({
      next: (dates) => {
        // Merge with existing blocked dates (cover current + next month on desktop)
        const combined = new Set([...this.blockedDates, ...dates]);
        this.blockedDates = Array.from(combined);
      },
      error: () => {}
    });
  }

  onMonthChange(event: { year: number; month: number }): void {
    this.fetchBlockedDates(event.year, event.month);
    // Also fetch the next month (right calendar on desktop)
    const next = event.month === 11
      ? { year: event.year + 1, month: 0 }
      : { year: event.year, month: event.month + 1 };
    this.fetchBlockedDates(next.year, next.month);
  }

  // ── Date range picker callbacks ───────────────────────────────────────────

  onStayDatesApply(range: { start: string; end: string }): void {
    this.reservation.checkInDate = range.start;
    this.reservation.checkOutDate = range.end;
  }

  onVisitDateApply(range: { start: string; end: string }): void {
    this.reservation.visitDate = range.start;
  }

  // ── Modal lifecycle ───────────────────────────────────────────────────────

  openReservationModal(): void {
    this.reservationError = '';
    this.reservation = {
      visitorName: '', email: '', phone: '',
      checkInDate: '', checkOutDate: '',
      visitDate: '', preferredTime: '',
      partySize: 1, message: ''
    };

    if (!this.customerAuthService.isLoggedIn()) {
      this.reservationStep = 'auth';
      this.authTab = 'login';
      this.resetAuthFields();
    } else {
      this.reservationStep = 'form';
      // Pre-fill from the reactively-tracked current user (already correct after login)
      if (this.currentUser) {
        this.reservation.visitorName = `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim();
        this.reservation.email = this.currentUser.email || '';
        this.reservation.phone = this.currentUser.phoneNumber || '';
      }
    }

    this.showReservationModal = true;
    document.body.style.overflow = 'hidden';

    // Pre-load blocked dates for current + next month
    this.blockedDates = [];
    const now = new Date();
    this.fetchBlockedDates(now.getFullYear(), now.getMonth());
    const nextMonth = now.getMonth() === 11
      ? { year: now.getFullYear() + 1, month: 0 }
      : { year: now.getFullYear(), month: now.getMonth() + 1 };
    this.fetchBlockedDates(nextMonth.year, nextMonth.month);
  }

  closeReservationModal(): void {
    this.showReservationModal = false;
    document.body.style.overflow = '';
  }

  // ── Inline auth ───────────────────────────────────────────────────────────

  switchAuthTab(tab: 'login' | 'register'): void {
    this.authTab = tab;
    this.authError = '';
    this.resetAuthFields();
  }

  loginInline(): void {
    if (!this.authUsername.trim() || !this.authPassword) {
      this.authError = 'Please enter username and password.';
      return;
    }
    this.authLoading = true;
    this.authError = '';
    this.customerAuthService.login(this.authUsername.trim(), this.authPassword).subscribe({
      next: (res) => {
        if (res.success) {
          // Wait for the full profile to arrive (id !== 0) before pre-filling
          this.customerAuthService.currentUser$.pipe(
            filter(u => !!u && u.id !== 0),
            take(1)
          ).subscribe(user => {
            this.authLoading = false;
            this.reservationStep = 'form';
            this.reservation.visitorName = `${user!.firstName} ${user!.lastName}`.trim();
            this.reservation.email = user!.email || '';
            this.reservation.phone = user!.phoneNumber || '';
          });
        } else {
          this.authLoading = false;
          this.authError = res.message || 'Login failed. Please try again.';
        }
      },
      error: () => {
        this.authLoading = false;
        this.authError = 'Invalid username or password.';
      }
    });
  }

  registerInline(): void {
    if (!this.authUsername.trim() || !this.authEmail.trim() || !this.authPassword) {
      this.authError = 'Please fill in all required fields.';
      return;
    }
    if (this.authPassword !== this.authConfirmPassword) {
      this.authError = 'Passwords do not match.';
      return;
    }
    if (this.authPassword.length < 6) {
      this.authError = 'Password must be at least 6 characters.';
      return;
    }
    this.authLoading = true;
    this.authError = '';
    const req: RegisterRequest = {
      username: this.authUsername.trim(),
      email: this.authEmail.trim(),
      password: this.authPassword,
      firstName: this.authFirstName.trim(),
      lastName: this.authLastName.trim(),
      phoneNumber: this.authPhone.trim()
    };
    this.customerAuthService.register(req).subscribe({
      next: (res) => {
        if (res.success) {
          this.customerAuthService.currentUser$.pipe(
            filter(u => !!u && u.id !== 0),
            take(1)
          ).subscribe(user => {
            this.authLoading = false;
            this.reservationStep = 'form';
            this.reservation.visitorName = `${user!.firstName} ${user!.lastName}`.trim();
            this.reservation.email = user!.email || '';
            this.reservation.phone = user!.phoneNumber || '';
          });
        } else {
          this.authLoading = false;
          this.authError = res.message || 'Registration failed.';
        }
      },
      error: (err) => {
        this.authLoading = false;
        this.authError = err?.error?.message || 'Registration failed. Username or email may already be taken.';
      }
    });
  }

  private resetAuthFields(): void {
    this.authUsername = '';
    this.authPassword = '';
    this.authEmail = '';
    this.authFirstName = '';
    this.authLastName = '';
    this.authPhone = '';
    this.authConfirmPassword = '';
    this.authLoading = false;
    this.authError = '';
  }

  // ── Reservation submit ────────────────────────────────────────────────────

  submitReservation(): void {
    if (!this.reservation.visitorName.trim() || !this.reservation.email.trim()) {
      this.reservationError = 'Please fill in your name and email.';
      return;
    }
    if (this.isAccommodation && !this.reservation.checkInDate) {
      this.reservationError = 'Please select a check-in date.';
      return;
    }
    if (this.isDining && !this.reservation.visitDate) {
      this.reservationError = 'Please select a visit date.';
      return;
    }

    this.reservationLoading = true;
    this.reservationError = '';

    this.http.post<any>(`${environment.apiUrl}/places/${this.place!.id}/book`, this.reservation)
      .subscribe({
        next: (res) => {
          this.reservationLoading = false;
          this.reservationReference = res.bookingReference || '';
          this.reservationStep = 'success';
        },
        error: (err) => {
          this.reservationLoading = false;
          this.reservationError = err?.error?.message || 'Something went wrong. Please try again or contact us directly.';
        }
      });
  }

  goToMyBookings(): void {
    this.closeReservationModal();
    this.router.navigate(['/my-bookings']);
  }
}
