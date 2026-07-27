import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerAuthService } from '../../services/customer-auth.service';
import { SiteSettingsService } from '../../services/site-settings.service';

@Component({
  selector: 'app-auth-register',
  templateUrl: './auth-register.component.html',
  styleUrls: ['./auth-login.component.scss']
})
export class AuthRegisterComponent implements OnInit {
  firstName = '';
  lastName = '';
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  phoneNumber = '';
  loading = false;
  error = '';
  siteName = '';
  returnUrl = '/';

  constructor(
    private authService: CustomerAuthService,
    private router: Router,
    private route: ActivatedRoute,
    private siteSettingsService: SiteSettingsService
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    this.siteSettingsService.getSettingByKey('site_name').subscribe({
      next: (setting) => { if (setting?.value) this.siteName = setting.value; }
    });
  }

  register(): void {
    if (!this.username || !this.email || !this.password) {
      this.error = 'Please fill all required fields.'; return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.'; return;
    }
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters.'; return;
    }
    this.loading = true;
    this.error = '';
    this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.error = res.message || 'Registration failed.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Registration failed. Username or email may already be taken.';
      }
    });
  }
}
