import { Component, OnInit } from '@angular/core';
import { AdminApiService } from '../../services/admin-api.service';

interface FloatingButton {
  platform: string;
  label: string;
  url: string;
  color: string;
  enabled: boolean;
}

interface FloatingConfig {
  enabled: boolean;
  buttons: FloatingButton[];
}

const PLATFORM_DEFAULTS: FloatingButton[] = [
  { platform: 'whatsapp',  label: 'WhatsApp',  url: '', color: '#25D366', enabled: false },
  { platform: 'telegram',  label: 'Telegram',  url: '', color: '#0088CC', enabled: false },
  { platform: 'facebook',  label: 'Facebook',  url: '', color: '#1877F2', enabled: false },
  { platform: 'instagram', label: 'Instagram', url: '', color: '#E4405F', enabled: false },
  { platform: 'twitter',   label: 'X / Twitter', url: '', color: '#000000', enabled: false },
  { platform: 'youtube',   label: 'YouTube',   url: '', color: '#FF0000', enabled: false },
  { platform: 'tiktok',    label: 'TikTok',    url: '', color: '#010101', enabled: false },
];

@Component({
  selector: 'app-admin-floating-social',
  templateUrl: './admin-floating-social.component.html',
  styleUrls: ['./admin-floating-social.component.scss']
})
export class AdminFloatingSocialComponent implements OnInit {
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  settingId: number | null = null;
  config: FloatingConfig = {
    enabled: false,
    buttons: PLATFORM_DEFAULTS.map(b => ({ ...b }))
  };

  readonly PLATFORM_HINTS: Record<string, string> = {
    whatsapp:  'Phone number: https://wa.me/94771234567',
    telegram:  'Username: https://t.me/yourusername',
    facebook:  'Page URL: https://facebook.com/yourpage',
    instagram: 'Profile URL: https://instagram.com/yourprofile',
    twitter:   'Profile URL: https://twitter.com/yourprofile',
    youtube:   'Channel URL: https://youtube.com/@yourchannel',
    tiktok:    'Profile URL: https://tiktok.com/@yourprofile',
  };

  constructor(private apiService: AdminApiService) {}

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig(): void {
    this.isLoading = true;
    this.apiService.getSiteSettings().subscribe({
      next: (settings: any[]) => {
        const existing = settings.find((s: any) => s.key === 'floating_social_buttons');
        if (existing) {
          this.settingId = existing.id;
          try {
            const parsed: FloatingConfig = JSON.parse(existing.value);
            this.config.enabled = parsed.enabled ?? false;
            this.config.buttons = PLATFORM_DEFAULTS.map(def => {
              const saved = (parsed.buttons || []).find(b => b.platform === def.platform);
              return saved ? { ...def, ...saved } : { ...def };
            });
          } catch {
            // keep defaults
          }
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load configuration';
        this.isLoading = false;
        this.hideMessages();
      }
    });
  }

  save(): void {
    this.isSaving = true;
    const value = JSON.stringify(this.config);
    const settingPayload = {
      category: 'GENERAL',
      key: 'floating_social_buttons',
      label: 'Floating Social Buttons',
      value,
      isActive: true,
      sortOrder: 100
    };

    const request$ = this.settingId
      ? this.apiService.updateSiteSetting(this.settingId, { ...settingPayload, id: this.settingId })
      : this.apiService.createSiteSetting(settingPayload);

    request$.subscribe({
      next: (result: any) => {
        if (!this.settingId) this.settingId = result.id;
        this.successMessage = 'Floating social buttons saved!';
        this.isSaving = false;
        this.hideMessages();
      },
      error: () => {
        this.errorMessage = 'Failed to save configuration';
        this.isSaving = false;
        this.hideMessages();
      }
    });
  }

  get enabledCount(): number {
    return this.config.buttons.filter(b => b.enabled).length;
  }

  private hideMessages(): void {
    setTimeout(() => { this.successMessage = ''; this.errorMessage = ''; }, 3500);
  }
}
