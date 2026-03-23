import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminLocationsComponent } from './components/admin-locations/admin-locations.component';
import { AdminEventsComponent } from './components/admin-events/admin-events.component';
import { AdminPlacesComponent } from './components/admin-places/admin-places.component';
import { AdminGalleryComponent } from './components/admin-gallery/admin-gallery.component';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { AdminMasterDataComponent } from './components/admin-master-data/admin-master-data.component';
import { AdminSiteSettingsComponent } from './components/admin-site-settings/admin-site-settings.component';
import { AdminItemOrderComponent } from './components/admin-item-order/admin-item-order.component';
import { AdminHeroSlidesComponent } from './components/admin-hero-slides/admin-hero-slides.component';
import { PageHeaderBackgroundsComponent } from './components/page-header-backgrounds/page-header-backgrounds.component';
import { AdminSocialMediaComponent } from './components/admin-social-media/admin-social-media.component';
import { AdminHomepageSectionsComponent } from './components/admin-homepage-sections/admin-homepage-sections.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminMoreSectionsComponent } from './components/admin-more-sections/admin-more-sections.component';
import { AdminProfileComponent } from './components/admin-profile/admin-profile.component';

// New Advanced Image Upload Components
import { AdvancedImageUploadComponent } from './components/advanced-image-upload/advanced-image-upload.component';
import { ImageEditorComponent } from './components/image-editor/image-editor.component';
import { EntityImageManagerComponent } from './components/entity-image-manager/entity-image-manager.component';

// Rich Text Editor
import { QuillModule } from 'ngx-quill';

// Services
import { MediaService } from './services/media.service';


@NgModule({
  declarations: [
    AdminLoginComponent,
    AdminDashboardComponent,
    AdminLocationsComponent,
    AdminEventsComponent,
    AdminPlacesComponent,
    AdminGalleryComponent,
    ImageUploadComponent,
    AdminMasterDataComponent,
    AdminSiteSettingsComponent,
    AdminItemOrderComponent,
    AdminHeroSlidesComponent,
    PageHeaderBackgroundsComponent,
    AdminSocialMediaComponent,
    AdminHomepageSectionsComponent,
    AdminLayoutComponent,
    AdminMoreSectionsComponent,
    AdminProfileComponent,
    // New Advanced Upload Components
    AdvancedImageUploadComponent,
    ImageEditorComponent,
    EntityImageManagerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule,
    QuillModule.forRoot()
  ],
  providers: [
    MediaService
  ],
  exports: [
    // Export for use in other modules if needed
    AdvancedImageUploadComponent,
    ImageEditorComponent
  ]
})
export class AdminModule { }
