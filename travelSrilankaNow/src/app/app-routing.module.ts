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
  { path: '', component: LandingComponent, data: { seo: { title: 'Travel Sri Lanka Now | Best Places to Visit, Tours & Travel Guide', description: 'Plan your Sri Lanka trip: top travel destinations, beaches, mountains, cultural sites, wildlife, tours, events, hotels and restaurants in the Pearl of the Indian Ocean.' }, animation: 'HomePage' } },
  { path: 'test-simple', component: LandingSimpleComponent, data: { seo: { title: 'Test', noindex: true }, animation: 'TestPage' } },
  { path: 'login', component: AuthLoginComponent, data: { seo: { title: 'Login', noindex: true } } },
  { path: 'register', component: AuthRegisterComponent, data: { seo: { title: 'Register', noindex: true } } },
  { path: 'my-bookings', component: MyBookingsComponent, data: { seo: { title: 'My Bookings', noindex: true } } },
  { path: 'locations', component: LocationsComponent, data: { seo: { title: 'Travel Locations in Sri Lanka - Beaches, Mountains & Heritage Sites', description: 'Explore the best travel destinations in Sri Lanka: golden beaches, misty hill country, ancient cities, national parks and more. Find places to visit by region and category.' }, animation: 'LocationsPage' } },
  { path: 'locations/:slug', component: LocationDetailComponent, data: { animation: 'LocationDetailPage' } },
  { path: 'gallery', component: GalleryComponent, data: { seo: { title: 'Sri Lanka Photo & Video Gallery', description: 'Browse stunning photos and videos of Sri Lanka: beaches, wildlife, temples, tea plantations, festivals and landscapes from around the island.' }, animation: 'GalleryPage' } },
  { path: 'events', component: EventsComponent, data: { seo: { title: 'Sri Lanka Tours & Events - Book Experiences and Day Trips', description: 'Book Sri Lanka tours, festivals, safaris, adventure activities and cultural events with local guides. Compare dates, prices and join an unforgettable experience.' }, animation: 'EventsPage' } },
  { path: 'events/:slug', component: EventDetailComponent, data: { animation: 'EventDetailPage' } },
  { path: 'places', component: PlacesComponent, data: { seo: { title: 'Hotels, Restaurants & Places to Stay in Sri Lanka', description: 'Find the best hotels, resorts, restaurants and cafes across Sri Lanka. Browse by region with photos, ratings, prices and contact details.' }, animation: 'PlacesPage' } },
  { path: 'places/:slug', component: PlaceDetailComponent, data: { animation: 'PlaceDetailPage' } },
  { path: 'more/:slug', component: MoreSectionDetailComponent, data: { animation: 'MoreSectionPage' } },
  { path: 'more/:slug/:itemSlug', component: MoreSectionItemDetailComponent, data: { animation: 'MoreSectionItemPage' } },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    data: { animation: 'AdminPage', seo: { title: 'Admin', noindex: true } }
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
