import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-name-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="onOverlayClick($event)">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Change Device Name</h3>
          <button class="close-btn" (click)="onClose()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label>Current Name</label>
            <div class="readonly">{{ currentName || 'Compteur Eau Principal' }}</div>
          </div>
          <div class="form-row">
            <label>New Name</label>
            <input type="text" [(ngModel)]="newName" placeholder="Enter new device name" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="onClose()">Cancel</button>
          <button class="btn btn-primary" (click)="onSave()" [disabled]="!newName?.trim()">Save</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:1000; }
    .modal-container { width: 420px; max-width: 92vw; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,.25); }
    .modal-header { display:flex; align-items:center; justify-content: space-between; padding: 14px 16px; background:#f8f9fa; border-bottom:1px solid #e5e7eb; }
    .modal-header h3 { margin:0; font-size:16px; font-weight:600; color:#2c3e50; }
    .close-btn { border:0; background:transparent; font-size:22px; cursor:pointer; color:#6b7280; }
    .modal-body { padding: 14px 16px; display:flex; flex-direction:column; gap:12px; }
    .form-row { display:grid; grid-template-columns: 120px 1fr; align-items:center; gap:10px; }
    .form-row label { font-weight:600; color:#4b5563; font-size:13px; }
    .form-row input { padding:8px 10px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; }
    .readonly { padding:8px 10px; background:#f3f4f6; border:1px solid #e5e7eb; border-radius:6px; color:#111827; font-size:13px; }
    .modal-footer { display:flex; justify-content:flex-end; gap:10px; padding: 12px 16px; background:#f8f9fa; border-top:1px solid #e5e7eb; }
    .btn { padding:8px 14px; font-weight:600; border-radius:6px; border:0; cursor:pointer; font-size:12px; }
    .btn-primary { background:#6c5ce7; color:#fff; }
    .btn-secondary { background:#6b7280; color:#fff; }
  `]
})
export class ChangeNameModalComponent {
  @Input() isVisible: boolean = false;
  @Input() currentName: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<string>();

  newName: string = '';

  ngOnChanges() {
    // initialize field with current name when modal opens
    if (this.isVisible) {
      this.newName = this.currentName || '';
    }
  }

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    const value = (this.newName || '').trim();
    if (value) this.save.emit(value);
  }
}


