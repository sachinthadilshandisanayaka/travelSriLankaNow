import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-companies',
  templateUrl: './admin-companies.component.html',
  styleUrls: ['./admin-companies.component.scss']
})
export class AdminCompaniesComponent implements OnInit {
  companies: any[] = [];
  loading = true;
  showForm = false;
  editingId: number | null = null;
  form!: FormGroup;
  saving = false;
  error = '';

  selectedCompany: any = null;
  companyUsers: any[] = [];
  changeLog: any[] = [];
  activeTab: 'details' | 'users' | 'log' = 'details';

  confirmVisible = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction: (() => void) | null = null;

  constructor(
    private api: AdminApiService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCompanies();
  }

  buildForm(): void {
    this.form = this.fb.group({
      name:             ['', Validators.required],
      regNumber:        [''],
      taxId:            [''],
      addressLine1:     [''],
      addressLine2:     [''],
      city:             [''],
      country:          ['Sri Lanka'],
      phone:            [''],
      email:            [''],
      website:          [''],
      currency:         ['LKR'],
      taxLabel:         ['VAT'],
      bankName:         [''],
      bankAccountNo:    [''],
      bankSwift:        [''],
      paymentTermsDays: [30],
      termsConditions:  [''],
      invoicePrefix:    ['INV'],
      brevoFromName:    [''],
      brevoFromEmail:   ['']
    });
  }

  loadCompanies(): void {
    this.loading = true;
    this.api.getCompanies().subscribe({
      next: (data) => { this.companies = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({ country: 'Sri Lanka', currency: 'LKR', taxLabel: 'VAT', invoicePrefix: 'INV', paymentTermsDays: 30 });
    this.showForm = true;
  }

  openEdit(company: any): void {
    this.editingId = company.id;
    this.form.patchValue(company);
    this.showForm = true;
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const action = this.editingId
      ? this.api.updateCompany(this.editingId, this.form.value)
      : this.api.createCompany(this.form.value);
    action.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.loadCompanies(); },
      error: (e) => { this.saving = false; this.error = e?.error?.message || 'Save failed'; }
    });
  }

  selectCompany(company: any): void {
    this.selectedCompany = company;
    this.activeTab = 'details';
    this.loadCompanyUsers(company.id);
    this.loadChangeLog(company.id);
  }

  loadCompanyUsers(id: number): void {
    this.api.getCompanyUsers(id).subscribe({ next: (u) => this.companyUsers = u, error: () => {} });
  }

  loadChangeLog(id: number): void {
    this.api.getCompanyChangeLog(id).subscribe({ next: (l) => this.changeLog = l, error: () => {} });
  }

  removeUser(companyId: number, userId: number): void {
    this.confirmTitle = 'Remove User';
    this.confirmMessage = 'Remove this user from the company?';
    this.confirmAction = () => {
      this.api.removeCompanyUser(companyId, userId).subscribe({ next: () => this.loadCompanyUsers(companyId), error: () => {} });
    };
    this.confirmVisible = true;
  }

  deactivate(id: number): void {
    this.confirmTitle = 'Deactivate Company';
    this.confirmMessage = 'Deactivate this company? This cannot be undone.';
    this.confirmAction = () => {
      this.api.deactivateCompany(id).subscribe({ next: () => this.loadCompanies(), error: () => {} });
    };
    this.confirmVisible = true;
  }

  onConfirmed(): void {
    if (this.confirmAction) this.confirmAction();
    this.confirmAction = null;
  }

  closeForm(): void { this.showForm = false; this.error = ''; }
  closeDetail(): void { this.selectedCompany = null; }
}
