import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BookingCountService } from '../../services/booking-count.service';
import { environment } from '../../../../environments/environment';

export interface BookingAdminResponse {
  id: number;
  bookingReference: string;
  bookingType: 'EVENT' | 'PLACE' | 'PACKAGE' | string;
  eventId: number | null;
  eventTitle: string;
  placeId: number | null;
  placeName: string | null;
  packageId: number | null;
  packageName: string | null;
  /** Type-agnostic — always populated regardless of bookingType. Prefer these over the type-specific fields above. */
  displayTitle: string;
  displayTypeLabel: string;
  customerId: number | null;
  participantName: string;
  email: string;
  phone: string;
  numberOfPeople: number;
  specialRequests: string;
  totalPrice: number;
  bookingDate: string;
  requestedDate: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';
  termsAccepted: boolean;
  cancellationReason: string | null;
  cancelledAt: string | null;
  editedAt: string | null;
  createdDate: string | null;
  updatedDate: string | null;
  customFields?: { [key: string]: any };
}

export interface BookingCalendarDay {
  date: string;
  totalBookings: number;
  pendingCount: number;
  confirmedCount: number;
  completedCount: number;
  bookings: BookingAdminResponse[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-admin-bookings',
  templateUrl: './admin-bookings.component.html',
  styleUrls: ['./admin-bookings.component.scss']
})
export class AdminBookingsComponent implements OnInit, OnDestroy {
  private apiUrl = `${environment.apiUrl}/admin`;

  // View toggle
  activeView: 'table' | 'calendar' = 'table';

