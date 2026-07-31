import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PackageService } from '../../services/package.service';
import { TourPackage, PackagePricing, PackageLocation } from '../../models/package.model';
import { ImageLightboxComponent } from '../../shared/components/image-lightbox/image-lightbox.component';
import { DataService } from '../../services/data.service';
import { FieldDefinition } from '../../models/more-section.model';
import { MasterDataService, MasterData } from '../../services/master-data.service';
import { CustomerAuthService, CustomerUser } from '../../services/customer-auth.service';
import { NavBookingConfigService } from '../../services/nav-booking-config.service';
import { NavBookingConfig } from '../../models/nav-booking-config.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-package-detail',
  templateUrl: './package-detail.component.html',
  styleUrls: ['./package-detail.component.scss']
})
export class PackageDetailComponent implements OnInit, OnDestroy {
  pkg: TourPackage | null = null;
  loading = true;
  error: string | null = null;
  selectedImageIndex = 0;
  fieldDefinitions: FieldDefinition[] = [];

  // Pricing state
  currencies: MasterData[] = [];
  selectedCurrency = 'USD';
  selectedPricing: PackagePricing | null = null;

  // Nav booking config for this route
  navBookingConfig: NavBookingConfig | null = null;

  // Booking modal state
  showBookingModal = false;
  bookingStep: 'form' | 'success' = 'form';
  bookingLoading = false;
  bookingError = '';
  bookingReference = '';
  currentUser: CustomerUser | null = null;
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

