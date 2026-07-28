import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  NavBookingConfig, BkBlackoutDate,
  blankNavBookingConfig, DOW_LABELS, isDowAllowed, toggleDow
} from '../../../models/nav-booking-config.model';
import { AdminNavBookingConfigService } from '../../services/admin-nav-booking-config.service';

export interface BkType {
  id?: number;
  code: string;
  name: string;
  description: string;
  entityType: string;
  active: boolean;
}

export interface BkCondition {
  id?: number;
  bookingTypeCode: string;
  conditionType: 'CANCEL_WITHIN_DAYS' | 'CANCEL_BEFORE_EVENT_DAYS' | 'EDIT_WITHIN_DAYS' | 'EDIT_BEFORE_EVENT_DAYS';
  conditionValue: number;
  description: string;
  active: boolean;
}

export interface BkTerms {
  id?: number;
  bookingTypeCode: string;
  title: string;
  version: number;
  content: string;
  active: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
}

export interface BkAvailabilityConfig {
  id?: number;
  bookingTypeCode: string;
  entityId: number | null;
  allowMultiplePerDate: boolean;
  maxBookingsPerDate: number | null;
  active: boolean;
}

export interface BookingFormField {
  id?: number;
  fieldKey?: string;
  label: string;
  fieldType: string;   // TEXT | TEXTAREA | DROPDOWN | CHECKBOX_GROUP | DATE | NUMBER
  placeholder?: string;
  required: boolean;
  options?: string;    // JSON array string e.g. '["Option A","Option B"]'
  displayOrder: number;
  active: boolean;
}

export const FIXED_FIELDS = [
  { label: 'Full Name',             fieldType: 'TEXT',   required: true,  note: 'Always collected' },
  { label: 'Phone',                 fieldType: 'TEXT',   required: true,  note: 'Always collected' },
  { label: 'Email',                 fieldType: 'TEXT',   required: true,  note: 'Always collected' },
  { label: 'Number of People',      fieldType: 'NUMBER', required: true,  note: 'Always collected' },
  { label: 'Preferred Date',        fieldType: 'DATE',   required: false, note: 'Optional – configurable via Nav Booking Rules' },
];

@Component({
  selector: 'app-admin-booking-settings',
  templateUrl: './admin-booking-settings.component.html',
  styleUrls: ['./admin-booking-settings.component.scss']
})
export class AdminBookingSettingsComponent implements OnInit {
  private apiBase = `${environment.apiUrl}/admin/booking-settings`;

  activeTab: 'types' | 'conditions' | 'terms' | 'availability' | 'nav-rules' | 'form-fields' = 'conditions';

  readonly PAGE_SIZE = 6;

  // ── Booking Types ──
  types: BkType[] = [];
  typesLoading = false;
  typesError = '';
  typesSuccess = '';
  showTypeForm = false;
  editingType: BkType | null = null;
  typeForm: BkType = this.blankType();
  typesPage = 0;

  readonly ENTITY_TYPES = ['EVENT', 'PLACE', 'TOUR', 'ACCOMMODATION', 'ACTIVITY'];

  // ── Conditions ──
  conditions: BkCondition[] = [];
  conditionsLoading = false;
  conditionsError = '';
  conditionsSuccess = '';
  editingCondition: BkCondition | null = null;
  showConditionForm = false;
  conditionForm: BkCondition = this.blankCondition();
  conditionTypeFilter = '';
  conditionsPage = 0;

  readonly CONDITION_TYPES = [
    { value: 'CANCEL_WITHIN_DAYS',       label: 'Cancel: within N days of booking date' },
    { value: 'CANCEL_BEFORE_EVENT_DAYS', label: 'Cancel: at least N days before event date' },
    { value: 'EDIT_WITHIN_DAYS',         label: 'Edit: within N days of booking date' },
    { value: 'EDIT_BEFORE_EVENT_DAYS',   label: 'Edit: at least N days before event date' },
  ];

