import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerAuthService } from '../../services/customer-auth.service';
import { SiteSettingsService } from '../../services/site-settings.service';

@Component({
  selector: 'app-auth-login',
  templateUrl: './auth-login.component.html',
  styleUrls: ['./auth-login.component.scss']
})
export class AuthLoginComponent implements OnInit {
  username = '';
  password = '';
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

  login(): void {
    if (!this.username || !this.password) { this.error = 'Please enter username and password.'; return; }
    this.loading = true;
    this.error = '';
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.error = res.message || 'Login failed.';
        }
      },
      error: () => { this.loading = false; this.error = 'Invalid username or password.'; }
    });
  }
}