  // Table view state
  bookings: BookingAdminResponse[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  pageSize = 20;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Filters
  statusFilter = '';
  searchTerm = '';       // participant name / email / phone
  searchReference = '';  // booking reference
  dateFrom = '';         // ISO date string YYYY-MM-DD
  dateTo = '';

  showAdvancedFilters = false;
  private searchSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  // Detail modal
  selectedBooking: BookingAdminResponse | null = null;
  showDetail = false;
  statusUpdating = false;

  // Confirmation dialog
  confirmBooking: BookingAdminResponse | null = null;
  confirmNewStatus: string = '';
  showConfirmDialog = false;

  // Calendar view state
  calendarYear: number;
  calendarMonth: number;
  calendarDays: BookingCalendarDay[] = [];
  calendarLoading = false;
  calendarSelectedDay: BookingCalendarDay | null = null;
  readonly MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  readonly SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  readonly WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // Month picker state
  showMonthPicker = false;
  pickerYear: number;

  readonly STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled'];

  constructor(private http: HttpClient, private bookingCount: BookingCountService) {
    const now = new Date();
    this.calendarYear = now.getFullYear();
    this.calendarMonth = now.getMonth() + 1;
    this.pickerYear = this.calendarYear;
  }

  ngOnInit(): void {
    this.loadBookings();
    this.searchSubject.pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => { this.currentPage = 0; this.loadBookings(); });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  // ===== Table =====

  loadBookings(): void {
    this.isLoading = true;
    this.errorMessage = '';
    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('size', this.pageSize.toString());
    if (this.statusFilter)    params = params.set('status', this.statusFilter);
    if (this.searchTerm)      params = params.set('search', this.searchTerm);
    if (this.searchReference) params = params.set('reference', this.searchReference);
    if (this.dateFrom)        params = params.set('dateFrom', this.dateFrom);
    if (this.dateTo)          params = params.set('dateTo', this.dateTo);

    this.http.get<PageResponse<BookingAdminResponse>>(`${this.apiUrl}/bookings`, { params }).subscribe({
      next: (res) => {
        this.bookings = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.errorMessage = 'Failed to load bookings.'; }
    });
  }

  onFilterChange(): void { this.currentPage = 0; this.loadBookings(); }

  onDateRangeApply(range: { start: string; end: string }): void {
    this.dateFrom = range.start;
    this.dateTo = range.end;
    this.onFilterChange();
  }

  onDateRangeCancel(): void {
    this.dateFrom = '';
    this.dateTo = '';
    this.onFilterChange();
  }

  onSearchInput(): void { this.searchSubject.next(); }

  onStatusFilterChange(): void {
    this.currentPage = 0;
    this.loadBookings();
  }

  clearAllFilters(): void {
    this.statusFilter = '';
    this.searchTerm = '';
    this.searchReference = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.currentPage = 0;
    this.loadBookings();
  }

  get hasActiveFilters(): boolean {
    return !!(this.statusFilter || this.searchTerm || this.searchReference || this.dateFrom || this.dateTo);
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadBookings();
  }

  openDetail(booking: BookingAdminResponse): void {
    this.selectedBooking = { ...booking };
    this.showDetail = true;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.selectedBooking = null;
  }

  requestConfirm(booking: BookingAdminResponse, status: string): void {
    this.confirmBooking = booking;
    this.confirmNewStatus = status;
    this.showConfirmDialog = true;
  }

  dismissConfirm(): void {
    this.showConfirmDialog = false;
    this.confirmBooking = null;
    this.confirmNewStatus = '';
  }

  executeConfirm(): void {
    if (!this.confirmBooking) return;
    const booking = this.confirmBooking;
    const status = this.confirmNewStatus;
    this.dismissConfirm();
    this.updateStatus(booking, status);
  }

  get confirmTitle(): string {
    switch (this.confirmNewStatus) {
      case 'confirmed': return 'Approve Booking';
      case 'completed': return 'Mark as Completed';
      case 'cancelled': return 'Cancel Booking';
      default: return 'Confirm Action';
    }
  }

  get confirmMessage(): string {
    const ref = this.confirmBooking?.bookingReference ?? '';
    const name = this.confirmBooking?.participantName ?? '';
    switch (this.confirmNewStatus) {
      case 'confirmed': return `Approve booking ${ref} for ${name}? This will confirm their reservation.`;
      case 'completed': return `Mark booking ${ref} as completed? This means the event has taken place.`;
      case 'cancelled': return `Cancel booking ${ref} for ${name}? This action cannot be easily undone.`;
      default: return 'Are you sure?';
    }
  }

  get confirmIcon(): string {
    switch (this.confirmNewStatus) {
      case 'confirmed': return '✓';
      case 'completed': return '✅';
      case 'cancelled': return '✕';
      default: return '?';
    }
  }

  get confirmActionClass(): string {
    switch (this.confirmNewStatus) {
      case 'confirmed': return 'admin-btn admin-btn--confirm';
      case 'completed': return 'admin-btn admin-btn--complete';
      case 'cancelled': return 'admin-btn admin-btn--cancel';
      default: return 'admin-btn';
    }
  }

  updateStatus(booking: BookingAdminResponse, status: string): void {
    this.statusUpdating = true;
    this.http.patch<BookingAdminResponse>(
      `${this.apiUrl}/bookings/${booking.id}/status`,
      null,
      { params: new HttpParams().set('status', status) }
    ).subscribe({
      next: (updated) => {
        this.statusUpdating = false;
        this.successMessage = `Booking ${updated.bookingReference} status updated to ${status}.`;
        if (this.selectedBooking?.id === updated.id) this.selectedBooking = updated;
        const idx = this.bookings.findIndex(b => b.id === updated.id);
        if (idx >= 0) this.bookings[idx] = updated;
        if (this.calendarSelectedDay) {
          const ci = this.calendarSelectedDay.bookings.findIndex(b => b.id === updated.id);
          if (ci >= 0) this.calendarSelectedDay.bookings[ci] = updated;
        }
        this.bookingCount.refresh();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => { this.statusUpdating = false; this.errorMessage = 'Failed to update status.'; }
    });
  }

  get pages(): number[] {
    const total = Math.min(this.totalPages, 7);
    const start = Math.max(0, Math.min(this.currentPage - 3, this.totalPages - total));
    return Array.from({ length: Math.min(total, this.totalPages) }, (_, i) => start + i);
  }

  // ===== Calendar =====

  loadCalendar(): void {
    this.calendarLoading = true;
    this.calendarSelectedDay = null;
    const params = new HttpParams()
      .set('year', this.calendarYear.toString())
      .set('month', this.calendarMonth.toString());
    this.http.get<BookingCalendarDay[]>(`${this.apiUrl}/bookings/calendar`, { params }).subscribe({
      next: (days) => { this.calendarDays = days; this.calendarLoading = false; },
      error: () => { this.calendarLoading = false; }
    });
  }

  switchView(view: 'table' | 'calendar'): void {
    this.activeView = view;
    if (view === 'calendar' && this.calendarDays.length === 0) this.loadCalendar();
  }

  get calendarMonthLabel(): string {
    return `${this.MONTHS[this.calendarMonth - 1]} ${this.calendarYear}`;
  }

  calendarPrev(): void {
    if (this.calendarMonth === 1) { this.calendarMonth = 12; this.calendarYear--; }
    else this.calendarMonth--;
    this.loadCalendar();
  }

  calendarNext(): void {
    if (this.calendarMonth === 12) { this.calendarMonth = 1; this.calendarYear++; }
    else this.calendarMonth++;
    this.loadCalendar();
  }

  toggleMonthPicker(): void {
    this.showMonthPicker = !this.showMonthPicker;
    if (this.showMonthPicker) this.pickerYear = this.calendarYear;
  }

  pickerPrevYear(): void { this.pickerYear--; }
  pickerNextYear(): void { this.pickerYear++; }

  selectPickerMonth(monthIndex: number): void {
    this.calendarMonth = monthIndex + 1;
    this.calendarYear = this.pickerYear;
    this.showMonthPicker = false;
    this.loadCalendar();
  }

  isPickerMonthSelected(monthIndex: number): boolean {
    return this.calendarYear === this.pickerYear && this.calendarMonth === monthIndex + 1;
  }

  get calendarGrid(): Array<BookingCalendarDay | null> {
    if (!this.calendarDays.length) return [];
    const firstDow = new Date(this.calendarYear, this.calendarMonth - 1, 1).getDay();
    const grid: Array<BookingCalendarDay | null> = [];
    for (let i = 0; i < firstDow; i++) grid.push(null);
    for (const day of this.calendarDays) grid.push(day);
    return grid;
  }

  selectCalendarDay(day: BookingCalendarDay | null): void {
    if (!day) return;
    this.calendarSelectedDay = this.calendarSelectedDay?.date === day.date ? null : day;
  }

  isToday(dateStr: string): boolean {
    const today = new Date();
    const d = new Date(dateStr);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  }

  getCalendarCellClass(day: BookingCalendarDay | null): string {
    if (!day) return 'cal-cell cal-cell--empty';
    const classes = ['cal-cell'];
    if (this.isToday(day.date)) classes.push('cal-cell--today');
    if (this.calendarSelectedDay?.date === day.date) classes.push('cal-cell--selected');
    if (day.totalBookings === 0) classes.push('cal-cell--no-bookings');
    else if (day.pendingCount > 0) classes.push('cal-cell--has-pending');
    else classes.push('cal-cell--all-confirmed');
    return classes.join(' ');
  }

  // ===== Helpers =====

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'badge badge--pending';
      case 'confirmed': return 'badge badge--confirmed';
      case 'completed': return 'badge badge--completed';
      case 'cancelled': return 'badge badge--cancelled';
      default: return 'badge';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  formatCalendarDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  getCustomFieldEntries(b: BookingAdminResponse | null): { label: string; value: string }[] {
    if (!b?.customFields) return [];
    return Object.entries(b.customFields)
      .map(([k, v]) => ({
        label: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value: Array.isArray(v) ? (v as any[]).join(', ') : String(v ?? '')
      }))
      .filter(e => e.value.trim());
  }
}