  // ── Terms ──
  terms: BkTerms[] = [];
  termsLoading = false;
  termsError = '';
  termsSuccess = '';
  showTermsForm = false;
  expandedTermsId: number | null = null;
  termsForm: BkTerms = this.blankTerms();
  termsPage = 0;

  // ── Availability ──
  availability: BkAvailabilityConfig[] = [];
  availLoading = false;
  availError = '';
  availSuccess = '';
  showAvailForm = false;
  availForm: BkAvailabilityConfig = this.blankAvail();
  availPage = 0;

  // ── Nav Booking Rules ──
  navConfigs: { id: number; routePath: string; labelKey: string; labelOverride?: string }[] = [];
  navRules: NavBookingConfig[] = [];
  navRulesLoading = false;
  navRulesError = '';
  navRulesSuccess = '';
  showNavRuleForm = false;
  editingNavRule: NavBookingConfig | null = null;
  navRuleForm: NavBookingConfig = blankNavBookingConfig();
  selectedNavConfigId = -1; // -1 = all nav items
  // Blackout date management within a rule
  showBlackoutForm = false;
  blackoutConfigId: number | null = null;
  blackoutDates: BkBlackoutDate[] = [];
  newBlackoutDate = '';
  newBlackoutReason = '';
  readonly DOW_LABELS = DOW_LABELS;
  readonly DATE_MODES = [
    { value: 'SINGLE', label: 'Single Date',  desc: 'Customer picks one visit date (day tour, event)' },
    { value: 'RANGE',  label: 'Date Range',   desc: 'Customer picks check-in + check-out (accommodation, multi-day tour)' },
    { value: 'MULTI',  label: 'Multi-Date',   desc: 'Customer picks multiple individual dates (recurring sessions)' },
    { value: 'NONE',   label: 'No Date',      desc: 'No date required (open voucher, gift package)' },
  ];

  // ── Form Fields ──
  readonly FIXED_FIELDS = FIXED_FIELDS;
  readonly FIELD_TYPES = [
    { value: 'TEXT',          label: 'Text Input' },
    { value: 'TEXTAREA',      label: 'Text Area' },
    { value: 'NUMBER',        label: 'Number' },
    { value: 'DATE',          label: 'Date Picker' },
    { value: 'DROPDOWN',      label: 'Dropdown (select one)' },
    { value: 'CHECKBOX_GROUP',label: 'Checkboxes (select many)' },
  ];
  formFields: BookingFormField[] = [];
  formFieldsLoading = false;
  formFieldsError = '';
  formFieldsSuccess = '';
  showFieldForm = false;
  editingField: BookingFormField | null = null;
  fieldForm: BookingFormField = this.blankField();
  fieldOptionInput = '';   // staging area for adding a new option item
  fieldOptions: string[] = []; // parsed list of options for the current form

  // ── Shared delete dialog ──
  showDeleteDialog = false;
  deleteDialogMessage = '';
  private pendingDeleteAction: (() => void) | null = null;

  // ── Loading states ──
  isSaving = false;
  isDeleting = false;

  constructor(
    private http: HttpClient,
    private navRuleService: AdminNavBookingConfigService
  ) {}

  ngOnInit(): void {
    this.loadTypes();
    this.loadConditions();
    this.loadTerms();
    this.loadAvailability();
    this.loadNavConfigs();
    this.loadFormFields();
  }

  get activeTypeNames(): string[] {
    return this.types.filter(t => t.active).map(t => t.code);
  }

  // ─────────────── PAGINATION ───────────────

  get pagedTypes(): BkType[] {
    const s = this.typesPage * this.PAGE_SIZE;
    return this.types.slice(s, s + this.PAGE_SIZE);
  }
  get typesTotalPages(): number { return Math.max(1, Math.ceil(this.types.length / this.PAGE_SIZE)); }
  prevTypesPage(): void { if (this.typesPage > 0) this.typesPage--; }
  nextTypesPage(): void { if (this.typesPage < this.typesTotalPages - 1) this.typesPage++; }

