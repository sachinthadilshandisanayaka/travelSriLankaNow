import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SiteSettingsService, SiteSetting } from '../../services/site-settings.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  loading = true;
  contactEmail = '';
  contactPhone = '';
  contactAddress = '';
  businessHours: SiteSetting[] = [];
  socialLinks: SiteSetting[] = [];

  // Contact form
  contactFormModel = { name: '', phone: '', email: '', message: '' };
  contactFormLoading = false;
  contactFormError = '';
  contactFormSubmitted = false;

  constructor(
    private siteSettingsService: SiteSettingsService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.siteSettingsService.getContactInfo().subscribe({
      next: (contact) => {
        this.contactEmail = contact.email;
        this.contactPhone = contact.phone;
        this.contactAddress = contact.address;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.siteSettingsService.getSettingsByCategory('BUSINESS_HOURS').subscribe({
      next: (hours) => { this.businessHours = hours; },
      error: () => {}
    });

    this.siteSettingsService.getSocialMediaLinks().subscribe({
      next: (links) => { this.socialLinks = links; },
      error: () => {}
    });
  }

  get hasContactInfo(): boolean {
    return !!(this.contactEmail || this.contactPhone || this.contactAddress);
  }

  get whatsappUrl(): string {
    const digits = (this.contactPhone || '').replace(/[^\d]/g, '');
    return digits ? `https://wa.me/${digits}` : '';
  }

  submitContactForm(): void {
    if (!this.contactFormModel.name.trim() || !this.contactFormModel.phone.trim() || !this.contactFormModel.message.trim()) {
      this.contactFormError = 'Please fill in your name, contact number, and message.';
      return;
    }

    this.contactFormLoading = true;
    this.contactFormError = '';

    this.http.post<any>(`${environment.apiUrl}/contact`, this.contactFormModel).subscribe({
      next: () => {
        this.contactFormLoading = false;
        this.contactFormSubmitted = true;
      },
      error: (err) => {
        this.contactFormLoading = false;
        this.contactFormError = err?.error?.message || 'Something went wrong. Please try again or contact us directly.';
      }
    });
  }

  resetContactForm(): void {
    this.contactFormModel = { name: '', phone: '', email: '', message: '' };
    this.contactFormSubmitted = false;
    this.contactFormError = '';
  }
}
