import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CustomerAuthService, CustomerUser } from '../../services/customer-auth.service';

export interface MyBooking {
  id: number;
  bookingReference: string;
  bookingType: 'EVENT' | 'PLACE';
  eventId: number;
  eventTitle: string;
  placeId: number;
  placeName: string;
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
  cancellationReason: string | null;
  cancelledAt: string | null;
  termsAccepted: boolean;
}

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit, OnDestroy {
  bookings: MyBooking[] = [];
  filteredBookings: MyBooking[] = [];
  loading = true;
  error = '';
  activeFilter: 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' = 'all';
  currentUser: CustomerUser | null = null;
  private userSub!: Subscription;

  // Cancel dialog state
  cancelDialogOpen = false;
  cancelTargetBooking: MyBooking | null = null;
  cancelReason = '';
  cancelLoading = false;
  cancelError = '';

  constructor(
    private customerAuthService: CustomerAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.customerAuthService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/my-bookings' } });
      return;
    }
    this.userSub = this.customerAuthService.currentUser$.subscribe(u => {
      if (u) this.currentUser = u;
    });
    this.loadBookings();
  }

  ngOnDestroy(): void {
    if (this.userSub) this.userSub.unsubscribe();
  }

  loadBookings(): void {
    this.loading = true;
    this.error = '';
    this.customerAuthService.getMyBookings().subscribe({
      next: (data: any[]) => {
        this.bookings = data as MyBooking[];
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load bookings. Please try again.';
        this.loading = false;
      }
    });
  }

  setFilter(f: 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'): void {
    this.activeFilter = f;
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filteredBookings = this.activeFilter === 'all'
      ? [...this.bookings]
      : this.bookings.filter(b => b.status === this.activeFilter);
  }

  get counts() {
    return {
      all: this.bookings.length,
      pending: this.bookings.filter(b => b.status === 'pending').length,
      confirmed: this.bookings.filter(b => b.status === 'confirmed').length,
      completed: this.bookings.filter(b => b.status === 'completed').length,
      cancelled: this.bookings.filter(b => b.status === 'cancelled').length
    };
  }

  // ── Cancel flow ───────────────────────────────────────────────────────────

  initCancel(booking: MyBooking): void {
    this.cancelError = '';
    this.cancelLoading = true;
    this.customerAuthService.checkBookingConditions(booking.id).subscribe({
      next: (check) => {
        this.cancelLoading = false;
        if (!check.canCancel) {
          this.cancelError = check.cancelReason || 'Cancellation is not allowed at this time.';
          return;
        }
        this.cancelTargetBooking = booking;
        this.cancelReason = '';
        this.cancelDialogOpen = true;
      },
      error: () => {
        this.cancelLoading = false;
        this.cancelError = 'Could not verify cancellation eligibility. Please try again.';
      }
    });
  }

  confirmCancel(): void {
    if (!this.cancelTargetBooking) return;
    this.cancelLoading = true;
    this.customerAuthService.cancelBooking(this.cancelTargetBooking.id, this.cancelReason).subscribe({
      next: () => {
        this.cancelLoading = false;
        this.cancelDialogOpen = false;
        this.cancelTargetBooking = null;
        this.loadBookings();
      },
      error: (err) => {
        this.cancelLoading = false;
        const msg = err?.error?.error;
        this.cancelError = msg || 'Failed to cancel booking. Please try again.';
      }
    });
  }

  closeCancel(): void {
    this.cancelDialogOpen = false;
    this.cancelTargetBooking = null;
    this.cancelReason = '';
    this.cancelError = '';
  }

  canCancel(booking: MyBooking): boolean {
    return booking.status === 'pending' || booking.status === 'confirmed';
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pending', confirmed: 'Confirmed',
      completed: 'Completed', cancelled: 'Cancelled'
    };
    return map[status] || status;
  }

  statusIcon(status: string): string {
    const map: Record<string, string> = {
      pending: '⏳', confirmed: '✅', completed: '🎉', cancelled: '❌'
    };
    return map[status] || '📋';
  }

  paymentLabel(ps: string): string {
    const map: Record<string, string> = {
      UNPAID: 'Unpaid', PARTIALLY_PAID: 'Partial', PAID: 'Paid', REFUNDED: 'Refunded'
    };
    return map[ps] || ps;
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount || 0);
  }

  bookingTitle(booking: MyBooking): string {
    if (booking.bookingType === 'PLACE') return booking.placeName || 'Place Reservation';
    return booking.eventTitle || 'Event Booking';
  }

  bookingTypeLabel(booking: MyBooking): string {
    return booking.bookingType === 'PLACE' ? 'Place' : 'Event';
  }

  viewBookingSource(booking: MyBooking): void {
    if (booking.bookingType === 'PLACE' && booking.placeId) {
      this.router.navigate(['/places', booking.placeId]);
    } else if (booking.eventId) {
      this.router.navigate(['/events', booking.eventId]);
    }
  }
}