  get pagedConditions(): BkCondition[] {
    const s = this.conditionsPage * this.PAGE_SIZE;
    return this.filteredConditions.slice(s, s + this.PAGE_SIZE);
  }
  get conditionsTotalPages(): number { return Math.max(1, Math.ceil(this.filteredConditions.length / this.PAGE_SIZE)); }
  prevConditionsPage(): void { if (this.conditionsPage > 0) this.conditionsPage--; }
  nextConditionsPage(): void { if (this.conditionsPage < this.conditionsTotalPages - 1) this.conditionsPage++; }

  setConditionFilter(code: string): void {
    this.conditionTypeFilter = code;
    this.conditionsPage = 0;
  }

  get pagedTerms(): BkTerms[] {
    const s = this.termsPage * this.PAGE_SIZE;
    return this.terms.slice(s, s + this.PAGE_SIZE);
  }
  get termsTotalPages(): number { return Math.max(1, Math.ceil(this.terms.length / this.PAGE_SIZE)); }
  prevTermsPage(): void { if (this.termsPage > 0) this.termsPage--; }
  nextTermsPage(): void { if (this.termsPage < this.termsTotalPages - 1) this.termsPage++; }

  get pagedAvailability(): BkAvailabilityConfig[] {
    const s = this.availPage * this.PAGE_SIZE;
    return this.availability.slice(s, s + this.PAGE_SIZE);
  }
  get availTotalPages(): number { return Math.max(1, Math.ceil(this.availability.length / this.PAGE_SIZE)); }
  prevAvailPage(): void { if (this.availPage > 0) this.availPage--; }
  nextAvailPage(): void { if (this.availPage < this.availTotalPages - 1) this.availPage++; }

  // ─────────────── BOOKING TYPES ───────────────

  loadTypes(): void {
    this.typesLoading = true;
    this.http.get<BkType[]>(`${this.apiBase}/types`).subscribe({
      next: (d) => { this.types = d; this.typesLoading = false; },
      error: () => { this.typesError = 'Failed to load booking types.'; this.typesLoading = false; }
    });
  }

  openNewType(): void {
    this.typeForm = this.blankType();
    this.editingType = null;
    this.showTypeForm = true;
  }

  editType(t: BkType): void {
    this.typeForm = { ...t };
    this.editingType = t;
    this.showTypeForm = true;
  }

  saveType(): void {
    this.isSaving = true;
    const req = this.editingType
      ? this.http.put<BkType>(`${this.apiBase}/types/${this.typeForm.id}`, this.typeForm)
      : this.http.post<BkType>(`${this.apiBase}/types`, this.typeForm);
    req.subscribe({
      next: () => {
        this.isSaving = false;
        this.typesSuccess = 'Booking type saved.';
        this.showTypeForm = false;
        this.loadTypes();
        setTimeout(() => this.typesSuccess = '', 3000);
      },
      error: () => { this.isSaving = false; this.typesError = 'Failed to save booking type.'; }
    });
  }

  deleteType(t: BkType): void {
    this.deleteDialogMessage = `Delete booking type "${t.name}"? All conditions and terms linked to "${t.code}" must be removed first.`;
    this.pendingDeleteAction = () => {
      this.http.delete(`${this.apiBase}/types/${t.id}`).subscribe({
        next: () => { this.types = this.types.filter(x => x.id !== t.id); },
        error: () => { this.typesError = 'Cannot delete — booking type may still be in use.'; }
      });
    };
    this.showDeleteDialog = true;
  }

  private blankType(): BkType {
    return { code: '', name: '', description: '', entityType: 'EVENT', active: true };
  }

  // ─────────────── CONDITIONS ───────────────

  loadConditions(): void {
    this.conditionsLoading = true;
    this.http.get<BkCondition[]>(`${this.apiBase}/conditions`).subscribe({
      next: (d) => { this.conditions = d; this.conditionsLoading = false; },
      error: () => { this.conditionsError = 'Failed to load conditions.'; this.conditionsLoading = false; }
    });
  }

