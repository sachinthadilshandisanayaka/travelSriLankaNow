import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminAuthGuard } from './guards/admin-auth.guard';

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
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'locations', component: AdminLocationsComponent },
      { path: 'events', component: AdminEventsComponent },
      { path: 'places', component: AdminPlacesComponent },
      { path: 'gallery', component: AdminGalleryComponent },
      { path: 'hero-slides', component: AdminHeroSlidesComponent },
      { path: 'page-header-backgrounds', component: PageHeaderBackgroundsComponent },
      { path: 'master-data', component: AdminMasterDataComponent },
      { path: 'site-settings', component: AdminSiteSettingsComponent },
      { path: 'social-media', component: AdminSocialMediaComponent },
      { path: 'homepage-sections', component: AdminHomepageSectionsComponent },
      { path: 'more-sections', component: AdminMoreSectionsComponent },
      { path: 'profile', component: AdminProfileComponent },
      { path: 'order/:type', component: AdminItemOrderComponent },
      { path: 'nav-config', component: AdminNavConfigComponent },
      { path: 'bookings', component: AdminBookingsComponent },
      { path: 'booking-settings', component: AdminBookingSettingsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
