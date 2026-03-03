import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.scss']
})
export class AdminProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  isLoadingProfile = true;
  isSavingProfile = false;
  isSavingPassword = false;

  profileSuccess = '';
  profileError = '';
  passwordSuccess = '';
  passwordError = '';

  constructor(
    private fb: FormBuilder,
    private apiService: AdminApiService,
    private authService: AdminAuthService
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', Validators.email]
    });

    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
    });

    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoadingProfile = true;
    this.apiService.getProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          first_name: profile.first_name,
          last_name: profile.last_name,
          username: profile.username,
          email: profile.email
        });
        this.isLoadingProfile = false;
      },
      error: () => {
        this.profileError = 'Failed to load profile';
        this.isLoadingProfile = false;
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    this.isSavingProfile = true;
    this.profileSuccess = '';
    this.profileError = '';

    this.apiService.updateProfile(this.profileForm.value).subscribe({
      next: (response) => {
        this.isSavingProfile = false;
        if (response.success) {
          this.profileSuccess = 'Profile updated successfully';
          const profile = response.profile;
          this.authService.updateStoredProfile(profile.first_name, profile.username);

          if (response.username_changed && response.access_token) {
            localStorage.setItem('adminAccessToken', response.access_token);
            localStorage.setItem('adminRefreshToken', response.refresh_token);
          }

          setTimeout(() => this.profileSuccess = '', 3000);
        }
      },
      error: (err) => {
        this.isSavingProfile = false;
        this.profileError = err.error?.message || 'Failed to update profile';
        setTimeout(() => this.profileError = '', 5000);
      }
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) return;

    const { new_password, confirm_password } = this.passwordForm.value;
    if (new_password !== confirm_password) {
      this.passwordError = 'Passwords do not match';
      setTimeout(() => this.passwordError = '', 5000);
      return;
    }

    this.isSavingPassword = true;
    this.passwordSuccess = '';
    this.passwordError = '';

    this.apiService.changePassword(this.passwordForm.value).subscribe({
      next: (response) => {
        this.isSavingPassword = false;
        if (response.success) {
          this.passwordSuccess = 'Password changed successfully';
          this.passwordForm.reset();
          setTimeout(() => this.passwordSuccess = '', 3000);
        }
      },
      error: (err) => {
        this.isSavingPassword = false;
        this.passwordError = err.error?.message || 'Failed to change password';
        setTimeout(() => this.passwordError = '', 5000);
      }
    });
  }
}
