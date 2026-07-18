import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { BrandingService, Branding } from '../../services/branding.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  branding!: Branding;

  constructor(
    private authService: AdminAuthService,
    private router: Router,
    private brandingService: BrandingService
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin/dashboard']);
    }
    this.brandingService.branding$.subscribe(b => this.branding = b);
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login(this.username, this.password).subscribe(
      (response) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.errorMessage = response.message || 'Login failed';
        }
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Invalid username or password';
      }
    );
  }
}
