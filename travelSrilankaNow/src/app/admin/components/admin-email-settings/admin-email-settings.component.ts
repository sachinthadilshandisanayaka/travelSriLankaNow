import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-email-settings',
  templateUrl: './admin-email-settings.component.html',
  styleUrls: ['./admin-email-settings.component.scss']
})
export class AdminEmailSettingsComponent implements OnInit {
  configForm: FormGroup;
  hasPassword = false;
  isLoading = false;
  isSavingConfig = false;
  isSendingTest = false;

  templates: any[] = [];
  showTemplateModal = false;
  editingTemplate: any = null;
  templateForm: FormGroup;
  isSavingTemplate = false;

  successMessage = '';
  errorMessage = '';

  constructor(private apiService: AdminApiService, private fb: FormBuilder) {
    this.configForm = this.fb.group({
      smtpHost: ['', Validators.required],
      smtpPort: [587, [Validators.required, Validators.min(1)]],
      smtpUsername: ['', Validators.required],
      smtpPassword: [''],
      useTls: [true],
      fromEmail: ['', [Validators.required, Validators.email]],
      fromName: ['', Validators.required],
      ownerNotificationEmail: ['', Validators.email],
      isActive: [false]
    });

    this.templateForm = this.fb.group({
      subject: ['', Validators.required],
      bodyHtml: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadConfig();
    this.loadTemplates();
  }

  loadConfig(): void {
    this.isLoading = true;
    this.apiService.getEmailSettings().subscribe({
      next: (cfg) => {
        this.hasPassword = !!cfg.hasPassword;
        this.configForm.patchValue({
          smtpHost: cfg.smtpHost || '',
          smtpPort: cfg.smtpPort || 587,
          smtpUsername: cfg.smtpUsername || '',
          useTls: cfg.useTls !== false,
          fromEmail: cfg.fromEmail || '',
          fromName: cfg.fromName || '',
          ownerNotificationEmail: cfg.ownerNotificationEmail || '',
          isActive: !!cfg.isActive
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load email settings';
        this.hideMessageAfterDelay();
      }
    });
  }

  loadTemplates(): void {
    this.apiService.getEmailTemplates().subscribe({
      next: (templates) => { this.templates = templates; },
      error: () => {}
    });
  }

  saveConfig(): void {
    if (this.configForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly';
      this.hideMessageAfterDelay();
      return;
    }
    this.isSavingConfig = true;
    this.apiService.updateEmailSettings(this.configForm.value).subscribe({
      next: () => {
        this.isSavingConfig = false;
        this.successMessage = 'Email settings saved successfully!';
        this.configForm.patchValue({ smtpPassword: '' });
        this.loadConfig();
        this.hideMessageAfterDelay();
      },
      error: (err) => {
        this.isSavingConfig = false;
        this.errorMessage = err?.error?.message || 'Failed to save email settings';
        this.hideMessageAfterDelay();
      }
    });
  }

  sendTestEmail(): void {
    this.isSendingTest = true;
    this.apiService.sendTestEmail().subscribe({
      next: (res) => {
        this.isSendingTest = false;
        this.successMessage = res?.message || 'Test email queued';
        this.hideMessageAfterDelay();
      },
      error: (err) => {
        this.isSendingTest = false;
        this.errorMessage = err?.error?.message || 'Failed to send test email';
        this.hideMessageAfterDelay();
      }
    });
  }

  openTemplateModal(template: any): void {
    this.editingTemplate = template;
    this.templateForm.patchValue({
      subject: template.subject,
      bodyHtml: template.bodyHtml,
      isActive: template.isActive
    });
    this.showTemplateModal = true;
  }

  closeTemplateModal(): void {
    this.showTemplateModal = false;
    this.editingTemplate = null;
  }

  saveTemplate(): void {
    if (this.templateForm.invalid || !this.editingTemplate) return;
    this.isSavingTemplate = true;
    this.apiService.updateEmailTemplate(this.editingTemplate.id, this.templateForm.value).subscribe({
      next: () => {
        this.isSavingTemplate = false;
        this.successMessage = 'Template updated successfully!';
        this.closeTemplateModal();
        this.loadTemplates();
        this.hideMessageAfterDelay();
      },
      error: (err) => {
        this.isSavingTemplate = false;
        this.errorMessage = err?.error?.message || 'Failed to update template';
        this.hideMessageAfterDelay();
      }
    });
  }

  templateLabel(key: string): string {
    const labels: { [k: string]: string } = {
      BOOKING_CONFIRMATION_CUSTOMER: 'Booking Received — Customer',
      BOOKING_CONFIRMATION_OWNER: 'Booking Received — Owner',
      BOOKING_CONFIRMED_CUSTOMER: 'Booking Confirmed — Customer',
      BOOKING_CANCELLED_CUSTOMER: 'Booking Cancelled — Customer',
      PASSWORD_RESET_OTP: 'Password Reset Code'
    };
    return labels[key] || key;
  }

  hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }
}
