import { Component, OnInit } from '@angular/core';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-invoice-templates',
  templateUrl: './admin-invoice-templates.component.html',
  styleUrls: ['./admin-invoice-templates.component.scss']
})
export class AdminInvoiceTemplatesComponent implements OnInit {
  templates: any[] = [];
  companies: any[] = [];
  loading = true;

  showUpload = false;
  uploading = false;
  uploadName = '';
  uploadDescription = '';
  uploadCompanyId: number | null = null;
  selectedFile: File | null = null;
  selectedFileName = '';
  error = '';

  showAssign = false;
  assignTemplateId: number | null = null;
  assignCompanyId: number | null = null;
  assigning = false;
  selectedTemplate: any = null;
  companiesForAssign: any[] = [];

  // Confirm dialog
  confirmVisible = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction: (() => void) | null = null;

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.loadTemplates();
    this.api.getCompanies().subscribe({ next: (c) => this.companies = c, error: () => {} });
  }

  loadTemplates(): void {
    this.loading = true;
    this.api.getInvoiceTemplates().subscribe({
      next: (t) => { this.templates = t; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    this.selectedFile = file || null;
    this.selectedFileName = file ? file.name : '';
    if (file && !this.uploadName) {
      this.uploadName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    }
  }

  upload(): void {
    if (!this.selectedFile || !this.uploadName.trim()) {
      this.error = 'Template name and file are required';
      return;
    }
    this.uploading = true;
    this.error = '';
    const fd = new FormData();
    fd.append('file', this.selectedFile);
    fd.append('name', this.uploadName);
    if (this.uploadDescription) fd.append('description', this.uploadDescription);
    if (this.uploadCompanyId) fd.append('companyId', String(this.uploadCompanyId));
    this.api.uploadInvoiceTemplate(fd).subscribe({
      next: () => { this.uploading = false; this.showUpload = false; this.resetUpload(); this.loadTemplates(); },
      error: (e: any) => { this.uploading = false; this.error = e?.error?.message || 'Upload failed'; }
    });
  }

  openAssign(template: any): void {
    this.selectedTemplate = template;
    this.assignTemplateId = template.id;
    this.assignCompanyId = null;
    this.companiesForAssign = this.companies.filter(c => !this.assignedCompanyIds(template).includes(c.id));
    this.showAssign = true;
    this.error = '';
  }

  saveAssign(): void {
    if (!this.assignTemplateId || !this.assignCompanyId) { this.error = 'Select a company'; return; }
    this.assigning = true;
    this.api.assignInvoiceTemplate(this.assignTemplateId, { companyId: this.assignCompanyId }).subscribe({
      next: () => { this.assigning = false; this.showAssign = false; this.loadTemplates(); },
      error: (e: any) => { this.assigning = false; this.error = e?.error?.message || 'Assign failed'; }
    });
  }

  removeAssignment(assignmentId: number, companyName: string, _template?: any): void {
    this.confirmTitle = 'Remove Assignment';
    this.confirmMessage = `Remove this template from ${companyName}?`;
    this.confirmAction = () => {
      this.api.removeTemplateAssignment(assignmentId).subscribe({ next: () => this.loadTemplates(), error: () => {} });
    };
    this.confirmVisible = true;
  }

  deactivate(template: any): void {
    this.confirmTitle = 'Deactivate Template';
    this.confirmMessage = `Deactivate "${template.name}"? All company assignments will stop.`;
    this.confirmAction = () => {
      this.api.deactivateInvoiceTemplate(template.id).subscribe({ next: () => this.loadTemplates(), error: () => {} });
    };
    this.confirmVisible = true;
  }

  onConfirmed(): void {
    if (this.confirmAction) this.confirmAction();
    this.confirmAction = null;
  }

  activeAssignments(template: any): any[] {
    return (template.assignments || []).filter((a: any) => a.isActive);
  }

  assignedCompanyIds(template: any): number[] {
    return this.activeAssignments(template).map((a: any) => a.companyId);
  }

  availableCompanies(template: any): any[] {
    const assigned = this.assignedCompanyIds(template);
    return this.companies.filter(c => !assigned.includes(c.id));
  }

  resetUpload(): void {
    this.uploadName = '';
    this.uploadDescription = '';
    this.uploadCompanyId = null;
    this.selectedFile = null;
    this.selectedFileName = '';
  }
}
