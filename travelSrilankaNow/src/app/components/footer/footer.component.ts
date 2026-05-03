import { Component, OnInit } from '@angular/core';
import { SiteSettingsService, SiteSetting } from '../../services/site-settings.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();

  quickLinks = [
    { path: '/locations', key: 'nav.locations' },
    { path: '/events', key: 'nav.events' },
    { path: '/gallery', key: 'nav.gallery' },
    { path: '/places', key: 'nav.places' }
  ];

  socialLinks: { icon: string; url: string; label: string }[] = [];

  contactEmail = '';
  contactPhone = '';
  contactAddress = '';

  constructor(private siteSettingsService: SiteSettingsService) { }

  ngOnInit(): void {
    this.loadSiteSettings();
  }

  private loadSiteSettings(): void {
    this.siteSettingsService.getContactInfo().subscribe(contact => {
      this.contactEmail = contact.email;
      this.contactPhone = contact.phone;
      this.contactAddress = contact.address;
    });

    this.siteSettingsService.getSocialMediaLinks().subscribe(socialSettings => {
      this.socialLinks = socialSettings.map(setting => ({
        icon: setting.icon || this.getIconFromKey(setting.key),
        url: setting.value,
        label: setting.label
      }));
    });
  }

  private getIconFromKey(key: string): string {
    if (key.includes('facebook')) return 'facebook';
    if (key.includes('instagram')) return 'instagram';
    if (key.includes('twitter')) return 'twitter';
    if (key.includes('youtube')) return 'youtube';
    if (key.includes('linkedin')) return 'linkedin';
    return 'globe';
  }
}
