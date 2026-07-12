import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { PermissionGuard } from './guards/permission.guard';

import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminLocationsComponent } from './components/admin-locations/admin-locations.component';
import { AdminEventsComponent } from './components/admin-events/admin-events.component';
import { AdminPlacesComponent } from './components/admin-places/admin-places.component';
import { AdminGalleryComponent } from './components/admin-gallery/admin-gallery.component';
import { AdminMasterDataComponent } from './components/admin-master-data/admin-master-data.component';
import { AdminSiteSettingsComponent } from './components/admin-site-settings/admin-site-settings.component';
import { AdminItemOrderComponent } from './components/admin-item-order/admin-item-order.component';
import { AdminHeroSlidesComponent } from './components/admin-hero-slides/admin-hero-slides.component';
import { PageHeaderBackgroundsComponent } from './components/page-header-backgrounds/page-header-backgrounds.component';
import { AdminSocialMediaComponent } from './components/admin-social-media/admin-social-media.component';
import { AdminHomepageSectionsComponent } from './components/admin-homepage-sections/admin-homepage-sections.component';
import { AdminMoreSectionsComponent } from './components/admin-more-sections/admin-more-sections.component';
import { AdminProfileComponent } from './components/admin-profile/admin-profile.component';
import { AdminNavConfigComponent } from './components/admin-nav-config/admin-nav-config.component';
import { AdminBookingsComponent } from './components/admin-bookings/admin-bookings.component';
import { AdminBookingSettingsComponent } from './components/admin-booking-settings/admin-booking-settings.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { AdminRolesComponent } from './components/admin-roles/admin-roles.component';
import { AdminMediaComponent } from './components/admin-media/admin-media.component';
import { AdminFloatingSocialComponent } from './components/admin-floating-social/admin-floating-social.component';
import { AdminCompaniesComponent } from './components/admin-companies/admin-companies.component';
import { AdminInvoiceTemplatesComponent } from './components/admin-invoice-templates/admin-invoice-templates.component';
import { AdminInvoiceFormsComponent } from './components/admin-invoice-forms/admin-invoice-forms.component';
import { AdminInvoicesComponent } from './components/admin-invoices/admin-invoices.component';
import { AdminInvoiceNewComponent } from './components/admin-invoice-new/admin-invoice-new.component';

const routes: Routes = [
  {
    path: 'login',
    component: AdminLoginComponent
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AdminAuthGuard],
    children: [
      // Dashboard — always accessible to any authenticated admin
      { path: 'dashboard', component: AdminDashboardComponent },

      // Profile — no section permission needed, any authenticated user
      { path: 'profile', component: AdminProfileComponent },

      // Operations — Invoice & Company Management
      {
        path: 'companies',
        component: AdminCompaniesComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'COMPANY_MANAGEMENT:VIEW' }
      },
      {
        path: 'invoice-templates',
        component: AdminInvoiceTemplatesComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'INVOICE_TEMPLATE:VIEW' }
      },
      {
        path: 'invoice-forms',
        component: AdminInvoiceFormsComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'INVOICE_FORM:VIEW' }
      },
      {
        path: 'invoices/new',
        component: AdminInvoiceNewComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'INVOICE_GENERATE:CREATE' }
      },
      {
        path: 'invoices',
        component: AdminInvoicesComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'INVOICE_HISTORY:VIEW' }
      },

      // Operations — Bookings
      {
        path: 'bookings',
        component: AdminBookingsComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'BOOKINGS:VIEW' }
      },
      {
        path: 'booking-settings',
        component: AdminBookingSettingsComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'BOOKING_SETTINGS:VIEW' }
      },

      // Content
      {
        path: 'locations',
        component: AdminLocationsComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'LOCATIONS:VIEW' }
      },
      {
        path: 'events',
        component: AdminEventsComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'EVENTS:VIEW' }
      },
      {
        path: 'places',
        component: AdminPlacesComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'PLACES:VIEW' }
      },
      {
        path: 'gallery',
        component: AdminGalleryComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'GALLERY:VIEW' }
      },

      // UI Components
      {
        path: 'hero-slides',
        component: AdminHeroSlidesComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'HERO_SLIDES:VIEW' }
      },
      {
        path: 'page-header-backgrounds',
        component: PageHeaderBackgroundsComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'PAGE_HEADERS:VIEW' }
      },
      {
        path: 'social-media',
        component: AdminSocialMediaComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'SOCIAL_MEDIA:VIEW' }
      },
      {
        path: 'floating-social',
        component: AdminFloatingSocialComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'SITE_SETTINGS:VIEW' }
      },
      {
        path: 'more-sections',
        component: AdminMoreSectionsComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'MORE_SECTIONS:VIEW' }
      },
      {
        path: 'nav-config',
        component: AdminNavConfigComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'NAV_CONFIG:VIEW' }
      },

      // Settings
      {
        path: 'homepage-sections',
        component: AdminHomepageSectionsComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'HOMEPAGE_SECTIONS:VIEW' }
      },
      {
        // Display Order manages ordering of locations, places, events
        path: 'order/:type',
        component: AdminItemOrderComponent,
        canActivate: [PermissionGuard],
        data: { permission: ['LOCATIONS:VIEW', 'EVENTS:VIEW', 'PLACES:VIEW'] }
      },
      {
        path: 'master-data',
        component: AdminMasterDataComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'MASTER_DATA:VIEW' }
      },
      {
        path: 'site-settings',
        component: AdminSiteSettingsComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'SITE_SETTINGS:VIEW' }
      },

      // Administration
      {
        path: 'users',
        component: AdminUsersComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'USER_MANAGEMENT:VIEW' }
      },
      {
        path: 'roles',
        component: AdminRolesComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'ROLE_MANAGEMENT:VIEW' }
      },

      {
        path: 'media',
        component: AdminMediaComponent,
        canActivate: [PermissionGuard],
        data: { permission: 'MEDIA:VIEW' }
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
