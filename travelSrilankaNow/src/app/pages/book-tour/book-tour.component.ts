import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { PackageService } from '../../services/package.service';
import { EventService } from '../../services/event.service';
import { NavBookingConfigService } from '../../services/nav-booking-config.service';
import { NavBookingConfig } from '../../models/nav-booking-config.model';
import { CustomerAuthService, CustomerUser } from '../../services/customer-auth.service';
import { environment } from '../../../environments/environment';

type TourType = 'PACKAGE' | 'EVENT';

/** Normalizes Package and Event into one shape the search/booking UI can treat identically. */
interface UnifiedTour {
  type: TourType;
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  location: string;
  duration: string;
  price: number;
  maxParticipants: number;
  availableSpots: number;
  dates: any[];
  pricings: any[];
}

@Component({
  selector: 'app-book-tour',
  templateUrl: './book-tour.component.html',
  styleUrls: ['./book-tour.component.scss']
})
export class BookTourComponent implements OnInit {
  checkingAuth = true;
  loading = true;
  error = '';

  tours: UnifiedTour[] = [];
  filteredTours: UnifiedTour[] = [];
  searchTerm = '';
  categoryFilter: string | null = null;

  // Searchable combobox state for the tour picker (replaces the old plain <select>)
  showDropdown = false;
  highlightedIndex = -1;

  selectedTour: UnifiedTour | null = null;
  currentUser: CustomerUser | null = null;

  private navBookingConfigs: { [key in TourType]?: NavBookingConfig | null } = {};

  // Booking modal state (mirrors package-detail.component.ts, generalized across both types)
  showBookingModal = false;
  bookingStep: 'form' | 'success' = 'form';
  bookingLoading = false;
  bookingError = '';
  bookingReference = '';
  booking = {
    participantName: '',
    email: '',
    phone: '',
    numberOfPeople: 1,
    specialRequests: '',
    selectedDateId: null as number | null,
    preferredDate: null as string | null,
    checkInDate: null as string | null,
    checkOutDate: null as string | null
  };

