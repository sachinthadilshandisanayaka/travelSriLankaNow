import { Component, Input, OnInit } from '@angular/core';
import { ContactDetail, ContactType, CONTACT_TYPE_META, EntityType } from '../../../models/contact-detail.model';
import { ContactDetailService } from '../../../services/contact-detail.service';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss']
})
export class ContactDetailsComponent implements OnInit {
  @Input() entityType!: EntityType;
  @Input() entityId!: number;

  contacts: ContactDetail[] = [];
  loading = false;

  constructor(private contactDetailService: ContactDetailService) {}

  ngOnInit(): void {
    if (this.entityType && this.entityId) {
      this.load();
    }
  }

  private load(): void {
    this.loading = true;
    this.contactDetailService.getByEntity(this.entityType, this.entityId).subscribe({
      next: (contacts) => {
        this.contacts = contacts;
        this.loading = false;
      },
      error: () => {
        this.contacts = [];
        this.loading = false;
      }
    });
  }

  getMeta(type: ContactType) {
    return CONTACT_TYPE_META[type];
  }

  getUrl(contact: ContactDetail): string {
    return CONTACT_TYPE_META[contact.contactType].buildUrl(contact.value);
  }

  isOpenInNew(type: ContactType): boolean {
    return CONTACT_TYPE_META[type].openInNew;
  }

  getDisplayLabel(contact: ContactDetail): string {
    return contact.label || CONTACT_TYPE_META[contact.contactType].label;
  }

  isWeChat(type: ContactType): boolean {
    return type === 'WECHAT';
  }
}
