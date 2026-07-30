import { Component, OnInit } from '@angular/core';
import { SiteSettingsService, SiteSetting } from '../../services/site-settings.service';

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

  constructor(private siteSettingsService: SiteSettingsService) {}

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
}
