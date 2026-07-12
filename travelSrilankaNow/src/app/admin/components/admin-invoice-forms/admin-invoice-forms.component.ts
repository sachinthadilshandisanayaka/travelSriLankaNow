import { Component, OnInit } from '@angular/core';
import { AdminApiService } from '../../services/admin-api.service';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-admin-invoice-forms',
  templateUrl: './admin-invoice-forms.component.html',
  styleUrls: ['./admin-invoice-forms.component.scss']
})
export class AdminInvoiceFormsComponent implements OnInit {
  forms: any[] = [];
  companies: any[] = [];
  templates: any[] = [];
  selectedCompanyId: number | null = null;
  loading = true;

  confirmVisible = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction: (() => void) | null = null;

  editingForm: any = null;
  showFormEditor = false;
  formName = '';
  formDescription = '';
  savingForm = false;

  editingField: any = null;
  showFieldEditor = false;
  field: any = {};
  savingField = false;
  error = '';

  fieldTypes = ['TEXT', 'NUMBER', 'DATE', 'DROPDOWN', 'TEXTAREA', 'CHECKBOX', 'PHONE', 'EMAIL'];
  dropdownOptions: { label: string, value: string }[] = [];

  constructor(
    private api: AdminApiService,
    private authService: AdminAuthService
  ) {}

  ngOnInit(): void {
    this.api.getCompanies().subscribe({
      next: (c) => {
        this.companies = c;
        if (c.length > 0) { this.selectedCompanyId = c[0].id; this.loadForms(); this.loadTemplates(); }
      },
      error: () => {}
    });
  }

  loadTemplates(): void {
    if (!this.selectedCompanyId) return;
    this.api.getInvoiceTemplates(this.selectedCompanyId).subscribe({ next: (t) => this.templates = t, error: () => {} });
  }

  onCompanyChange(): void {
    this.loadForms();
    this.loadTemplates();
  }

  loadForms(): void {
    if (!this.selectedCompanyId) return;
    this.loading = true;
    this.api.getInvoiceForms(this.selectedCompanyId).subscribe({
      next: (f) => { this.forms = f; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreateForm(): void {
    this.editingForm = null;
    this.formName = '';
    this.formDescription = '';
    this.showFormEditor = true;
  }

  openEditForm(form: any): void {
    this.editingForm = form;
    this.formName = form.name;
    this.formDescription = form.description || '';
    this.showFormEditor = true;
  }

  saveForm(): void {
    if (!this.formName.trim()) return;
    this.savingForm = true;
    const payload = { name: this.formName, description: this.formDescription };
    const action = this.editingForm
      ? this.api.updateInvoiceForm(this.editingForm.id, payload)
      : this.api.createInvoiceForm(this.selectedCompanyId!, payload);
    action.subscribe({
      next: (saved: any) => {
        this.savingForm = false;
        this.showFormEditor = false;
        this.loadForms();
        if (!this.editingForm) {
          // Open the new form for editing
          const idx = this.forms.findIndex(f => f.id === saved.id);
          if (idx >= 0) this.expandForm(this.forms[idx]);
        }
      },
      error: () => { this.savingForm = false; }
    });
  }

  expandForm(form: any): void {
    form._expanded = !form._expanded;
    if (form._expanded && !form.fields) {
      this.api.getInvoiceFormById(form.id).subscribe({
        next: (f) => { form.fields = f.fields; },
        error: () => {}
      });
    }
  }

  deleteForm(form: any): void {
    this.confirmTitle = 'Deactivate Form';
    this.confirmMessage = `Deactivate form "${form.name}"?`;
    this.confirmAction = () => {
      this.api.deactivateInvoiceForm(form.id).subscribe({ next: () => this.loadForms(), error: () => {} });
    };
    this.confirmVisible = true;
  }

  openAddField(form: any): void {
    this.editingForm = form;
    this.editingField = null;
    this.field = { fieldType: 'TEXT', isRequired: false, isLineItem: false, section: '', sortOrder: 0 };
    this.dropdownOptions = [];
    this.showFieldEditor = true;
    this.error = '';
  }

  openEditField(form: any, f: any): void {
    this.editingForm = form;
    this.editingField = f;
    this.field = { ...f };
    this.dropdownOptions = f.options ? [...f.options] : [];
    this.showFieldEditor = true;
    this.error = '';
  }

  saveField(): void {
    if (!this.field.label) { this.error = 'Label is required'; return; }
    if (this.field.fieldType === 'DROPDOWN') {
      this.field.options = this.dropdownOptions;
    }
    this.savingField = true;
    const payload = { ...this.field };
    const action = this.editingField
      ? this.api.updateInvoiceFormField(this.editingForm.id, this.editingField.id, payload)
      : this.api.addInvoiceFormField(this.editingForm.id, payload);
    action.subscribe({
      next: () => {
        this.savingField = false;
        this.showFieldEditor = false;
        this.refreshFormFields(this.editingForm);
      },
      error: (e: any) => { this.savingField = false; this.error = e?.error?.message || 'Save failed'; }
    });
  }

  deleteField(form: any, field: any): void {
    this.confirmTitle = 'Remove Field';
    this.confirmMessage = `Remove field "${field.label}"?`;
    this.confirmAction = () => {
      this.api.deleteInvoiceFormField(form.id, field.id).subscribe({ next: () => this.refreshFormFields(form), error: () => {} });
    };
    this.confirmVisible = true;
  }

  onConfirmed(): void {
    if (this.confirmAction) this.confirmAction();
    this.confirmAction = null;
  }

  refreshFormFields(form: any): void {
    this.api.getInvoiceFormById(form.id).subscribe({
      next: (f) => { form.fields = f.fields; },
      error: () => {}
    });
  }

  addDropdownOption(): void { this.dropdownOptions.push({ label: '', value: '' }); }
  removeDropdownOption(i: number): void { this.dropdownOptions.splice(i, 1); }

  wrapVar(key: string): string { return '{{' + key + '}}'; }
}
