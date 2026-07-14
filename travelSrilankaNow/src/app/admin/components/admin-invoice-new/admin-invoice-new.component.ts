import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-invoice-new',
  templateUrl: './admin-invoice-new.component.html',
  styleUrls: ['./admin-invoice-new.component.scss']
})
export class AdminInvoiceNewComponent implements OnInit {
  step = 1; // 1 = fill form, 2 = preview, 3 = confirm/send

  companies: any[] = [];
  forms: any[] = [];
  templates: any[] = [];

  selectedCompanyId: number | null = null;
  selectedFormId: number | null = null;
  selectedTemplateId: number | null = null;
  formFields: any[] = [];

  loadingForms = true;
  loadingTemplates = true;
  loadingFields = false;

  // Core fields
  customerName = '';
  customerContact = '';
  customerEmail = '';
  customerCountry = '';
  customerIdNumber = '';
  tourName = '';
  tourDuration = '';
  invoiceDate = new Date().toISOString().split('T')[0];
  dueDate = '';

  // Pricing
  discountType = '';
  discountValue = 0;
  discountOnTax = false;
  taxRate = 0;

  lineItems: any[] = [{ description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }];
  dynamicValues: { [key: string]: any } = {};

  // Computed
  subtotal = 0;
  discountAmount = 0;
  taxAmount = 0;
  totalAmount = 0;

  previewInvoice: any = null;
  previewPdfUrl: string | null = null;
  generating = false;
  confirming = false;
  error = '';

  sendEmail = false;
  emailTo = '';
  emailCc = '';

  constructor(private api: AdminApiService, private router: Router) {}

  ngOnInit(): void {
    this.api.getCompanies().subscribe({
      next: (c) => {
        this.companies = c;
        if (c.length > 0) {
          this.selectedCompanyId = c[0].id;
          this.onCompanyChange();
        } else {
          this.loadingForms = false;
          this.loadingTemplates = false;
        }
      },
      error: () => { this.loadingForms = false; this.loadingTemplates = false; }
    });
  }

  onCompanyChange(): void {
    if (!this.selectedCompanyId) return;
    this.forms = [];
    this.templates = [];
    this.formFields = [];
    this.selectedFormId = null;
    this.selectedTemplateId = null;
    this.loadingForms = true;
    this.loadingTemplates = true;
    this.api.getInvoiceForms(this.selectedCompanyId).subscribe({
      next: (f) => { this.forms = f; this.loadingForms = false; if (f.length > 0) this.onFormChange(f[0].id); },
      error: () => { this.loadingForms = false; }
    });
    this.api.getInvoiceTemplates(this.selectedCompanyId).subscribe({
      next: (t) => { this.templates = t; this.loadingTemplates = false; if (t.length > 0) this.selectedTemplateId = t[0].id; },
      error: () => { this.loadingTemplates = false; }
    });
  }

  onFormChange(formId: number): void {
    this.selectedFormId = formId;
    this.loadingFields = true;
    this.formFields = [];
    this.api.getInvoiceFormById(formId).subscribe({
      next: (f) => { this.formFields = f.fields || []; this.dynamicValues = {}; this.loadingFields = false; },
      error: () => { this.loadingFields = false; }
    });
  }

  updateLineItem(item: any): void {
    item.lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
    this.recalculate();
  }

  addLineItem(): void { this.lineItems.push({ description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }); }
  removeLineItem(i: number): void { this.lineItems.splice(i, 1); this.recalculate(); }

  recalculate(): void {
    this.subtotal = this.lineItems.reduce((s, i) => s + (i.lineTotal || 0), 0);
    this.discountAmount = this.discountType === 'RATE' ? this.subtotal * this.discountValue / 100
        : (this.discountType === 'AMOUNT' ? this.discountValue : 0);
    const taxBase = this.discountOnTax ? this.subtotal : this.subtotal - this.discountAmount;
    this.taxAmount = taxBase * this.taxRate / 100;
    this.totalAmount = this.subtotal - this.discountAmount + this.taxAmount;
  }

  get regularFields(): any[] { return this.formFields.filter(f => !f.isLineItem); }

  buildRequest(preview: boolean): any {
    const formData: any = { ...this.dynamicValues };
    return {
      companyId: this.selectedCompanyId,
      templateId: this.selectedTemplateId,
      formId: this.selectedFormId,
      customerName: this.customerName,
      customerContact: this.customerContact,
      customerEmail: this.customerEmail,
      customerCountry: this.customerCountry,
      customerIdNumber: this.customerIdNumber,
      tourName: this.tourName,
      tourDuration: this.tourDuration,
      invoiceDate: this.invoiceDate,
      dueDate: this.dueDate || null,
      discountType: this.discountType || null,
      discountValue: this.discountValue,
      discountOnTax: this.discountOnTax,
      taxRate: this.taxRate,
      formData,
      lineItems: this.lineItems,
      preview
    };
  }

  preview(): void {
    this.generating = true;
    this.error = '';
    this.api.previewInvoice(this.buildRequest(true)).subscribe({
      next: (inv: any) => {
        this.generating = false;
        this.previewInvoice = inv;
        this.previewPdfUrl = inv.pdfDraftUrl;
        this.emailTo = this.customerEmail;
        this.step = 2;
      },
      error: (e: any) => { this.generating = false; this.error = e?.error?.message || 'Preview failed'; }
    });
  }

  confirm(): void {
    this.confirming = true;
    this.error = '';
    this.api.generateInvoice(this.buildRequest(false)).subscribe({
      next: (inv: any) => {
        if (this.sendEmail && this.emailTo && inv.pdfUrl) {
          this.api.sendInvoiceEmail(inv.id, { to: this.emailTo, cc: this.emailCc, subject: 'Invoice ' + inv.invoiceNumber }).subscribe({
            next: () => { this.confirming = false; this.router.navigate(['/admin/invoices']); },
            error: () => { this.confirming = false; this.router.navigate(['/admin/invoices']); }
          });
        } else {
          this.confirming = false;
          this.router.navigate(['/admin/invoices']);
        }
      },
      error: (e: any) => { this.confirming = false; this.error = e?.error?.message || 'Generation failed'; }
    });
  }

  openPreviewPdf(): void {
    if (this.previewPdfUrl) window.open(this.previewPdfUrl, '_blank');
  }

  back(): void { if (this.step > 1) this.step--; }
  cancel(): void { this.router.navigate(['/admin/invoices']); }
}
