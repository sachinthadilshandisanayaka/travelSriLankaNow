import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminLocationsComponent } from './components/admin-locations/admin-locations.component';
import { AdminEventsComponent } from './components/admin-events/admin-events.component';
import { AdminPackagesComponent } from './components/admin-packages/admin-packages.component';
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
import { AdminNavConfigComponent } from './components/admin-nav-config/admin-nav-config.component';
import { AdminContactDetailsComponent } from './components/admin-contact-details/admin-contact-details.component';
import { AdminBookingsComponent } from './components/admin-bookings/admin-bookings.component';
import { AdminBookingSettingsComponent } from './components/admin-booking-settings/admin-booking-settings.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { AdminRolesComponent } from './components/admin-roles/admin-roles.component';
import { HasPermissionDirective } from './directives/has-permission.directive';
import { AdminFloatingSocialComponent } from './components/admin-floating-social/admin-floating-social.component';
import { AdminMediaComponent } from './components/admin-media/admin-media.component';
import { AdminCompaniesComponent } from './components/admin-companies/admin-companies.component';
import { AdminInvoiceTemplatesComponent } from './components/admin-invoice-templates/admin-invoice-templates.component';
import { AdminInvoiceFormsComponent } from './components/admin-invoice-forms/admin-invoice-forms.component';
import { AdminInvoicesComponent } from './components/admin-invoices/admin-invoices.component';
import { AdminInvoiceNewComponent } from './components/admin-invoice-new/admin-invoice-new.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { AdminCategorySettingsComponent } from './components/admin-category-settings/admin-category-settings.component';

// New Advanced Image Upload Components
import { AdvancedImageUploadComponent } from './components/advanced-image-upload/advanced-image-upload.component';
import { ImageEditorComponent } from './components/image-editor/image-editor.component';
import { EntityImageManagerComponent } from './components/entity-image-manager/entity-image-manager.component';

// Rich Text Editor
import { QuillModule } from 'ngx-quill';

// Services
import { MediaService } from './services/media.service';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    AdminLoginComponent,
    AdminDashboardComponent,
    AdminLocationsComponent,
    AdminEventsComponent,
    AdminPackagesComponent,
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
    EntityImageManagerComponent,
    AdminNavConfigComponent,
    AdminContactDetailsComponent,
    AdminMediaComponent,
    AdminBookingsComponent,
    AdminBookingSettingsComponent,
    AdminUsersComponent,
    AdminRolesComponent,
    AdminFloatingSocialComponent,
    HasPermissionDirective,
    AdminCompaniesComponent,
    AdminInvoiceTemplatesComponent,
    AdminInvoiceFormsComponent,
    AdminInvoicesComponent,
    AdminInvoiceNewComponent,
    ConfirmDialogComponent,
    AdminCategorySettingsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule,
    QuillModule.forRoot(),
    SharedModule
  ],
  providers: [
    MediaService
  ],
  exports: [
    AdvancedImageUploadComponent,
    ImageEditorComponent,
    HasPermissionDirective,
    ConfirmDialogComponent
  ]
})
export class AdminModule { }
