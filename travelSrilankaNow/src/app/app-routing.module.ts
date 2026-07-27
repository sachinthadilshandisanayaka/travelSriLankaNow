import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LocationsComponent } from './pages/locations/locations.component';
import { LocationDetailComponent } from './pages/location-detail/location-detail.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { EventsComponent } from './pages/events/events.component';
import { EventDetailComponent } from './pages/event-detail/event-detail.component';
import { PackagesComponent } from './pages/packages/packages.component';
import { PackageDetailComponent } from './pages/package-detail/package-detail.component';
import { PlacesComponent } from './pages/places/places.component';
import { PlaceDetailComponent } from './pages/place-detail/place-detail.component';
import { LandingSimpleComponent } from './pages/landing/landing-simple.component';
import { MoreSectionDetailComponent } from './pages/more-section-detail/more-section-detail.component';
import { MoreSectionItemDetailComponent } from './pages/more-section-item-detail/more-section-item-detail.component';
import { AuthLoginComponent } from './pages/auth/auth-login.component';
import { AuthRegisterComponent } from './pages/auth/auth-register.component';
import { AuthForgotPasswordComponent } from './pages/auth/auth-forgot-password.component';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';
import { ContactComponent } from './pages/contact/contact.component';
import { BookTourComponent } from './pages/book-tour/book-tour.component';

const routes: Routes = [
  { path: '', component: LandingComponent, data: { animation: 'HomePage' } },
  { path: 'test-simple', component: LandingSimpleComponent, data: { animation: 'TestPage' } },
  { path: 'login', component: AuthLoginComponent },
  { path: 'register', component: AuthRegisterComponent },
  { path: 'forgot-password', component: AuthForgotPasswordComponent },
  { path: 'my-bookings', component: MyBookingsComponent },
  { path: 'contact', component: ContactComponent, data: { animation: 'ContactPage' } },
  // Deliberately not in NavConfig/the navbar — reachable only via direct URL.
  { path: 'book-a-tour', component: BookTourComponent, data: { animation: 'BookTourPage' } },
  { path: 'locations', component: LocationsComponent, data: { animation: 'LocationsPage' } },
  { path: 'locations/:slug', component: LocationDetailComponent, data: { animation: 'LocationDetailPage' } },
  { path: 'gallery', component: GalleryComponent, data: { animation: 'GalleryPage' } },
  { path: 'events', component: EventsComponent, data: { animation: 'EventsPage' } },
  { path: 'events/:slug', component: EventDetailComponent, data: { animation: 'EventDetailPage' } },
  { path: 'packages', component: PackagesComponent, data: { animation: 'PackagesPage' } },
  { path: 'packages/:slug', component: PackageDetailComponent, data: { animation: 'PackageDetailPage' } },
  { path: 'places', component: PlacesComponent, data: { animation: 'PlacesPage' } },
  { path: 'places/:slug', component: PlaceDetailComponent, data: { animation: 'PlaceDetailPage' } },
  { path: 'more/:slug', component: MoreSectionDetailComponent, data: { animation: 'MoreSectionPage' } },
  { path: 'more/:slug/:itemSlug', component: MoreSectionItemDetailComponent, data: { animation: 'MoreSectionItemPage' } },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    data: { animation: 'AdminPage' }
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  // Scroll restoration is handled manually in AppComponent instead of 'top',
  // since 'top' fires on every navigation - including same-page filter/page
  // query-param changes (e.g. selecting a category), which jarringly yanked
  // the user back to the top of a long list they were scrolled through.
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'disabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
