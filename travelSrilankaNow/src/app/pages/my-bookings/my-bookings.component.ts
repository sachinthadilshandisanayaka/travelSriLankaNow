import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerAuthService, CustomerUser } from '../../services/customer-auth.service';

export interface MyBooking {
  id: number;
  bookingReference: string;
  eventId: number;
  eventTitle: string;
  participantName: string;
  email: string;
  phone: string;
  numberOfPeople: number;
  specialRequests: string;
  totalPrice: number;
  bookingDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';
}

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit {
  bookings: MyBooking[] = [];
  filteredBookings: MyBooking[] = [];
  loading = true;
  error = '';
  activeFilter: 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' = 'all';
  currentUser: CustomerUser | null = null;

  constructor(
    private customerAuthService: CustomerAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.customerAuthService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/my-bookings' } });
      return;
    }
    this.currentUser = this.customerAuthService.getCurrentUser();
    this.loadBookings();
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

  viewEvent(eventId: number): void {
    this.router.navigate(['/events', eventId]);
  }

  canCancel(booking: MyBooking): boolean {
    return booking.status === 'pending';
  }
}
