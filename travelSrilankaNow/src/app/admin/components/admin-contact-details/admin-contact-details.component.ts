import { Component, Input, OnInit, OnChanges } from '@angular/core';
import {
  ContactDetail, ContactType, EntityType,
  ALL_CONTACT_TYPES, CONTACT_TYPE_META
} from '../../../models/contact-detail.model';
import { ContactDetailService } from '../../../services/contact-detail.service';

@Component({
  selector: 'app-admin-contact-details',
  templateUrl: './admin-contact-details.component.html',
  styleUrls: ['./admin-contact-details.component.scss']
})
export class AdminContactDetailsComponent implements OnInit, OnChanges {
  @Input() entityType!: EntityType;
  @Input() entityId!: number;

  contacts: ContactDetail[] = [];
  loading = true;
  saving = false;
  editingId: number | null = null;
  showAddForm = false;
  successMsg = '';
  errorMsg = '';

  allTypes = ALL_CONTACT_TYPES;
  typeMeta = CONTACT_TYPE_META;

  newContact: Partial<ContactDetail> = this.emptyContact();
  editContact: Partial<ContactDetail> = {};

  constructor(private contactService: ContactDetailService) {}

  ngOnInit(): void {
    this.loadIfReady();
  }

  ngOnChanges(): void {
    this.loadIfReady();
  }

  private loadIfReady(): void {
    if (this.entityType && this.entityId) {
      this.load();
    }
  }

  load(): void {
    this.loading = true;
    this.contactService.getAllByEntity(this.entityType, this.entityId).subscribe({
      next: (items) => { this.contacts = items; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  private emptyContact(): Partial<ContactDetail> {
    return { contactType: 'PHONE', value: '', label: '', displayOrder: 0, isActive: true };
  }

  openAddForm(): void {
    this.newContact = this.emptyContact();
    this.showAddForm = true;
    this.editingId = null;
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.newContact = this.emptyContact();
  }

  save(): void {
    if (!this.newContact.value?.trim()) { this.errorMsg = 'Value is required.'; return; }
    this.saving = true;
    const payload: ContactDetail = {
      entityType: this.entityType,
      entityId: this.entityId,
      contactType: this.newContact.contactType as ContactType,
      value: this.newContact.value!.trim(),
      label: this.newContact.label?.trim() || undefined,
      displayOrder: this.newContact.displayOrder || 0,
      isActive: true
    };
    this.contactService.create(payload).subscribe({
      next: (created) => {
        this.contacts.push(created);
        this.showAddForm = false;
        this.newContact = this.emptyContact();
        this.saving = false;
        this.showSuccess('Contact added.');
      },
      error: () => { this.errorMsg = 'Failed to save.'; this.saving = false; }
    });
  }

  startEdit(contact: ContactDetail): void {
    this.editingId = contact.id!;
    this.editContact = { ...contact };
    this.showAddForm = false;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editContact = {};
  }

  saveEdit(contact: ContactDetail): void {
    if (!this.editContact.value?.trim()) { this.errorMsg = 'Value is required.'; return; }
    this.saving = true;
    const payload: ContactDetail = {
      ...contact,
      contactType: this.editContact.contactType as ContactType,
      value: this.editContact.value!.trim(),
      label: this.editContact.label?.trim() || undefined,
      displayOrder: this.editContact.displayOrder || 0,
      isActive: this.editContact.isActive ?? true
    };
    this.contactService.update(contact.id!, payload).subscribe({
      next: (updated) => {
        const idx = this.contacts.findIndex(c => c.id === updated.id);
        if (idx !== -1) this.contacts[idx] = updated;
        this.editingId = null;
        this.saving = false;
        this.showSuccess('Contact updated.');
      },
      error: () => { this.errorMsg = 'Failed to update.'; this.saving = false; }
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this contact?')) return;
    this.contactService.delete(id).subscribe({
      next: () => {
        this.contacts = this.contacts.filter(c => c.id !== id);
        this.showSuccess('Contact deleted.');
      },
      error: () => { this.errorMsg = 'Failed to delete.'; }
    });
  }

  toggleActive(contact: ContactDetail): void {
    this.contactService.toggleActive(contact.id!).subscribe({
      next: (updated) => {
        const idx = this.contacts.findIndex(c => c.id === updated.id);
        if (idx !== -1) this.contacts[idx] = updated;
      },
      error: () => { this.errorMsg = 'Failed to toggle.'; }
    });
  }

  getTypeLabel(type: ContactType): string {
    return CONTACT_TYPE_META[type].label;
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    this.errorMsg = '';
    setTimeout(() => this.successMsg = '', 3000);
  }
}
