import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LocationsComponent } from './pages/locations/locations.component';
import { LocationDetailComponent } from './pages/location-detail/location-detail.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { EventsComponent } from './pages/events/events.component';
import { EventDetailComponent } from './pages/event-detail/event-detail.component';
import { PlacesComponent } from './pages/places/places.component';
import { PlaceDetailComponent } from './pages/place-detail/place-detail.component';
import { LandingSimpleComponent } from './pages/landing/landing-simple.component';
import { MoreSectionDetailComponent } from './pages/more-section-detail/more-section-detail.component';
import { MoreSectionItemDetailComponent } from './pages/more-section-item-detail/more-section-item-detail.component';
import { AuthLoginComponent } from './pages/auth/auth-login.component';
import { AuthRegisterComponent } from './pages/auth/auth-register.component';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';

const routes: Routes = [
  { path: '', component: LandingComponent, data: { animation: 'HomePage' } },
  { path: 'test-simple', component: LandingSimpleComponent, data: { animation: 'TestPage' } },
  { path: 'login', component: AuthLoginComponent },
  { path: 'register', component: AuthRegisterComponent },
  { path: 'my-bookings', component: MyBookingsComponent },
  { path: 'locations', component: LocationsComponent, data: { animation: 'LocationsPage' } },
  { path: 'locations/:id', component: LocationDetailComponent, data: { animation: 'LocationDetailPage' } },
  { path: 'gallery', component: GalleryComponent, data: { animation: 'GalleryPage' } },
  { path: 'events', component: EventsComponent, data: { animation: 'EventsPage' } },
  { path: 'events/:id', component: EventDetailComponent, data: { animation: 'EventDetailPage' } },
  { path: 'places', component: PlacesComponent, data: { animation: 'PlacesPage' } },
  { path: 'places/:id', component: PlaceDetailComponent, data: { animation: 'PlaceDetailPage' } },
  { path: 'more/:slug', component: MoreSectionDetailComponent, data: { animation: 'MoreSectionPage' } },
  { path: 'more/:slug/:id', component: MoreSectionItemDetailComponent, data: { animation: 'MoreSectionItemPage' } },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    data: { animation: 'AdminPage' }
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
