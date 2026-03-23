import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './admin/interceptors/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LocationsComponent } from './pages/locations/locations.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { EventsComponent } from './pages/events/events.component';
import { EventDetailComponent } from './pages/event-detail/event-detail.component';
import { PlacesComponent } from './pages/places/places.component';
import { LandingSimpleComponent } from './pages/landing/landing-simple.component';
import { LocationDetailComponent } from './pages/location-detail/location-detail.component';
import { PlaceDetailComponent } from './pages/place-detail/place-detail.component';
import { MoreSectionDetailComponent } from './pages/more-section-detail/more-section-detail.component';
import { MoreSectionItemDetailComponent } from './pages/more-section-item-detail/more-section-item-detail.component';
import { CloudinaryOptimizePipe, CloudinaryThumbnailPipe } from './pipes/cloudinary.pipe';
import { PageHeaderComponent } from './shared/components/page-header/page-header.component';
import { ImageLightboxComponent } from './shared/components/image-lightbox/image-lightbox.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    LandingComponent,
    LandingSimpleComponent,
    LocationsComponent,
    GalleryComponent,
    EventsComponent,
    EventDetailComponent,
    PlacesComponent,
    LocationDetailComponent,
    PlaceDetailComponent,
    MoreSectionDetailComponent,
    MoreSectionItemDetailComponent,
    CloudinaryOptimizePipe,
    CloudinaryThumbnailPipe,
    PageHeaderComponent,
    ImageLightboxComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
