import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { AdminApiService } from '../../services/admin-api.service';
import { FieldDefinition } from '../../../models/more-section.model';

// Register Quill image resize module dynamically to avoid webpack 'imports' error
declare var require: any;
const Quill = require('quill');
// @ts-ignore
const ImageResize = require('quill-image-resize-module--fix-imports-error').default;
Quill.register('modules/imageResize', ImageResize);

// Register custom Divider blot for horizontal rule
const BlockEmbed = Quill.import('blots/block/embed');
class DividerBlot extends BlockEmbed {
  static blotName = 'divider';
  static tagName = 'hr';
}
Quill.register(DividerBlot);

@Component({
  selector: 'app-admin-more-sections',
  templateUrl: './admin-more-sections.component.html',
  styleUrls: ['./admin-more-sections.component.scss']
})
export class AdminMoreSectionsComponent implements OnInit, OnDestroy {
  // Sections
  sections: any[] = [];
  isLoading = true;

  // Section modal
  showSectionModal = false;
  isEditingSection = false;
  editingSectionId: number | null = null;
  sectionForm: any = { name: '', slug: '', description: '', imageUrl: '', displayOrder: 0, active: true, additionalFieldDefinitions: [] };

  // Field definitions
  fieldTypes: { value: string; label: string }[] = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'date_range', label: 'Date Range' },
    { value: 'number_range', label: 'Number Range' },
    { value: 'select', label: 'Single Select' },
    { value: 'multi_select', label: 'Multi Select' },
    { value: 'link', label: 'Link' }
  ];

  // Items view
  selectedSection: any = null;
  items: any[] = [];
  isLoadingItems = false;

  // Item modal
  showItemModal = false;
  isEditingItem = false;
  editingItemId: number | null = null;
  itemForm: any = { title: '', shortDescription: '', description: '', imageUrl: '', link: '', contentType: 'simple', articleContent: '', displayOrder: 0, active: true, additionalDetails: {} };

  // Fullscreen & editor state
  isFullscreen = false;
  isFocusMode = false;
  showShortcutsPanel = false;
  wordCount = 0;
  charCount = 0;
  readingTime = 0;
  autoSaveStatus: 'saved' | 'saving' | 'unsaved' = 'saved';
  private autoSaveTimer: any = null;
  private lastSavedContent = '';
  private quillInstance: any = null;
  isDraggingOver = false;

  // Floating selection toolbar
  floatingToolbar = { visible: false, top: 0, left: 0 };
  private selectionChangeHandler: any = null;

  // Side insert menu
  sideMenu = { visible: false, top: 0, expanded: false };
  private cursorChangeHandler: any = null;

  // Link tooltip
  linkTooltip = { visible: false, top: 0, left: 0, url: '' };
  private linkHoverHandler: any = null;
  private linkLeaveHandler: any = null;
  private linkTooltipTimer: any = null;

  // Quill editor config — enhanced Medium-like toolbar
  quillModules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ script: 'sub' }, { script: 'super' }],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        [{ align: [] }],
        ['divider'],
        ['clean']
      ],
      handlers: {
        divider: null as any // will be set in onEditorCreated
      }
    },
    imageResize: {
      displaySize: true,
      modules: ['Resize', 'DisplaySize', 'Toolbar']
    },
    keyboard: {
      bindings: {
        // Ctrl/Cmd+Shift+1 = H1
        header1: { key: '1', shortKey: true, shiftKey: true, handler: function(this: any) { this.quill.format('header', 1); } },
        // Ctrl/Cmd+Shift+2 = H2
        header2: { key: '2', shortKey: true, shiftKey: true, handler: function(this: any) { this.quill.format('header', 2); } },
        // Ctrl/Cmd+Shift+3 = H3
        header3: { key: '3', shortKey: true, shiftKey: true, handler: function(this: any) { this.quill.format('header', 3); } }
      }
    }
  };

  // Delete confirmation
  showDeleteConfirm = false;
  deleteTarget: { type: 'section' | 'item'; id: number; name: string } | null = null;

  // Messages
  successMessage = '';
  errorMessage = '';

  constructor(
    private adminApi: AdminApiService
  ) {}

  // Image upload handlers
  onSectionImageUploaded(url: string): void {
    this.sectionForm.imageUrl = url;
  }

  onItemImageUploaded(url: string): void {
    this.itemForm.imageUrl = url;
  }

  // --- Fullscreen & Editor Features ---

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    if (this.isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      this.isFocusMode = false;
    }
  }

  toggleFocusMode(): void {
    this.isFocusMode = !this.isFocusMode;
  }

  toggleShortcutsPanel(): void {
    this.showShortcutsPanel = !this.showShortcutsPanel;
  }

  onEditorCreated(editor: any): void {
    this.quillInstance = editor;
    this.lastSavedContent = this.itemForm.articleContent || '';

    // Register divider handler
    const toolbar = editor.getModule('toolbar');
    toolbar.addHandler('divider', () => {
      const range = editor.getSelection(true);
      editor.insertText(range.index, '\n', 'user');
      editor.insertEmbed(range.index + 1, 'divider', true, 'user');
      editor.setSelection(range.index + 2, 'silent');
    });

    // Setup drag-and-drop for images
    const editorEl = editor.root;
    editorEl.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.isDraggingOver = true;
    });
    editorEl.addEventListener('dragleave', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.isDraggingOver = false;
    });
    editorEl.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.isDraggingOver = false;
      if (e.dataTransfer?.files?.length) {
        this.handleDroppedFiles(e.dataTransfer.files, editor);
      }
    });

    // --- Floating selection toolbar ---
    this.selectionChangeHandler = () => {
      const sel = editor.getSelection();
      if (sel && sel.length > 0) {
        this.showFloatingToolbar(editor, sel);
      } else {
        this.floatingToolbar.visible = false;
      }
    };
    editor.on('selection-change', this.selectionChangeHandler);

    // --- Side "+" insert menu ---
    this.cursorChangeHandler = (range: any) => {
      if (!range || range.length > 0) {
        this.sideMenu.visible = false;
        this.sideMenu.expanded = false;
        return;
      }
      this.updateSideMenu(editor, range);
    };
    editor.on('selection-change', this.cursorChangeHandler);

    // --- Link hover tooltip ---
    this.linkHoverHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href') || '';
        const rect = anchor.getBoundingClientRect();
        const containerRect = editorEl.closest('.editor-wrapper')?.getBoundingClientRect() ||
                              editorEl.closest('.editor-container')?.getBoundingClientRect();
        if (containerRect) {
          this.linkTooltip = {
            visible: true,
            top: rect.bottom - containerRect.top + 4,
            left: rect.left - containerRect.left + (rect.width / 2),
            url: href
          };
        }
        if (this.linkTooltipTimer) { clearTimeout(this.linkTooltipTimer); }
      }
    };
    this.linkLeaveHandler = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement;
      if (related?.closest('.link-tooltip')) return;
      this.linkTooltipTimer = setTimeout(() => {
        this.linkTooltip.visible = false;
      }, 300);
    };
    editorEl.addEventListener('mouseover', this.linkHoverHandler);
    editorEl.addEventListener('mouseout', this.linkLeaveHandler);

    // --- Markdown auto-shortcuts ---
    editor.keyboard.addBinding({ key: 'Enter' }, {
      collapsed: true,
      prefix: /^---$/
    }, (range: any) => {
      const lineStart = range.index - 3;
      editor.deleteText(lineStart, 3, 'user');
      editor.insertEmbed(lineStart, 'divider', true, 'user');
      editor.setSelection(lineStart + 1, 0, 'silent');
      return false;
    });
  }

  private handleDroppedFiles(files: FileList, editor: any): void {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          const range = editor.getSelection(true);
          editor.insertEmbed(range.index, 'image', reader.result, 'user');
          editor.setSelection(range.index + 1, 'silent');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  onContentChanged(event: any): void {
    if (!event?.text) return;
    const text = event.text.trim();
    this.charCount = text.length;
    this.wordCount = text ? text.split(/\s+/).filter((w: string) => w.length > 0).length : 0;
    this.readingTime = Math.max(1, Math.ceil(this.wordCount / 200));

    // Auto-save indicator
    if (this.itemForm.articleContent !== this.lastSavedContent) {
      this.autoSaveStatus = 'unsaved';
      this.startAutoSaveTimer();
    }
  }

  private startAutoSaveTimer(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    this.autoSaveTimer = setTimeout(() => {
      this.autoSaveStatus = 'saving';
      // Simulate save delay — in real scenario this would call API
      setTimeout(() => {
        this.lastSavedContent = this.itemForm.articleContent;
        this.autoSaveStatus = 'saved';
      }, 500);
    }, 2000);
  }

  editorUndo(): void {
    if (this.quillInstance) {
      this.quillInstance.history.undo();
    }
  }

  editorRedo(): void {
    if (this.quillInstance) {
      this.quillInstance.history.redo();
    }
  }

  // --- Floating toolbar helpers ---

  private showFloatingToolbar(editor: any, selection: any): void {
    const bounds = editor.getBounds(selection.index, selection.length);
    const editorEl = editor.root;
    const containerRect = editorEl.closest('.editor-wrapper')?.getBoundingClientRect() ||
                          editorEl.closest('.editor-container')?.getBoundingClientRect();
    if (!containerRect) return;

    const editorRect = editorEl.getBoundingClientRect();
    this.floatingToolbar = {
      visible: true,
      top: bounds.top + (editorRect.top - containerRect.top) - 48,
      left: bounds.left + (editorRect.left - containerRect.left) + (bounds.width / 2)
    };
  }

  floatingFormat(format: string, value: any = true): void {
    if (!this.quillInstance) return;
    const sel = this.quillInstance.getSelection();
    if (!sel) return;

    if (format === 'header') {
      const current = this.quillInstance.getFormat(sel);
      this.quillInstance.format('header', current.header === value ? false : value, 'user');
    } else if (format === 'blockquote') {
      const current = this.quillInstance.getFormat(sel);
      this.quillInstance.format('blockquote', !current.blockquote, 'user');
    } else if (format === 'link') {
      const current = this.quillInstance.getFormat(sel);
      if (current.link) {
        this.quillInstance.format('link', false, 'user');
      } else {
        const url = prompt('Enter URL:');
        if (url) {
          this.quillInstance.format('link', url, 'user');
        }
      }
    } else {
      const current = this.quillInstance.getFormat(sel);
      this.quillInstance.format(format, !current[format], 'user');
    }
  }

  getSelectionFormat(format: string): any {
    if (!this.quillInstance) return false;
    const sel = this.quillInstance.getSelection();
    if (!sel) return false;
    const formats = this.quillInstance.getFormat(sel);
    return formats[format];
  }

  // --- Side insert menu helpers ---

  private updateSideMenu(editor: any, range: any): void {
    const [line] = editor.getLine(range.index);
    if (!line) {
      this.sideMenu.visible = false;
      return;
    }

    const lineText = line.domNode?.textContent || '';
    const isEmptyLine = lineText.trim() === '' || lineText === '\n';

    if (isEmptyLine) {
      const bounds = editor.getBounds(range.index, 0);
      const editorEl = editor.root;
      const editorRect = editorEl.getBoundingClientRect();
      const containerRect = editorEl.closest('.editor-wrapper')?.getBoundingClientRect() ||
                            editorEl.closest('.editor-container')?.getBoundingClientRect();
      if (containerRect) {
        this.sideMenu = {
          visible: true,
          top: bounds.top + (editorRect.top - containerRect.top),
          expanded: false
        };
      }
    } else {
      this.sideMenu.visible = false;
      this.sideMenu.expanded = false;
    }
  }

  toggleSideMenuExpand(): void {
    this.sideMenu.expanded = !this.sideMenu.expanded;
  }

  sideInsert(type: string): void {
    if (!this.quillInstance) return;
    const range = this.quillInstance.getSelection(true);
    if (!range) return;

    switch (type) {
      case 'image': {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = () => {
          const file = input.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              this.quillInstance.insertEmbed(range.index, 'image', reader.result, 'user');
              this.quillInstance.setSelection(range.index + 1, 0, 'silent');
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
        break;
      }
      case 'video': {
        const url = prompt('Paste a video URL (YouTube, Vimeo, etc.):');
        if (url) {
          this.quillInstance.insertEmbed(range.index, 'video', url, 'user');
          this.quillInstance.setSelection(range.index + 1, 0, 'silent');
        }
        break;
      }
      case 'divider': {
        this.quillInstance.insertEmbed(range.index, 'divider', true, 'user');
        this.quillInstance.insertText(range.index + 1, '\n', 'user');
        this.quillInstance.setSelection(range.index + 2, 0, 'silent');
        break;
      }
      case 'code': {
        this.quillInstance.insertText(range.index, '\n', 'user');
        this.quillInstance.formatLine(range.index + 1, 1, 'code-block', true, 'user');
        this.quillInstance.setSelection(range.index + 1, 0, 'silent');
        break;
      }
    }
    this.sideMenu.expanded = false;
    this.sideMenu.visible = false;
  }

  // --- Link tooltip helpers ---

  onLinkTooltipEnter(): void {
    if (this.linkTooltipTimer) { clearTimeout(this.linkTooltipTimer); }
  }

  onLinkTooltipLeave(): void {
    this.linkTooltipTimer = setTimeout(() => {
      this.linkTooltip.visible = false;
    }, 300);
  }

  editLink(): void {
    if (!this.quillInstance || !this.linkTooltip.url) return;
    const newUrl = prompt('Edit URL:', this.linkTooltip.url);
    if (newUrl !== null) {
      // Find the link at the current position and update it
      const delta = this.quillInstance.getContents();
      let pos = 0;
      for (const op of delta.ops) {
        const len = typeof op.insert === 'string' ? op.insert.length : 1;
        if (op.attributes?.link === this.linkTooltip.url) {
          this.quillInstance.formatText(pos, len, 'link', newUrl || false, 'user');
          break;
        }
        pos += len;
      }
    }
    this.linkTooltip.visible = false;
  }

  removeLink(): void {
    if (!this.quillInstance || !this.linkTooltip.url) return;
    const delta = this.quillInstance.getContents();
    let pos = 0;
    for (const op of delta.ops) {
      const len = typeof op.insert === 'string' ? op.insert.length : 1;
      if (op.attributes?.link === this.linkTooltip.url) {
        this.quillInstance.formatText(pos, len, 'link', false, 'user');
        break;
      }
      pos += len;
    }
    this.linkTooltip.visible = false;
  }

  ngOnDestroy(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    document.body.style.overflow = '';
  }

  getItemCount(section: any): number {
    return section.items?.length || 0;
  }

  private hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  ngOnInit(): void {
    this.loadSections();
  }

  onContentTypeChange(type: string): void {
    this.itemForm.contentType = type;
  }

  loadSections(): void {
    this.isLoading = true;
    this.adminApi.getMoreSections(0, 100).subscribe({
      next: (response) => {
        this.sections = response.content;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load sections';
        this.isLoading = false;
      }
    });
  }

  generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  onSectionNameChange(): void {
    if (!this.isEditingSection) {
      this.sectionForm.slug = this.generateSlug(this.sectionForm.name);
    }
  }

  openAddSection(): void {
    this.sectionForm = { name: '', slug: '', description: '', imageUrl: '', displayOrder: 0, active: true, additionalFieldDefinitions: [] };
    this.isEditingSection = false;
    this.editingSectionId = null;
    this.showSectionModal = true;
  }

  openEditSection(section: any): void {
    this.sectionForm = { ...section, additionalFieldDefinitions: section.additionalFieldDefinitions ? [...section.additionalFieldDefinitions.map((f: any) => ({ ...f, options: f.options ? [...f.options] : [] }))] : [] };
    this.isEditingSection = true;
    this.editingSectionId = section.id;
    this.showSectionModal = true;
  }

  closeSectionModal(): void {
    this.showSectionModal = false;
  }

  saveSection(): void {
    if (!this.sectionForm.name || !this.sectionForm.slug) return;

    const obs = this.isEditingSection
      ? this.adminApi.updateMoreSection(this.editingSectionId!, this.sectionForm)
      : this.adminApi.createMoreSection(this.sectionForm);

    obs.subscribe({
      next: () => {
        this.successMessage = this.isEditingSection ? 'Section updated!' : 'Section created!';
        this.hideMessageAfterDelay();
        this.closeSectionModal();
        this.loadSections();
      },
      error: () => {
        this.errorMessage = 'Failed to save section';
        this.hideMessageAfterDelay();
      }
    });
  }

  toggleSectionActive(section: any): void {
    this.adminApi.toggleMoreSectionActive(section.id).subscribe({
      next: () => this.loadSections(),
      error: () => { this.errorMessage = 'Failed to toggle status'; this.hideMessageAfterDelay(); }
    });
  }

  // Items management
  selectSection(section: any): void {
    this.selectedSection = section;
    this.loadItems();
  }

  backToSections(): void {
    this.selectedSection = null;
    this.items = [];
  }

  loadItems(): void {
    if (!this.selectedSection) return;
    this.isLoadingItems = true;
    this.adminApi.getMoreSectionItems(this.selectedSection.id).subscribe({
      next: (items) => {
        this.items = items;
        this.isLoadingItems = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load items';
        this.isLoadingItems = false;
      }
    });
  }

  openAddItem(): void {
    this.itemForm = { title: '', shortDescription: '', description: '', imageUrl: '', link: '', contentType: 'simple', articleContent: '', displayOrder: 0, active: true, additionalDetails: {} };
    // Pre-populate additionalDetails keys from section field definitions
    if (this.selectedSection?.additionalFieldDefinitions) {
      for (const field of this.selectedSection.additionalFieldDefinitions) {
        if (field.type === 'date_range') {
          this.itemForm.additionalDetails[field.key] = { from: '', to: '' };
        } else if (field.type === 'number_range') {
          this.itemForm.additionalDetails[field.key] = { min: null, max: null };
        } else if (field.type === 'multi_select') {
          this.itemForm.additionalDetails[field.key] = [];
        } else {
          this.itemForm.additionalDetails[field.key] = null;
        }
      }
    }
    this.isEditingItem = false;
    this.editingItemId = null;
    this.showItemModal = true;
  }

  openEditItem(item: any): void {
    this.itemForm = { ...item, additionalDetails: item.additionalDetails ? { ...item.additionalDetails } : {} };
    // Ensure all field definitions have corresponding entries
    if (this.selectedSection?.additionalFieldDefinitions) {
      for (const field of this.selectedSection.additionalFieldDefinitions) {
        if (this.itemForm.additionalDetails[field.key] === undefined) {
          if (field.type === 'date_range') {
            this.itemForm.additionalDetails[field.key] = { from: '', to: '' };
          } else if (field.type === 'number_range') {
            this.itemForm.additionalDetails[field.key] = { min: null, max: null };
          } else if (field.type === 'multi_select') {
            this.itemForm.additionalDetails[field.key] = [];
          } else {
            this.itemForm.additionalDetails[field.key] = null;
          }
        }
      }
    }
    this.isEditingItem = true;
    this.editingItemId = item.id;
    this.showItemModal = true;
  }

  closeItemModal(): void {
    this.showItemModal = false;
    this.isFullscreen = false;
    this.isFocusMode = false;
    this.showShortcutsPanel = false;
    document.body.style.overflow = '';
    this.floatingToolbar.visible = false;
    this.sideMenu.visible = false;
    this.sideMenu.expanded = false;
    this.linkTooltip.visible = false;
    if (this.linkTooltipTimer) { clearTimeout(this.linkTooltipTimer); }
    this.quillInstance = null;
    this.wordCount = 0;
    this.charCount = 0;
    this.readingTime = 0;
    this.autoSaveStatus = 'saved';
  }

  saveItem(): void {
    if (!this.itemForm.title) return;

    const obs = this.isEditingItem
      ? this.adminApi.updateMoreSectionItem(this.editingItemId!, this.itemForm)
      : this.adminApi.createMoreSectionItem(this.selectedSection.id, this.itemForm);

    obs.subscribe({
      next: () => {
        this.successMessage = this.isEditingItem ? 'Item updated!' : 'Item created!';
        this.hideMessageAfterDelay();
        this.closeItemModal();
        this.loadItems();
      },
      error: () => {
        this.errorMessage = 'Failed to save item';
        this.hideMessageAfterDelay();
      }
    });
  }

  toggleItemActive(item: any): void {
    this.adminApi.toggleMoreSectionItemActive(item.id).subscribe({
      next: () => this.loadItems(),
      error: () => { this.errorMessage = 'Failed to toggle status'; this.hideMessageAfterDelay(); }
    });
  }

  // Delete
  confirmDelete(type: 'section' | 'item', id: number, name: string): void {
    this.deleteTarget = { type, id, name };
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  // Field Definition Management
  addFieldDefinition(): void {
    if (!this.sectionForm.additionalFieldDefinitions) {
      this.sectionForm.additionalFieldDefinitions = [];
    }
    this.sectionForm.additionalFieldDefinitions.push({
      key: '',
      label: '',
      type: 'text',
      required: false,
      options: []
    });
  }

  removeFieldDefinition(index: number): void {
    this.sectionForm.additionalFieldDefinitions.splice(index, 1);
  }

  onFieldLabelChange(field: any): void {
    field.key = field.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
  }

  onFieldTypeChange(field: any): void {
    if (field.type !== 'select' && field.type !== 'multi_select') {
      field.options = [];
    }
  }

  getOptionsString(field: any): string {
    return field.options ? field.options.join(', ') : '';
  }

  setOptionsFromString(field: any, value: string): void {
    field.options = value.split(',').map((o: string) => o.trim()).filter((o: string) => o);
  }

  hasSelectType(field: any): boolean {
    return field.type === 'select' || field.type === 'multi_select';
  }

  // Multi-select helpers for item form
  isOptionSelected(fieldKey: string, option: string): boolean {
    const val = this.itemForm.additionalDetails?.[fieldKey];
    return Array.isArray(val) && val.includes(option);
  }

  toggleMultiSelectOption(fieldKey: string, option: string): void {
    if (!this.itemForm.additionalDetails) this.itemForm.additionalDetails = {};
    if (!Array.isArray(this.itemForm.additionalDetails[fieldKey])) {
      this.itemForm.additionalDetails[fieldKey] = [];
    }
    const arr = this.itemForm.additionalDetails[fieldKey];
    const idx = arr.indexOf(option);
    if (idx > -1) {
      arr.splice(idx, 1);
    } else {
      arr.push(option);
    }
  }

  // Get field definitions from the selected section for item form
  getFieldDefinitions(): any[] {
    return this.selectedSection?.additionalFieldDefinitions || [];
  }

  // Check if an item has any additional details to display
  hasAdditionalDetails(item: any): boolean {
    if (!item.additionalDetails) return false;
    return Object.keys(item.additionalDetails).some(key => {
      const val = item.additionalDetails[key];
      if (val === null || val === undefined || val === '') return false;
      if (typeof val === 'object' && !Array.isArray(val)) {
        return Object.values(val).some(v => v !== null && v !== undefined && v !== '');
      }
      if (Array.isArray(val)) return val.length > 0;
      return true;
    });
  }

  // Format additional detail value for display on card
  formatDetailValue(value: any, fieldKey: string): string {
    if (value === null || value === undefined || value === '') return '-';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
      if (value.from !== undefined && value.to !== undefined) {
        return `${value.from || '?'} - ${value.to || '?'}`;
      }
      if (value.min !== undefined && value.max !== undefined) {
        return `${value.min ?? '?'} - ${value.max ?? '?'}`;
      }
    }
    return String(value);
  }

  // Get label for a field key from section definitions
  getFieldLabel(fieldKey: string): string {
    const defs = this.selectedSection?.additionalFieldDefinitions || [];
    const def = defs.find((d: any) => d.key === fieldKey);
    return def?.label || fieldKey;
  }

  executeDelete(): void {
    if (!this.deleteTarget) return;

    const obs = this.deleteTarget.type === 'section'
      ? this.adminApi.deleteMoreSection(this.deleteTarget.id)
      : this.adminApi.deleteMoreSectionItem(this.deleteTarget.id);

    obs.subscribe({
      next: () => {
        this.successMessage = `${this.deleteTarget!.type === 'section' ? 'Section' : 'Item'} deleted!`;
        this.hideMessageAfterDelay();
        this.showDeleteConfirm = false;
        this.deleteTarget = null;
        if (this.selectedSection) {
          this.loadItems();
        } else {
          this.loadSections();
        }
      },
      error: () => {
        this.errorMessage = 'Failed to delete';
        this.hideMessageAfterDelay();
        this.showDeleteConfirm = false;
      }
    });
  }
}