  get filteredConditions(): BkCondition[] {
    if (!this.conditionTypeFilter) return this.conditions;
    return this.conditions.filter(c => c.bookingTypeCode === this.conditionTypeFilter);
  }

  openNewCondition(): void {
    this.conditionForm = this.blankCondition();
    this.editingCondition = null;
    this.showConditionForm = true;
  }

  editCondition(c: BkCondition): void {
    this.conditionForm = { ...c };
    this.editingCondition = c;
    this.showConditionForm = true;
  }

  saveCondition(): void {
    this.isSaving = true;
    const req = this.editingCondition
      ? this.http.put<BkCondition>(`${this.apiBase}/conditions/${this.conditionForm.id}`, this.conditionForm)
      : this.http.post<BkCondition>(`${this.apiBase}/conditions`, this.conditionForm);
    req.subscribe({
      next: () => {
        this.isSaving = false;
        this.conditionsSuccess = 'Rule saved.';
        this.showConditionForm = false;
        this.loadConditions();
        setTimeout(() => this.conditionsSuccess = '', 3000);
      },
      error: () => { this.isSaving = false; this.conditionsError = 'Failed to save rule.'; }
    });
  }

  deleteCondition(c: BkCondition): void {
    this.deleteDialogMessage = `Delete rule "${c.description || c.conditionType}"?`;
    this.pendingDeleteAction = () => {
      this.http.delete(`${this.apiBase}/conditions/${c.id}`).subscribe({
        next: () => { this.conditions = this.conditions.filter(x => x.id !== c.id); },
        error: () => { this.conditionsError = 'Failed to delete rule.'; }
      });
    };
    this.showDeleteDialog = true;
  }

  toggleConditionActive(c: BkCondition): void {
    const updated = { ...c, active: !c.active };
    this.http.put<BkCondition>(`${this.apiBase}/conditions/${c.id}`, updated).subscribe({
      next: (res) => { const i = this.conditions.findIndex(x => x.id === c.id); if (i >= 0) this.conditions[i] = res; }
    });
  }

  conditionTypeLabel(type: string, value?: number): string {
    const label = this.CONDITION_TYPES.find(t => t.value === type)?.label ?? type;
    return value !== undefined ? label.replace('N', String(value)) : label;
  }

  conditionKind(type: string): 'cancel' | 'edit' {
    return type.startsWith('CANCEL') ? 'cancel' : 'edit';
  }

  countConditions(typeCode: string): number {
    return this.conditions.filter(c => c.bookingTypeCode === typeCode).length;
  }

  private blankCondition(): BkCondition {
    const defaultType = this.activeTypeNames[0] ?? 'EVENT';
    return { bookingTypeCode: defaultType, conditionType: 'CANCEL_WITHIN_DAYS', conditionValue: 7, description: '', active: true };
  }

  // ─────────────── TERMS ───────────────

  loadTerms(): void {
    this.termsLoading = true;
    this.http.get<BkTerms[]>(`${this.apiBase}/terms`).subscribe({
      next: (d) => { this.terms = d; this.termsLoading = false; },
      error: () => { this.termsError = 'Failed to load terms.'; this.termsLoading = false; }
    });
  }

  openNewTerms(): void {
    this.termsForm = this.blankTerms();
    this.showTermsForm = true;
  }

  saveTerms(): void {
    this.isSaving = true;
    this.http.post<BkTerms>(`${this.apiBase}/terms`, this.termsForm).subscribe({
      next: () => {
        this.isSaving = false;
        this.termsSuccess = 'Terms saved.';
        this.showTermsForm = false;
        this.loadTerms();
        setTimeout(() => this.termsSuccess = '', 3000);
      },
      error: () => { this.isSaving = false; this.termsError = 'Failed to save terms.'; }
    });
  }

