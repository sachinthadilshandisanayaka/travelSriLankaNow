import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-invoices',
  templateUrl: './admin-invoices.component.html',
  styleUrls: ['./admin-invoices.component.scss']
})
export class AdminInvoicesComponent implements OnInit {
  invoices: any[] = [];
  companies: any[] = [];
  selectedCompanyId: number | null = null;
  statusFilter = '';
  loading = true;
  page = 0;
  totalPages = 0;
  totalElements = 0;

  selectedInvoice: any = null;
  showEmailModal = false;
  emailTo = '';
  emailCc = '';
  emailSubject = '';
  sendingEmail = false;
  emailError = '';

  showVoidModal = false;
  voidReason = '';

  statuses = ['', 'DRAFT', 'FINALIZED', 'SENT', 'PAID', 'VOID'];

  constructor(private api: AdminApiService, private router: Router) {}

  ngOnInit(): void {
    this.api.getCompanies().subscribe({
      next: (c) => {
        this.companies = c;
        if (c.length > 0) { this.selectedCompanyId = c[0].id; this.loadInvoices(); }
      },
      error: () => {}
    });
  }

  loadInvoices(): void {
    if (!this.selectedCompanyId) return;
    this.loading = true;
    this.api.getInvoices(this.selectedCompanyId, this.statusFilter, this.page, 20).subscribe({
      next: (data: any) => {
        this.invoices = data.content;
        this.totalPages = data.totalPages;
        this.totalElements = data.totalElements;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  viewDetail(invoice: any): void {
    this.selectedInvoice = invoice;
  }

  downloadPdf(invoice: any): void {
    this.api.getInvoicePdfUrl(invoice.id).subscribe({
      next: (res: any) => {
        if (res.url) window.open(res.url, '_blank');
      },
      error: () => {}
    });
  }

  openEmailModal(invoice: any): void {
    this.selectedInvoice = invoice;
    this.emailTo = invoice.customerEmail || '';
    this.emailCc = invoice.sentCc || '';
    this.emailSubject = 'Invoice ' + invoice.invoiceNumber;
    this.showEmailModal = true;
    this.emailError = '';
  }

  sendEmail(): void {
    if (!this.emailTo || !this.selectedInvoice) return;
    this.sendingEmail = true;
    this.api.sendInvoiceEmail(this.selectedInvoice.id, {
      to: this.emailTo, cc: this.emailCc, subject: this.emailSubject
    }).subscribe({
      next: () => { this.sendingEmail = false; this.showEmailModal = false; this.loadInvoices(); },
      error: (e: any) => { this.sendingEmail = false; this.emailError = e?.error?.message || 'Send failed'; }
    });
  }

  openVoidModal(invoice: any): void {
    this.selectedInvoice = invoice;
    this.voidReason = '';
    this.showVoidModal = true;
  }

  voidInvoice(): void {
    if (!this.selectedInvoice) return;
    this.api.voidInvoice(this.selectedInvoice.id, this.voidReason).subscribe({
      next: () => { this.showVoidModal = false; this.selectedInvoice = null; this.loadInvoices(); },
      error: () => {}
    });
  }

  markPaid(invoice: any): void {
    this.api.updateInvoiceStatus(invoice.id, 'PAID').subscribe({
      next: () => this.loadInvoices(),
      error: () => {}
    });
  }

  prevPage(): void { if (this.page > 0) { this.page--; this.loadInvoices(); } }
  nextPage(): void { if (this.page < this.totalPages - 1) { this.page++; this.loadInvoices(); } }

  statusClass(status: string): string {
    return { DRAFT: 'draft', FINALIZED: 'finalized', SENT: 'sent', PAID: 'paid', VOID: 'void' }[status] || '';
  }

  newInvoice(): void { this.router.navigate(['/admin/invoices/new']); }
}