  // Calendar state
  calendarMonth: Date = new Date();
  showMonthPicker = false;
  pickerYear = new Date().getFullYear();
  blockedDates: string[] = [];
  readonly WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  readonly MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  @ViewChild('lightbox') lightbox!: ImageLightboxComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private packageService: PackageService,
    private dataService: DataService,
    private masterDataService: MasterDataService,
    private customerAuthService: CustomerAuthService,
    private navBookingConfigService: NavBookingConfigService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      if (/^\d+$/.test(slug)) {
        this.loadPackageDetails(+slug);
      } else {
        this.loadPackageDetailsBySlug(slug);
      }
    } else {
      this.error = 'No package provided';
      this.loading = false;
    }
    this.dataService.getEntityFieldConfig('package').subscribe({
      next: (config) => { this.fieldDefinitions = config.fieldDefinitions || []; },
      error: () => {}
    });
    this.masterDataService.getCurrencies().subscribe({
      next: (data) => { this.currencies = data; },
      error: () => {}
    });
    this.customerAuthService.currentUser$.subscribe(u => {
      this.currentUser = u;
      if (u) {
        this.booking.participantName = `${u.firstName} ${u.lastName}`.trim();
        this.booking.email = u.email;
        this.booking.phone = u.phoneNumber || '';
      }
    });

    this.navBookingConfigService.getByRoutePath('/packages').subscribe(configs => {
      this.navBookingConfig = configs.find(c => c.isActive) || configs[0] || null;
    });
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

  onDateRangeApply(event: { start: string; end: string }): void {
    this.booking.checkInDate = event.start;
    this.booking.checkOutDate = event.end;
  }

  getNights(): number {
    if (!this.booking.checkInDate || !this.booking.checkOutDate) { return 0; }
    const a = new Date(this.booking.checkInDate).getTime();
    const b = new Date(this.booking.checkOutDate).getTime();
    return Math.max(0, Math.round((b - a) / 86400000));
  }

  formatDateDisplay(dateStr: string | null): string {
    if (!dateStr) { return ''; }
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  onCheckInChange(): void {
    // Reset check-out when check-in changes and current check-out is now invalid
    if (this.booking.checkInDate && this.booking.checkOutDate) {
      if (this.booking.checkOutDate <= this.booking.checkInDate ||
          this.booking.checkOutDate < this.checkOutMin) {
        this.booking.checkOutDate = null;
      }
    }
  }

  loadPackageDetails(id: number): void {
    this.loading = true;
    this.error = null;
    this.packageService.getPackageById(id).subscribe({
      next: (pkg) => {
        this.pkg = pkg;
        this.loading = false;
        this.initPricingState();
        this.loadCategoryDisplayName(pkg.category);
      },
      error: () => {
        this.error = 'Failed to load package details. Please try again later.';
        this.loading = false;
      }
    });
  }

  loadPackageDetailsBySlug(slug: string): void {
    this.loading = true;
    this.error = null;
    this.packageService.getPackageBySlug(slug).subscribe({
      next: (pkg) => {
        this.pkg = pkg;
        this.loading = false;
        this.initPricingState();
        this.loadCategoryDisplayName(pkg.category);
      },
      error: () => {
        this.error = 'Failed to load package details. Please try again later.';
        this.loading = false;
      }
    });
  }

  private initPricingState(): void {
    if (!this.pkg?.pricings?.length) return;
    const primary = this.pkg.pricings.find(p => p.isPrimary) || this.pkg.pricings[0];
    this.selectedCurrency = primary.currencyCode;
    this.selectedPricing = primary;
  }

  /** Unique currencies from the package pricings */
  get availableCurrencies(): string[] {
    if (!this.pkg?.pricings?.length) return [];
    return [...new Set(this.pkg.pricings.map(p => p.currencyCode))];
  }

  /** Whether to show the multi-currency pricing UI vs. the legacy single price */
  get hasVisiblePricing(): boolean {
    return !!this.pkg?.pricings?.length && this.pkg.pricings.some(p => p.amount > 0);
  }

  /** Pricings filtered to selected currency */
  get filteredPricings(): PackagePricing[] {
    if (!this.pkg?.pricings?.length) return [];
    return this.pkg.pricings.filter(p => p.currencyCode === this.selectedCurrency);
  }

  selectCurrency(code: string): void {
    this.selectedCurrency = code;
    const pricings = this.filteredPricings;
    this.selectedPricing = pricings.find(p => p.isPrimary) || pricings[0] || null;
  }

  selectPricing(pricing: PackagePricing): void {
    this.selectedPricing = pricing;
  }

  getCurrencySymbol(code: string): string {
    const c = this.currencies.find(m => m.code === code);
    return c?.icon || code;
  }

  getPricingTypeLabel(type: string): string {
    switch (type) {
      case 'PER_PERSON': return 'Per Person';
      case 'GROUP': return 'Group Price';
      case 'FULL_EVENT': return 'Full Package';
      default: return type;
    }
  }

  getPricingTypeIcon(type: string): string {
    switch (type) {
      case 'PER_PERSON': return '👤';
      case 'GROUP': return '👥';
      case 'FULL_EVENT': return '🎯';
      default: return '💰';
    }
  }

  /** Whether the package has multi-location journey */
  get hasJourney(): boolean {
    return !!this.pkg?.packageLocations?.length && this.pkg.packageLocations.length > 1;
  }

  get sortedLocations(): PackageLocation[] {
    if (!this.pkg?.packageLocations) return [];
    return [...this.pkg.packageLocations].sort((a, b) => a.visitOrder - b.visitOrder);
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  openLightbox(index: number): void {
    if (this.lightbox) this.lightbox.open(index);
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  // ===== Booking =====
  // Whether login is required before booking is governed entirely by this
  // route's NavBookingConfig (requireAuth), set under Booking Settings ->
  // Nav Booking Rules — not hardcoded here, so an admin can change it for
  // Day Tours without a code change.
  openBookingModal(): void {
    if (this.navBookingConfig?.requireAuth && !this.currentUser) {
      this.router.navigate(['/register'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.bookingStep = 'form';
    this.bookingError = '';
    const today = new Date();
    const firstFuture = this.pkg?.dates?.find(d => new Date(d.date) >= today && d.availableSpots > 0);
    this.calendarMonth = firstFuture ? new Date(firstFuture.date) : new Date();
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth(), 1);
    this.showBookingModal = true;
    document.body.style.overflow = 'hidden';
    this.blockedDates = [];
    this.fetchBlockedDates(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth());
  }

  fetchBlockedDates(year: number, month: number): void {
    if (!this.pkg) return;
    const params = `bookingType=PACKAGE&entityId=${this.pkg.id}&year=${year}&month=${month + 1}`;
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

  // ===== Calendar =====
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
    if (this.showMonthPicker) {
      this.pickerYear = this.calendarMonth.getFullYear();
    }
  }

  pickerPrevYear(): void { this.pickerYear--; }
  pickerNextYear(): void { this.pickerYear++; }

  selectPickerMonth(monthIndex: number): void {
    this.calendarMonth = new Date(this.pickerYear, monthIndex, 1);
    this.showMonthPicker = false;
    this.fetchBlockedDates(this.pickerYear, monthIndex);
  }

  isPickerMonthSelected(monthIndex: number): boolean {
    return this.calendarMonth.getFullYear() === this.pickerYear &&
           this.calendarMonth.getMonth() === monthIndex;
  }

  isPickerMonthPast(monthIndex: number): boolean {
    const today = new Date();
    // Last day of the given month in pickerYear
    const lastDay = new Date(this.pickerYear, monthIndex + 1, 0);
    lastDay.setHours(23, 59, 59, 0);
    return lastDay < today;
  }

  get calendarDays(): Array<{ date: Date | null; packageDate: any | null; isPast: boolean; isToday: boolean; isBlocked: boolean }> {
    const year = this.calendarMonth.getFullYear();
    const month = this.calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cells: Array<{ date: Date | null; packageDate: any | null; isPast: boolean; isToday: boolean; isBlocked: boolean }> = [];

    for (let i = 0; i < firstDay; i++) cells.push({ date: null, packageDate: null, isPast: false, isToday: false, isBlocked: false });

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const isPast = date < today;
      const isToday = date.getTime() === today.getTime();
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isBlocked = !isPast && this.blockedDates.includes(dateStr);
      const packageDate = this.pkg?.dates?.find(pd => {
        const pd2 = new Date(pd.date);
        return pd2.getFullYear() === year && pd2.getMonth() === month && pd2.getDate() === d;
      }) || null;
      cells.push({ date, packageDate, isPast, isToday, isBlocked });
    }
    return cells;
  }

  selectCalendarDate(cell: { date: Date | null; packageDate: any | null; isPast: boolean; isBlocked: boolean }): void {
    if (!cell.date || cell.isPast || cell.isBlocked) return;
    if (cell.packageDate) {
      if (cell.packageDate.availableSpots === 0) return;
      this.booking.selectedDateId = cell.packageDate.id;
      this.booking.preferredDate = null;
    } else {
      // Free-form preferred date — use local date parts to avoid UTC timezone shift
      this.booking.selectedDateId = null;
      const d = cell.date;
      this.booking.preferredDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
  }

  isCalendarDaySelected(cell: { date: Date | null; packageDate: any | null }): boolean {
    if (!cell.date) return false;
    if (cell.packageDate) return this.booking.selectedDateId === cell.packageDate.id;
    if (this.booking.preferredDate) {
      const d = cell.date;
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return dateStr === this.booking.preferredDate;
    }
    return false;
  }

  get hasPackageDates(): boolean {
    return !!(this.pkg?.dates?.length);
  }

  get bookingTotalPrice(): number {
    if (!this.selectedPricing) return this.pkg?.price || 0;
    if (this.selectedPricing.pricingType === 'PER_PERSON') {
      return this.selectedPricing.amount * this.booking.numberOfPeople;
    }
    return this.selectedPricing.amount;
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
    if (!this.pkg) return;
    this.bookingLoading = true;
    this.bookingError = '';

    const payload: any = {
      participantName: this.booking.participantName,
      email: this.booking.email,
      phone: this.booking.phone,
      numberOfPeople: this.booking.numberOfPeople,
      specialRequests: this.booking.specialRequests,
      totalPrice: this.bookingTotalPrice,
      navRoutePath: '/packages'
    };
    if (this.dateMode === 'RANGE') {
      payload.checkInDate = this.booking.checkInDate;
      payload.checkOutDate = this.booking.checkOutDate;
    } else {
      if (this.booking.selectedDateId) payload.packageDateId = this.booking.selectedDateId;
      if (this.booking.preferredDate) payload.preferredDate = this.booking.preferredDate;
    }

    this.http.post<any>(`${environment.apiUrl}/packages/${this.pkg.id}/book`, payload).subscribe({
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

  goBack(): void {
    this.router.navigate(['/packages']);
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'cultural': '🏛️', 'adventure': '⛰️', 'food': '🍽️', 'festival': '🎉', 'tour': '🗺️'
    };
    return icons[category] || '🎯';
  }

  // The `| titlecase` pipe only capitalizes at whitespace boundaries, so a
  // camelCase category code like "CultureAndHeritage" comes out mangled
  // ("Cultureandheritage"). Look up the real master-data display name
  // instead, falling back to the pipe only if that lookup fails.
  categoryDisplayName = '';

  private loadCategoryDisplayName(category: string): void {
    this.categoryDisplayName = '';
    this.masterDataService.getAllPackageCategories().subscribe({
      next: (cats) => {
        const match = cats.find(c => c.code === category);
        this.categoryDisplayName = match?.displayName || '';
      },
      error: () => {}
    });
  }

  hasDetails(entity: any): boolean {
    if (!entity?.additionalDetails) return false;
    return Object.keys(entity.additionalDetails).some(key => this.isNonEmpty(entity.additionalDetails[key]));
  }

  isNonEmpty(value: any): boolean {
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.values(value).some(v => v !== null && v !== undefined && v !== '');
    return true;
  }

  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
      if (value.from !== undefined && value.to !== undefined) return `${value.from || '?'} - ${value.to || '?'}`;
      if (value.min !== undefined && value.max !== undefined) return `${value.min ?? '?'} - ${value.max ?? '?'}`;
    }
    return String(value);
  }

  getFieldLabel(key: string): string {
    const def = this.fieldDefinitions.find(d => d.key === key);
    return def?.label || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  isLinkField(key: string): boolean {
    return this.fieldDefinitions.find(d => d.key === key)?.type === 'link';
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

  getAvailabilityStatus(): string {
    if (!this.pkg) return '';
    const pct = (this.pkg.availableSpots / this.pkg.maxParticipants) * 100;
    if (pct > 50) return 'available';
    if (pct > 20) return 'limited';
    return 'filling-fast';
  }

  getAvailabilityText(): string {
    if (!this.pkg) return '';
    const a = this.pkg.availableSpots;
    if (a === 0) return 'Sold Out';
    if (a <= 5) return `Only ${a} spots left!`;
    return `${a} spots available`;
  }
}