  activateTerms(t: BkTerms): void {
    this.http.patch(`${this.apiBase}/terms/${t.id}/activate`, {}).subscribe({
      next: () => { this.loadTerms(); },
      error: () => { this.termsError = 'Failed to activate terms.'; }
    });
  }

  deleteTerms(t: BkTerms): void {
    this.deleteDialogMessage = `Delete terms v${t.version} for ${t.bookingTypeCode}? This action cannot be undone.`;
    this.pendingDeleteAction = () => {
      this.http.delete(`${this.apiBase}/terms/${t.id}`).subscribe({
        next: () => { this.terms = this.terms.filter(x => x.id !== t.id); }
      });
    };
    this.showDeleteDialog = true;
  }

  toggleTermsExpand(id: number): void {
    this.expandedTermsId = this.expandedTermsId === id ? null : id;
  }

  private blankTerms(): BkTerms {
    const defaultType = this.activeTypeNames[0] ?? 'EVENT';
    const today = new Date().toISOString().substring(0, 10);
    return { bookingTypeCode: defaultType, title: '', version: 1, content: '', active: true, effectiveFrom: today, effectiveTo: null };
  }

  // ─────────────── AVAILABILITY ───────────────

  loadAvailability(): void {
    this.availLoading = true;
    this.http.get<BkAvailabilityConfig[]>(`${this.apiBase}/availability`).subscribe({
      next: (d) => { this.availability = d; this.availLoading = false; },
      error: () => { this.availError = 'Failed to load availability config.'; this.availLoading = false; }
    });
  }

  openNewAvail(): void {
    this.availForm = this.blankAvail();
    this.showAvailForm = true;
  }

  editAvail(a: BkAvailabilityConfig): void {
    this.availForm = { ...a };
    this.showAvailForm = true;
  }

  saveAvail(): void {
    this.isSaving = true;
    const req = this.availForm.id
      ? this.http.put<BkAvailabilityConfig>(`${this.apiBase}/availability/${this.availForm.id}`, this.availForm)
      : this.http.post<BkAvailabilityConfig>(`${this.apiBase}/availability`, this.availForm);
    req.subscribe({
      next: () => {
        this.isSaving = false;
        this.availSuccess = 'Config saved.';
        this.showAvailForm = false;
        this.loadAvailability();
        setTimeout(() => this.availSuccess = '', 3000);
      },
      error: () => { this.isSaving = false; this.availError = 'Failed to save config.'; }
    });
  }

  deleteAvail(a: BkAvailabilityConfig): void {
    this.deleteDialogMessage = `Delete availability config for ${a.bookingTypeCode}?`;
    this.pendingDeleteAction = () => {
      this.http.delete(`${this.apiBase}/availability/${a.id}`).subscribe({
        next: () => { this.availability = this.availability.filter(x => x.id !== a.id); }
      });
    };
    this.showDeleteDialog = true;
  }

  // ─────────────── BOOKING FORM FIELDS ───────────────

  loadFormFields(): void {
    this.formFieldsLoading = true;
    this.http.get<BookingFormField[]>(`${this.apiBase}/form-fields`).subscribe({
      next: (d) => { this.formFields = d; this.formFieldsLoading = false; },
      error: () => { this.formFieldsError = 'Failed to load form fields.'; this.formFieldsLoading = false; }
    });
  }

  openNewField(): void {
    this.fieldForm = this.blankField();
    this.fieldOptions = [];
    this.fieldOptionInput = '';
    this.editingField = null;
    this.showFieldForm = true;
  }

  editField(f: BookingFormField): void {
    this.fieldForm = { ...f };
    this.editingField = f;
    try { this.fieldOptions = f.options ? JSON.parse(f.options) : []; } catch { this.fieldOptions = []; }
    this.fieldOptionInput = '';
    this.showFieldForm = true;
  }

  addFieldOption(): void {
    const val = this.fieldOptionInput.trim();
    if (val && !this.fieldOptions.includes(val)) {
      this.fieldOptions.push(val);
      this.fieldOptionInput = '';
    }
  }

