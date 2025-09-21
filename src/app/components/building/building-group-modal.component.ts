import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-building-group-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="onOverlayClick($event)">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <button class="close-btn" (click)="onCancel()">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group" *ngIf="modalType !== 'delete'">
            <label for="groupName">Building Group Name *</label>
            <input 
              type="text" 
              id="groupName"
              [(ngModel)]="groupName" 
              (input)="onNameChange()"
              [class.error]="hasError"
              placeholder="Enter building group name..."
              maxlength="100"
            >
            <div class="error-message" *ngIf="hasError">
              {{ errorMessage }}
            </div>
          </div>
          
          <div class="form-group" *ngIf="modalType === 'delete'">
            <p>Are you sure you want to delete "{{ groupName }}"?</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            class="btn btn-secondary" 
            (click)="onCancel()"
            [disabled]="isLoading">
            Cancel
          </button>
          <button 
            [class]="'btn ' + (modalType === 'delete' ? 'btn-danger' : 'btn-primary')"
            (click)="onSave()"
            [disabled]="!isValid || isLoading"
            [class.loading]="isLoading">
            <span *ngIf="!isLoading">{{ saveButtonText }}</span>
            <span *ngIf="isLoading">Processing...</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }

    .modal-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideIn 0.3s ease;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
      border-radius: 8px 8px 0 0;
    }

    .modal-header h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 18px;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      color: #666;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: #e9ecef;
      color: #333;
    }

    .modal-body {
      padding: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #2c3e50;
    }

    .form-group p {
      color: #333;
      margin: 0;
    }

    .form-group input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
    }

    .form-group input:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }

    .form-group input.error {
      border-color: #e74c3c;
      box-shadow: 0 0 0 3px rgba(231, 76, 96, 0.1);
    }

    .error-message {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 6px;
      font-weight: 500;
    }



    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid #e0e0e0;
      background: #f8f9fa;
      border-radius: 0 0 8px 8px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 80px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
      transform: translateY(-1px);
    }

    .btn-primary {
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #2980b9, #1f618d);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
    }

    .btn-danger {
      background: linear-gradient(135deg, #e74c3c, #c0392b);
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: linear-gradient(135deg, #c0392b, #a93226);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(231, 76, 96, 0.4);
    }

    .btn.loading {
      position: relative;
      color: transparent;
    }

    .btn.loading::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 16px;
      height: 16px;
      margin: -8px 0 0 -8px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { 
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class BuildingGroupModalComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Input() modalType: 'add' | 'edit' | 'delete' = 'add';
  @Input() groupName: string = '';
  @Input() isLoading: boolean = false;
  @Output() save = new EventEmitter<{ type: string, name: string }>();
  @Output() cancel = new EventEmitter<void>();

  hasError: boolean = false;
  errorMessage: string = '';

  get modalTitle(): string {
    switch (this.modalType) {
      case 'add': return 'Add Building Group';
      case 'edit': return 'Edit Building Group';
      case 'delete': return 'Delete Building Group';
      default: return 'Building Group';
    }
  }

  get saveButtonText(): string {
    switch (this.modalType) {
      case 'add': return 'Add Group';
      case 'edit': return 'Update Group';
      case 'delete': return 'Delete';
      default: return 'Save';
    }
  }

  get isValid(): boolean {
    if (this.modalType === 'delete') {
      return true; // Delete is always valid if modal is shown
    }
    return this.groupName.trim().length >= 3;
  }

  ngOnInit() {
    if (this.modalType === 'add') {
      this.groupName = '';
    }
  }

  onNameChange() {
    this.validateInput();
  }

  validateInput() {
    this.hasError = false;
    this.errorMessage = '';

    if (this.modalType === 'delete') {
      return;
    }

    const trimmedName = this.groupName.trim();
    
    if (trimmedName.length === 0) {
      this.hasError = true;
      this.errorMessage = 'Building group name is required';
    } else if (trimmedName.length < 3) {
      this.hasError = true;
      this.errorMessage = 'Building group name must be at least 3 characters long';
    } else if (trimmedName.length > 100) {
      this.hasError = true;
      this.errorMessage = 'Building group name must be less than 100 characters';
    } else if (!/^[a-zA-Z0-9\s\-_&.,()]+$/.test(trimmedName)) {
      this.hasError = true;
      this.errorMessage = 'Building group name contains invalid characters';
    }
  }

  onSave() {
    if (!this.isValid || this.isLoading) {
      return;
    }

    this.validateInput();
    if (this.hasError) {
      return;
    }

    this.save.emit({
      type: this.modalType,
      name: this.groupName.trim()
    });
  }

  onCancel() {
    this.cancel.emit();
  }

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
