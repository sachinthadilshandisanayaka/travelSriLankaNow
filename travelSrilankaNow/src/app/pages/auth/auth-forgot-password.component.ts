import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerAuthService } from '../../services/customer-auth.service';
import { SiteSettingsService } from '../../services/site-settings.service';

@Component({
  selector: 'app-auth-forgot-password',
  templateUrl: './auth-forgot-password.component.html',
  styleUrls: ['./auth-login.component.scss']
})
export class AuthForgotPasswordComponent implements OnInit {
  step: 'request' | 'reset' | 'done' = 'request';
  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  error = '';
  info = '';
  siteName = '';

  constructor(
    private authService: CustomerAuthService,
    private router: Router,
    private siteSettingsService: SiteSettingsService
  ) {}

  ngOnInit(): void {
    this.siteSettingsService.getSettingByKey('site_name').subscribe({
      next: (setting) => { if (setting?.value) this.siteName = setting.value; }
    });
  }

  requestCode(): void {
    if (!this.email) { this.error = 'Please enter your email address.'; return; }
    this.loading = true;
    this.error = '';
    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.loading = false;
        this.info = res?.message || 'If an account exists for that email, a reset code has been sent.';
        this.step = 'reset';
      },
      error: () => {
        this.loading = false;
        // Same generic message as success — never reveal whether the email exists.
        this.info = 'If an account exists for that email, a reset code has been sent.';
        this.step = 'reset';
      }
    });
  }

  resetPassword(): void {
    if (!this.otp || !this.newPassword) { this.error = 'Please enter the code and a new password.'; return; }
    if (this.newPassword !== this.confirmPassword) { this.error = 'Passwords do not match.'; return; }
    this.loading = true;
    this.error = '';
    this.authService.resetPassword(this.email, this.otp, this.newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.step = 'done';
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Invalid or expired code.';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
