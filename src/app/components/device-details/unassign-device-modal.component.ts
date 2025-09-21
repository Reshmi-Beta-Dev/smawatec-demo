import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-unassign-device-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="onOverlayClick($event)">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Unassign Device</h3>
          <button class="close-btn" (click)="onClose()">&times;</button>
        </div>
        
        <div class="modal-body">
          <!-- Simple Warning Message -->
          <div class="warning-section">
            <div class="warning-icon">⚠️</div>
            <h4>Unassign Device</h4>
            <p>Are you sure you want to unassign this device from its current location?</p>
          </div>

          <!-- Simple Device Info -->
          <div class="device-info-section">
            <div class="device-info">
              <div class="info-item">
                <span class="label">Device:</span>
                <span class="value">{{ deviceName || 'Compteur Eau Principal' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Location:</span>
                <span class="value">{{ currentLocation || '15 Place Vendôme, 75001 Paris' }}</span>
              </div>
            </div>
          </div>

          <!-- Simple Confirmation -->
          <div class="confirmation-section">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                [(ngModel)]="confirmUnassign"
                class="checkbox-input">
              <span class="checkbox-text">
                Yes, I want to unassign this device
              </span>
            </label>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="onClose()">Cancel</button>
          <button 
            class="btn btn-danger" 
            (click)="onUnassign()"
            [disabled]="!confirmUnassign || isUnassigning">
            <span *ngIf="!isUnassigning">Unassign Device</span>
            <span *ngIf="isUnassigning">Unassigning...</span>
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
      max-width: 450px;
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

    .warning-section {
      text-align: center;
      margin-bottom: 24px;
      padding: 20px;
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
    }

    .warning-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .warning-section h4 {
      margin: 0 0 12px 0;
      color: #856404;
      font-size: 18px;
      font-weight: 600;
    }

    .warning-section p {
      margin: 0;
      color: #856404;
      font-size: 14px;
      line-height: 1.5;
    }

    .device-info-section, .confirmation-section {
      margin-bottom: 24px;
    }

    .device-info {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 16px;
      border: 1px solid #e9ecef;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .info-item:not(:last-child) {
      border-bottom: 1px solid #e9ecef;
    }

    .label {
      font-weight: 600;
      color: #555;
      font-size: 14px;
    }

    .value {
      color: #333;
      font-size: 14px;
      font-weight: 500;
    }


    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      cursor: pointer;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #e9ecef;
      transition: all 0.2s ease;
    }

    .checkbox-label:hover {
      background: #e9ecef;
    }

    .checkbox-input {
      margin: 0;
      width: 18px;
      height: 18px;
      accent-color: #dc3545;
    }

    .checkbox-text {
      font-size: 14px;
      color: #333;
      line-height: 1.5;
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
    }

    .btn-danger {
      background: linear-gradient(135deg, #dc3545, #c82333);
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: linear-gradient(135deg, #c82333, #bd2130);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
    }

    .btn-danger:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
      transform: translateY(-1px);
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

    @media (max-width: 768px) {
      .modal-container {
        width: 95%;
        margin: 10px;
      }
      
      .info-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
      
      .value {
        text-align: left;
      }
    }
  `]
})
export class UnassignDeviceModalComponent {
  @Input() isVisible: boolean = false;
  @Input() deviceName: string = '';
  @Input() deviceSerial: string = '';
  @Input() currentLocation: string = '';
  @Input() currentApartment: string = '';
  @Input() currentTenant: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() unassign = new EventEmitter<{reason: string, customReason?: string}>();

  confirmUnassign: boolean = false;
  isUnassigning: boolean = false;

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onClose() {
    this.close.emit();
    this.resetForm();
  }

  onUnassign() {
    if (this.confirmUnassign) {
      this.isUnassigning = true;
      
      // Simulate API call
      setTimeout(() => {
        this.unassign.emit({
          reason: 'unassigned',
          customReason: undefined
        });
        this.isUnassigning = false;
        this.resetForm();
      }, 1500);
    }
  }

  private resetForm() {
    this.confirmUnassign = false;
  }
}