  removeFieldOption(i: number): void {
    this.fieldOptions.splice(i, 1);
  }

  needsOptions(): boolean {
    return this.fieldForm.fieldType === 'DROPDOWN' || this.fieldForm.fieldType === 'CHECKBOX_GROUP';
  }

  saveField(): void {
    const payload: BookingFormField = {
      ...this.fieldForm,
      options: this.needsOptions() ? JSON.stringify(this.fieldOptions) : undefined,
    };
    this.isSaving = true;
    const req = this.editingField
      ? this.http.put<BookingFormField>(`${this.apiBase}/form-fields/${payload.id}`, payload)
      : this.http.post<BookingFormField>(`${this.apiBase}/form-fields`, payload);
    req.subscribe({
      next: () => {
        this.isSaving = false;
        this.formFieldsSuccess = 'Form field saved.';
        this.showFieldForm = false;
        this.loadFormFields();
        setTimeout(() => this.formFieldsSuccess = '', 3000);
      },
      error: () => { this.isSaving = false; this.formFieldsError = 'Failed to save form field.'; }
    });
  }

  toggleFieldActive(f: BookingFormField): void {
    const updated = { ...f, active: !f.active };
    this.http.put<BookingFormField>(`${this.apiBase}/form-fields/${f.id}`, updated).subscribe({
      next: (res) => { const i = this.formFields.findIndex(x => x.id === f.id); if (i >= 0) this.formFields[i] = res; }
    });
  }

  deleteField(f: BookingFormField): void {
    this.deleteDialogMessage = `Delete form field "${f.label}"? This will remove it from the booking form.`;
    this.pendingDeleteAction = () => {
      this.http.delete(`${this.apiBase}/form-fields/${f.id}`).subscribe({
        next: () => { this.formFields = this.formFields.filter(x => x.id !== f.id); },
        error: () => { this.formFieldsError = 'Failed to delete form field.'; }
      });
    };
    this.showDeleteDialog = true;
  }

  private blankField(): BookingFormField {
    return { label: '', fieldType: 'TEXT', placeholder: '', required: false, options: undefined, displayOrder: this.formFields.length, active: true };
  }

  confirmDelete(): void {
    this.isDeleting = true;
    const action = this.pendingDeleteAction;
    this.pendingDeleteAction = null;
    this.showDeleteDialog = false;
    if (action) {
      // Wrap in setTimeout to let the dialog close and spinner render first
      setTimeout(() => {
        action();
        this.isDeleting = false;
      }, 0);
    } else {
      this.isDeleting = false;
    }
  }

  private blankAvail(): BkAvailabilityConfig {
    const defaultType = this.activeTypeNames[0] ?? 'EVENT';
    return { bookingTypeCode: defaultType, entityId: null, allowMultiplePerDate: true, maxBookingsPerDate: null, active: true };
  }

  // ─────────────── NAV BOOKING RULES ───────────────

  loadNavConfigs(): void {
    this.http.get<any[]>(`${environment.apiUrl}/admin/nav-config`).subscribe({
      next: (d) => { this.navConfigs = d; },
      error: () => {}
    });
  }

  loadNavRules(navConfigId?: number): void {
    this.navRulesLoading = true;
    this.navRulesError = '';
    const obs = navConfigId && navConfigId > 0
      ? this.navRuleService.getByNavConfigId(navConfigId)
      : this.navRuleService.getAll();
    obs.subscribe({
      next: (d) => { this.navRules = d; this.navRulesLoading = false; },
      error: () => { this.navRulesError = 'Failed to load rules.'; this.navRulesLoading = false; }
    });
  }

  onNavConfigFilterChange(): void {
    this.loadNavRules(this.selectedNavConfigId > 0 ? this.selectedNavConfigId : undefined);
  }

  openNewNavRule(): void {
    this.navRuleForm = blankNavBookingConfig(this.selectedNavConfigId > 0 ? this.selectedNavConfigId : 0);
    this.editingNavRule = null;
    this.showNavRuleForm = true;
  }

