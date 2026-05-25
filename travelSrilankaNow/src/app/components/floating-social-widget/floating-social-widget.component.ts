import { Component, OnInit, HostListener } from '@angular/core';
import { SiteSettingsService } from '../../services/site-settings.service';

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

@Component({
  selector: 'app-floating-social-widget',
  templateUrl: './floating-social-widget.component.html',
  styleUrls: ['./floating-social-widget.component.scss']
})
export class FloatingSocialWidgetComponent implements OnInit {
  isOpen = false;
  config: FloatingConfig | null = null;

  constructor(private siteSettingsService: SiteSettingsService) {}

  ngOnInit(): void {
    this.siteSettingsService.getSettingByKey('floating_social_buttons').subscribe({
      next: (setting) => {
        if (setting?.value) {
          try {
            this.config = JSON.parse(setting.value);
          } catch {
            this.config = null;
          }
        }
      },
      error: () => {
        this.config = null;
      }
    });
  }

  get visibleButtons(): FloatingButton[] {
    if (!this.config?.buttons) return [];
    return this.config.buttons.filter(b => b.enabled && b.url?.trim());
  }

  get shouldShow(): boolean {
    return !!(this.config?.enabled && this.visibleButtons.length > 0);
  }

  toggleOpen(): void {
    this.isOpen = !this.isOpen;
  }

  buildUrl(btn: FloatingButton): string {
    if (btn.platform === 'whatsapp') {
      const clean = btn.url.replace(/\D/g, '');
      return `https://wa.me/${clean}`;
    }
    return btn.url.startsWith('http') ? btn.url : `https://${btn.url}`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.fsw')) {
      this.isOpen = false;
    }
  }
}