  calendarMonth: Date = new Date();
  showMonthPicker = false;
  pickerYear = new Date().getFullYear();
  blockedDates: string[] = [];
  readonly WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  readonly MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  constructor(
    private router: Router,
    private http: HttpClient,
    private packageService: PackageService,
    private eventService: EventService,
    private navBookingConfigService: NavBookingConfigService,
    private customerAuthService: CustomerAuthService,
    private elementRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.showDropdown && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  ngOnInit(): void {
    // This page always requires login, independent of any individual tour's
    // own NavBookingConfig.requireAuth — a hard requirement for the hub itself.
    if (!this.customerAuthService.isLoggedIn()) {
      this.router.navigate(['/register'], { queryParams: { returnUrl: '/book-a-tour' } });
      return;
    }
    this.checkingAuth = false;

    this.customerAuthService.currentUser$.subscribe(u => {
      this.currentUser = u;
      if (u) {
        this.booking.participantName = `${u.firstName} ${u.lastName}`.trim();
        this.booking.email = u.email;
        this.booking.phone = u.phoneNumber || '';
      }
    });

    this.navBookingConfigService.getByRoutePath('/packages').subscribe(configs => {
      this.navBookingConfigs.PACKAGE = configs.find(c => c.isActive) || configs[0] || null;
    });
    this.navBookingConfigService.getByRoutePath('/events').subscribe(configs => {
      this.navBookingConfigs.EVENT = configs.find(c => c.isActive) || configs[0] || null;
    });

    this.loadTours();
  }

  private loadTours(): void {
    this.loading = true;
    forkJoin({
      packages: this.packageService.getAllPackages(),
      events: this.eventService.getEventsPaginated(0, 500).pipe(map(r => r.content))
    }).subscribe({
      next: ({ packages, events }) => {
        const packageTours: UnifiedTour[] = (packages || []).map(p => ({
          type: 'PACKAGE', id: p.id, title: p.title, category: p.category, imageUrl: p.imageUrl,
          location: p.location, duration: p.duration, price: p.price, maxParticipants: p.maxParticipants,
          availableSpots: p.availableSpots, dates: p.dates || [], pricings: p.pricings || []
        }));
        const eventTours: UnifiedTour[] = (events || []).map(e => ({
          type: 'EVENT', id: e.id, title: e.title, category: e.category, imageUrl: e.imageUrl,
          location: e.location, duration: e.duration, price: e.price, maxParticipants: e.maxParticipants,
          availableSpots: e.availableSpots, dates: e.dates || [], pricings: e.pricings || []
        }));
        const isDayFn = (c: string) => ['DayTours', 'DaysTour', 'TourWithOutAccommodation'].includes(c);
        this.tours = [...packageTours, ...eventTours]
          .sort((a, b) => {
            const aDay = isDayFn(a.category) ? 0 : 1;
            const bDay = isDayFn(b.category) ? 0 : 1;
            if (aDay !== bDay) return aDay - bDay;
            return a.title.localeCompare(b.title);
          });
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load tours. Please try again later.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredTours = this.tours.filter(t => {
      const matchesCategory = !this.categoryFilter || t.category === this.categoryFilter;
      const matchesSearch = !term || t.title.toLowerCase().includes(term) || t.location?.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
    this.highlightedIndex = this.filteredTours.length ? 0 : -1;
  }

  onSearchChange(): void {
    // Typing after a prior selection (focus never left the input, so no new
    // focus event fires to reopen the dropdown) must reopen it explicitly.
    this.showDropdown = true;
    this.applyFilters();
  }

  setCategoryFilter(cat: string | null): void {
    this.categoryFilter = cat || null;
    this.applyFilters();
  }

  get categories(): { value: string; label: string; count: number }[] {
    const map = new Map<string, number>();
    this.tours.forEach(t => map.set(t.category, (map.get(t.category) || 0) + 1));
    return Array.from(map.entries())
      .map(([value, count]) => ({ value, label: this.getCategoryLabel(value), count }))
      .sort((a, b) => b.count - a.count);
  }

  getCategoryLabel(cat: string): string {
    const labels: { [key: string]: string } = {
      DayTours: 'Day Tours',
      DaysTour: 'Days Tour',
      TourWithOutAccommodation: 'Without Accommodation',
      TransportationAndAccommodation: 'Transportation & Accommodation',
      TransportationOnly: 'Transportation Only'
    };
    return labels[cat] || cat;
  }

  // ===== Searchable tour combobox =====

  openDropdown(event?: FocusEvent): void {
    this.showDropdown = true;
    this.applyFilters();
    if (event?.target) (event.target as HTMLInputElement).select();
  }

  closeDropdown(): void {
    this.showDropdown = false;
    this.highlightedIndex = -1;
    // Revert the visible text to the actual selection if the user didn't pick
    // a new one — otherwise the box would show a half-typed search forever.
    this.searchTerm = this.selectedTour ? this.selectedTour.title : '';
    this.applyFilters();
  }

  selectTourFromDropdown(tour: UnifiedTour): void {
    this.selectedTour = tour;
    this.searchTerm = tour.title;
    this.showDropdown = false;
    this.highlightedIndex = -1;
  }

  clearSearch(event: Event): void {
    event.stopPropagation();
    this.searchTerm = '';
    this.selectedTour = null;
    this.applyFilters();
    this.showDropdown = true;
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (!this.showDropdown && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      this.openDropdown();
      return;
    }
    if (!this.showDropdown) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (this.filteredTours.length) {
          this.highlightedIndex = (this.highlightedIndex + 1) % this.filteredTours.length;
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.filteredTours.length) {
          this.highlightedIndex = (this.highlightedIndex - 1 + this.filteredTours.length) % this.filteredTours.length;
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredTours.length) {
          this.selectTourFromDropdown(this.filteredTours[this.highlightedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.closeDropdown();
        break;
    }
  }

  isDayCategory(category: string): boolean {
    return ['DayTours', 'DaysTour', 'TourWithOutAccommodation'].includes(category);
  }

  typeLabel(category: string): string {
    return this.isDayCategory(category) ? 'Day Tour' : 'Long Tour';
  }

  clearSelection(): void {
    this.selectedTour = null;
  }

  // ===== Nav booking config for the selected tour's route =====

  private get navBookingConfig(): NavBookingConfig | null {
    if (!this.selectedTour) return null;
    return this.navBookingConfigs[this.selectedTour.type] || null;
  }

  private get navRoutePath(): string {
    return this.selectedTour?.type === 'PACKAGE' ? '/packages' : '/events';
  }

  get dateMode(): string {
    return this.navBookingConfig ? this.navBookingConfig.dateMode : 'SINGLE';
  }

  get minStayDays(): number {
    return this.navBookingConfig && this.navBookingConfig.minStayDays ? this.navBookingConfig.minStayDays : 1;
  }

  get maxStayDays(): number | null {
    return this.navBookingConfig ? this.navBookingConfig.maxStayDays : null;
  }

  get todayStr(): string {
    return new Date().toISOString().substring(0, 10);
  }

  get checkInMin(): string {
    if (this.navBookingConfig && this.navBookingConfig.minLeadDays > 0) {
      const d = new Date();
      d.setDate(d.getDate() + this.navBookingConfig.minLeadDays);
      return d.toISOString().substring(0, 10);
    }
    return this.todayStr;
  }

  get checkOutMin(): string {
    if (!this.booking.checkInDate) return '';
    const d = new Date(this.booking.checkInDate);
    d.setDate(d.getDate() + this.minStayDays);
    return d.toISOString().substring(0, 10);
  }

  get checkOutMax(): string {
    if (!this.booking.checkInDate || !this.maxStayDays) return '';
    const d = new Date(this.booking.checkInDate);
    d.setDate(d.getDate() + this.maxStayDays);
    return d.toISOString().substring(0, 10);
  }

  onDateRangeApply(event: { start: string; end: string }): void {
    this.booking.checkInDate = event.start;
    this.booking.checkOutDate = event.end;
  }

  getNights(): number {
    if (!this.booking.checkInDate || !this.booking.checkOutDate) return 0;
    const a = new Date(this.booking.checkInDate).getTime();
    const b = new Date(this.booking.checkOutDate).getTime();
    return Math.max(0, Math.round((b - a) / 86400000));
  }

  formatDateDisplay(dateStr: string | null): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  onCheckInChange(): void {
    if (this.booking.checkInDate && this.booking.checkOutDate) {
      if (this.booking.checkOutDate <= this.booking.checkInDate || this.booking.checkOutDate < this.checkOutMin) {
        this.booking.checkOutDate = null;
      }
    }
  }

  // ===== Booking modal =====

  openBookingModal(): void {
    if (!this.selectedTour) return;
    this.bookingStep = 'form';
    this.bookingError = '';
    const today = new Date();
    const firstFuture = this.selectedTour.dates.find(d => new Date(d.date) >= today && d.availableSpots > 0);
    this.calendarMonth = firstFuture ? new Date(firstFuture.date) : new Date();
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth(), 1);
    this.showBookingModal = true;
    document.body.style.overflow = 'hidden';
    this.blockedDates = [];
    this.fetchBlockedDates(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth());
  }

  fetchBlockedDates(year: number, month: number): void {
    if (!this.selectedTour) return;
    const params = `bookingType=${this.selectedTour.type}&entityId=${this.selectedTour.id}&year=${year}&month=${month + 1}`;
    this.http.get<string[]>(`${environment.apiUrl}/availability/blocked-dates?${params}`).subscribe({
      next: (dates) => {
        const combined = new Set([...this.blockedDates, ...dates]);
        this.blockedDates = Array.from(combined);
      },
      error: () => {}
    });
  }

  closeBookingModal(): void {
    this.showBookingModal = false;
    this.bookingStep = 'form';
    this.bookingError = '';
    this.booking.selectedDateId = null;
    this.booking.preferredDate = null;
    this.booking.checkInDate = null;
    this.booking.checkOutDate = null;
    this.showMonthPicker = false;
    document.body.style.overflow = '';
  }

  get calendarMonthLabel(): string {
    return this.calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  calendarPrevMonth(): void {
    const d = new Date(this.calendarMonth);
    d.setMonth(d.getMonth() - 1);
    this.calendarMonth = d;
    this.fetchBlockedDates(d.getFullYear(), d.getMonth());
  }

  calendarNextMonth(): void {
    const d = new Date(this.calendarMonth);
    d.setMonth(d.getMonth() + 1);
    this.calendarMonth = d;
    this.fetchBlockedDates(d.getFullYear(), d.getMonth());
  }

  toggleMonthPicker(): void {
    this.showMonthPicker = !this.showMonthPicker;
    if (this.showMonthPicker) this.pickerYear = this.calendarMonth.getFullYear();
  }

  pickerPrevYear(): void { this.pickerYear--; }
  pickerNextYear(): void { this.pickerYear++; }

  selectPickerMonth(monthIndex: number): void {
    this.calendarMonth = new Date(this.pickerYear, monthIndex, 1);
    this.showMonthPicker = false;
    this.fetchBlockedDates(this.pickerYear, monthIndex);
  }

  isPickerMonthSelected(monthIndex: number): boolean {
    return this.calendarMonth.getFullYear() === this.pickerYear && this.calendarMonth.getMonth() === monthIndex;
  }

  isPickerMonthPast(monthIndex: number): boolean {
    const today = new Date();
    const lastDay = new Date(this.pickerYear, monthIndex + 1, 0);
    lastDay.setHours(23, 59, 59, 0);
    return lastDay < today;
  }

  get calendarDays(): Array<{ date: Date | null; tourDate: any | null; isPast: boolean; isToday: boolean; isBlocked: boolean }> {
    const year = this.calendarMonth.getFullYear();
    const month = this.calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cells: Array<{ date: Date | null; tourDate: any | null; isPast: boolean; isToday: boolean; isBlocked: boolean }> = [];

    for (let i = 0; i < firstDay; i++) cells.push({ date: null, tourDate: null, isPast: false, isToday: false, isBlocked: false });

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const isPast = date < today;
      const isToday = date.getTime() === today.getTime();
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isBlocked = !isPast && this.blockedDates.includes(dateStr);
      const tourDate = this.selectedTour?.dates.find(td => {
        const td2 = new Date(td.date);
        return td2.getFullYear() === year && td2.getMonth() === month && td2.getDate() === d;
      }) || null;
      cells.push({ date, tourDate, isPast, isToday, isBlocked });
    }
    return cells;
  }

  selectCalendarDate(cell: { date: Date | null; tourDate: any | null; isPast: boolean; isBlocked: boolean }): void {
    if (!cell.date || cell.isPast || cell.isBlocked) return;
    if (cell.tourDate) {
      if (cell.tourDate.availableSpots === 0) return;
      this.booking.selectedDateId = cell.tourDate.id;
      this.booking.preferredDate = null;
    } else {
      this.booking.selectedDateId = null;
      const d = cell.date;
      this.booking.preferredDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
  }

  isCalendarDaySelected(cell: { date: Date | null; tourDate: any | null }): boolean {
    if (!cell.date) return false;
    if (cell.tourDate) return this.booking.selectedDateId === cell.tourDate.id;
    if (this.booking.preferredDate) {
      const d = cell.date;
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return dateStr === this.booking.preferredDate;
    }
    return false;
  }

  get hasTourDates(): boolean {
    return !!this.selectedTour?.dates.length;
  }

  get bookingTotalPrice(): number {
    const primary = this.selectedTour?.pricings.find((p: any) => p.isPrimary) || this.selectedTour?.pricings[0];
    if (!primary) return this.selectedTour?.price || 0;
    if (primary.pricingType === 'PER_PERSON') return primary.amount * this.booking.numberOfPeople;
    return primary.amount;
  }

  submitBooking(): void {
    if (!this.booking.participantName || !this.booking.email || !this.booking.phone) {
      this.bookingError = 'Please fill in all required fields.';
      return;
    }
    if (this.dateMode === 'RANGE') {
      if (!this.booking.checkInDate || !this.booking.checkOutDate) {
        this.bookingError = 'Please select both check-in and check-out dates.';
        return;
      }
      if (this.booking.checkOutDate <= this.booking.checkInDate) {
        this.bookingError = 'Check-out date must be after check-in date.';
        return;
      }
    }
    if (!this.selectedTour) return;
    this.bookingLoading = true;
    this.bookingError = '';

    const isPackage = this.selectedTour.type === 'PACKAGE';
    const payload: any = {
      participantName: this.booking.participantName,
      email: this.booking.email,
      phone: this.booking.phone,
      numberOfPeople: this.booking.numberOfPeople,
      specialRequests: this.booking.specialRequests,
      totalPrice: this.bookingTotalPrice,
      navRoutePath: this.navRoutePath
    };
    if (!isPackage) payload.eventId = this.selectedTour.id;

    if (this.dateMode === 'RANGE') {
      payload.checkInDate = this.booking.checkInDate;
      payload.checkOutDate = this.booking.checkOutDate;
    } else {
      if (this.booking.selectedDateId) {
        payload[isPackage ? 'packageDateId' : 'eventDateId'] = this.booking.selectedDateId;
      }
      if (this.booking.preferredDate) payload.preferredDate = this.booking.preferredDate;
    }

    const url = isPackage
      ? `${environment.apiUrl}/packages/${this.selectedTour.id}/book`
      : `${environment.apiUrl}/events/book`;

    this.http.post<any>(url, payload).subscribe({
      next: (res) => {
        this.bookingLoading = false;
        this.bookingReference = res.bookingReference || '';
        this.bookingStep = 'success';
      },
      error: (err) => {
        this.bookingLoading = false;
        this.bookingError = err?.error?.message || 'Booking failed. Please try again.';
      }
    });
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      cultural: '🏛️', adventure: '⛰️', food: '🍽️', festival: '🎉', tour: '🗺️'
    };
    return icons[category] || '🎯';
  }
}