  editNavRule(rule: NavBookingConfig): void {
    this.navRuleForm = { ...rule };
    this.editingNavRule = rule;
    this.showNavRuleForm = true;
  }

  saveNavRule(): void {
    this.isSaving = true;
    const obs = this.editingNavRule
      ? this.navRuleService.update(this.navRuleForm.id!, this.navRuleForm)
      : this.navRuleService.create(this.navRuleForm);
    obs.subscribe({
      next: () => {
        this.isSaving = false;
        this.navRulesSuccess = 'Rule saved.';
        this.showNavRuleForm = false;
        this.loadNavRules(this.selectedNavConfigId ?? undefined);
        setTimeout(() => this.navRulesSuccess = '', 3000);
      },
      error: (e) => { this.isSaving = false; this.navRulesError = e?.error?.message ?? 'Failed to save rule.'; }
    });
  }

  toggleNavRuleActive(rule: NavBookingConfig): void {
    this.navRuleService.toggleActive(rule.id!).subscribe({
      next: (r) => { const i = this.navRules.findIndex(x => x.id === rule.id); if (i >= 0) this.navRules[i] = r; }
    });
  }

  deleteNavRule(rule: NavBookingConfig): void {
    const navLabel = rule.navConfig?.labelOverride || rule.navConfig?.routePath || '';
    this.deleteDialogMessage = `Delete booking rule for "${rule.bookingTypeCode}" on "${navLabel}"?`;
    this.pendingDeleteAction = () => {
      this.navRuleService.delete(rule.id!).subscribe({
        next: () => { this.navRules = this.navRules.filter(x => x.id !== rule.id); },
        error: () => { this.navRulesError = 'Failed to delete rule.'; }
      });
    };
    this.showDeleteDialog = true;
  }

  navConfigLabel(id: number): string {
    const c = this.navConfigs.find(n => n.id === id);
    return c ? (c.labelOverride || c.routePath) : String(id);
  }

  // Day-of-week helpers
  isDowAllowed(dayIndex: number): boolean {
    return isDowAllowed(this.navRuleForm.allowedDow, dayIndex);
  }

  toggleDow(dayIndex: number): void {
    if (this.navRuleForm.allowedDow === null) {
      // null = all days; first toggle selects all EXCEPT this day
      this.navRuleForm.allowedDow = 127 ^ (1 << dayIndex); // 127 = all 7 bits
    } else {
      const next = toggleDow(this.navRuleForm.allowedDow, dayIndex);
      // If all 7 bits set, reset to null (= unrestricted)
      this.navRuleForm.allowedDow = next === 127 ? null : next;
    }
  }

  // Blackout dates
  openBlackoutManager(rule: NavBookingConfig): void {
    this.blackoutConfigId = rule.id!;
    this.blackoutDates = [];
    this.newBlackoutDate = '';
    this.newBlackoutReason = '';
    this.showBlackoutForm = true;
    this.navRuleService.getBlackoutDates(rule.id!).subscribe({
      next: (d) => this.blackoutDates = d,
      error: () => {}
    });
  }

  addBlackoutDate(): void {
    if (!this.blackoutConfigId || !this.newBlackoutDate) return;
    this.navRuleService.addBlackoutDate(this.blackoutConfigId, this.newBlackoutDate, this.newBlackoutReason).subscribe({
      next: (d) => { this.blackoutDates.push(d); this.newBlackoutDate = ''; this.newBlackoutReason = ''; },
      error: (e) => { this.navRulesError = e?.error?.message ?? 'Failed to add date.'; }
    });
  }

  removeBlackoutDate(b: BkBlackoutDate): void {
    this.navRuleService.removeBlackoutDate(this.blackoutConfigId!, b.id!).subscribe({
      next: () => { this.blackoutDates = this.blackoutDates.filter(x => x.id !== b.id); }
    });
  }
}
