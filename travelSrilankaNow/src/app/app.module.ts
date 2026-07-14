import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './admin/interceptors/auth.interceptor';
import { CustomerAuthInterceptor } from './interceptors/customer-auth.interceptor';

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
import { TranslatePipe } from './pipes/translate.pipe';
import { VideoAutoplayDirective } from './directives/video-autoplay.directive';
import { PageHeaderComponent } from './shared/components/page-header/page-header.component';
import { ImageLightboxComponent } from './shared/components/image-lightbox/image-lightbox.component';
import { LanguageSwitcherComponent } from './components/language-switcher/language-switcher.component';
import { ContactDetailsComponent } from './shared/components/contact-details/contact-details.component';
import { AuthLoginComponent } from './pages/auth/auth-login.component';
import { AuthRegisterComponent } from './pages/auth/auth-register.component';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';
import { FloatingSocialWidgetComponent } from './components/floating-social-widget/floating-social-widget.component';
import { SharedModule } from './shared/shared.module';

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
    TranslatePipe,
    VideoAutoplayDirective,
    PageHeaderComponent,
    ImageLightboxComponent,
    LanguageSwitcherComponent,
    ContactDetailsComponent,
    AuthLoginComponent,
    AuthRegisterComponent,
    MyBookingsComponent,
    FloatingSocialWidgetComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CustomerAuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
