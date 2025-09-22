import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'select';
  required: boolean;
  placeholder: string;
  maxlength?: number;
  options?: Array<{ label: string; value: string | number }>; // for select
}

@Component({
  selector: 'app-data-modal',
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
            <div *ngFor="let field of fieldConfigs" class="field-group">
              <label [for]="field.name">{{ field.label }}<span *ngIf="field.required"> *</span></label>
              
              <ng-container [ngSwitch]="field.type">
                <select *ngSwitchCase="'select'"
                        [id]="field.name"
                        [(ngModel)]="formData[field.name]"
                        (change)="onFieldChange(field.name)"
                        [class.error]="hasFieldError(field.name)">
                  <option [ngValue]="''" disabled selected hidden>{{ field.placeholder }}</option>
                  <option *ngFor="let opt of field.options || []" [ngValue]="opt.value">{{ opt.label }}</option>
                </select>
                
                <input *ngSwitchDefault
                  [type]="field.type"
                  [id]="field.name"
                  [(ngModel)]="formData[field.name]"
                  (input)="onFieldChange(field.name)"
                  [class.error]="hasFieldError(field.name)"
                  [placeholder]="field.placeholder"
                  [maxlength]="field.maxlength || null"
                  [required]="field.required">
              </ng-container>

              <div class="error-message" *ngIf="hasFieldError(field.name)">
                {{ getFieldError(field.name) }}
              </div>
            </div>
          </div>
          
          <div class="form-group" *ngIf="modalType === 'delete'">
            <p>Are you sure you want to delete "{{ deleteItemName }}"?</p>
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
      color: #6c757d;
      cursor: pointer;
      width: 32px;
      height: 32px;
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

    .field-group {
      margin-bottom: 20px;
    }

    .field-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #2c3e50;
    }

    .field-group input, .field-group select {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    .field-group input:focus, .field-group select:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }

    .field-group input.error, .field-group select.error {
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
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
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
        transform: translateY(-50px) scale(0.95);
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
export class DataModalComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Input() modalType: 'add' | 'edit' | 'delete' = 'add';
  @Input() itemType: 'Building Group' | 'Building' | 'Apartment' = 'Building Group';
  @Input() formData: any = {};
  @Input() isLoading: boolean = false;
  @Input() fieldConfigs: FieldConfig[] = [];
  @Input() deleteItemName: string = '';
  @Output() save = new EventEmitter<{ type: string, data: any }>();
  @Output() cancel = new EventEmitter<void>();

  fieldErrors: { [key: string]: string } = {};

  get modalTitle(): string {
    switch (this.modalType) {
      case 'add': return `Add ${this.itemType}`;
      case 'edit': return `Edit ${this.itemType}`;
      case 'delete': return `Delete ${this.itemType}`;
      default: return this.itemType;
    }
  }

  get saveButtonText(): string {
    switch (this.modalType) {
      case 'add': return `Add ${this.itemType}`;
      case 'edit': return `Update ${this.itemType}`;
      case 'delete': return 'Delete';
      default: return 'Save';
    }
  }

  get isValid(): boolean {
    if (this.modalType === 'delete') {
      return true;
    }

    // Check if all required fields are filled
    for (const field of this.fieldConfigs) {
      if (field.required && (!this.formData[field.name] || this.formData[field.name].toString().trim() === '')) {
        return false;
      }
    }

    // Check if there are any field errors
    return Object.keys(this.fieldErrors).length === 0;
  }

  ngOnInit() {
    this.resetForm();
  }

  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  onFieldChange(fieldName: string) {
    this.validateField(fieldName);
  }

  validateField(fieldName: string) {
    const field = this.fieldConfigs.find(f => f.name === fieldName);
    if (!field) return;

    const value = this.formData[fieldName];
    
    if (field.required && (!value || value.toString().trim() === '')) {
      this.fieldErrors[fieldName] = `${field.label} is required`;
      return;
    }

    if (value && field.type === 'email' && !this.isValidEmail(value)) {
      this.fieldErrors[fieldName] = 'Please enter a valid email address';
      return;
    }

    if (value && field.type === 'tel' && !this.isValidPhone(value)) {
      this.fieldErrors[fieldName] = 'Please enter a valid phone number';
      return;
    }

    if (value && field.type === 'number' && isNaN(Number(value))) {
      this.fieldErrors[fieldName] = 'Please enter a valid number';
      return;
    }

    // Clear error if validation passes
    delete this.fieldErrors[fieldName];
  }

  hasFieldError(fieldName: string): boolean {
    return !!this.fieldErrors[fieldName];
  }

  getFieldError(fieldName: string): string {
    return this.fieldErrors[fieldName] || '';
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  onSave() {
    if (this.isValid) {
      this.save.emit({
        type: this.modalType,
        data: this.formData
      });
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  resetForm() {
    this.formData = {};
    this.fieldErrors = {};
  }
}
