import { Component, OnInit } from '@angular/core';
import { NavConfig } from '../../../models/nav-config.model';
import { NavConfigService } from '../../../services/nav-config.service';

@Component({
  selector: 'app-admin-nav-config',
  templateUrl: './admin-nav-config.component.html',
  styleUrls: ['./admin-nav-config.component.scss']
})
export class AdminNavConfigComponent implements OnInit {
  navLinks: NavConfig[] = [];
  loading = true;
  saving = false;
  editingId: number | null = null;
  editLabel = '';
  successMsg = '';
  errorMsg = '';

  constructor(private navConfigService: NavConfigService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.navConfigService.getAllNavLinks().subscribe({
      next: (links) => {
        this.navLinks = links;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load navigation links.';
        this.loading = false;
      }
    });
  }

  startEdit(link: NavConfig): void {
    this.editingId = link.id!;
    this.editLabel = link.labelOverride || '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editLabel = '';
  }

  saveLabel(link: NavConfig): void {
    this.saving = true;
    const updated = { ...link, labelOverride: this.editLabel.trim() || undefined };
    this.navConfigService.update(link.id!, updated).subscribe({
      next: (saved) => {
        const idx = this.navLinks.findIndex(l => l.id === saved.id);
        if (idx !== -1) this.navLinks[idx] = saved;
        this.editingId = null;
        this.saving = false;
        this.showSuccess('Label updated.');
      },
      error: () => {
        this.errorMsg = 'Failed to update label.';
        this.saving = false;
      }
    });
  }

  toggleVisibility(link: NavConfig): void {
    if (link.isFixed) return;
    this.navConfigService.toggleVisibility(link.id!).subscribe({
      next: (saved) => {
        const idx = this.navLinks.findIndex(l => l.id === saved.id);
        if (idx !== -1) this.navLinks[idx] = saved;
        this.showSuccess(`"${this.getDisplayName(saved)}" ${saved.isVisible ? 'shown' : 'hidden'} in navbar.`);
      },
      error: () => { this.errorMsg = 'Failed to update visibility.'; }
    });
  }

  moveUp(index: number): void {
    if (index <= 0) return;
    this.swapOrder(index, index - 1);
  }

  moveDown(index: number): void {
    if (index >= this.navLinks.length - 1) return;
    this.swapOrder(index, index + 1);
  }

  private swapOrder(i: number, j: number): void {
    const a = this.navLinks[i];
    const b = this.navLinks[j];
    const tmpOrder = a.displayOrder;
    a.displayOrder = b.displayOrder;
    b.displayOrder = tmpOrder;

    this.navConfigService.update(a.id!, a).subscribe({ next: () => {} });
    this.navConfigService.update(b.id!, b).subscribe({
      next: () => {
        this.navLinks = [...this.navLinks].sort((x, y) => x.displayOrder - y.displayOrder);
        this.showSuccess('Order saved.');
      },
      error: () => { this.errorMsg = 'Failed to reorder.'; }
    });
  }

  getDisplayName(link: NavConfig): string {
    return link.labelOverride || link.labelKey;
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    this.errorMsg = '';
    setTimeout(() => this.successMsg = '', 3000);
  }
}
