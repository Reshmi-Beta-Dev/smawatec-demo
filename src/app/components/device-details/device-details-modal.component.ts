import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DeviceDetails {
  name: string;
  serial: string;
  type: string;
  status: string;
  location: string;
  apartment: string;
  tenant: string;
  lastSeen: string;
  batteryLevel: number;
  signalStrength: number;
  firmwareVersion: string;
  installationDate: string;
  lastMaintenance: string;
  consumption: number;
  alerts: number;
}

@Component({
  selector: 'app-device-details-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="onOverlayClick($event)">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Device Details</h3>
          <button class="close-btn" (click)="onClose()">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="device-info-grid">
            <!-- Basic Information -->
            <div class="info-section">
              <h4>Basic Information</h4>
              <div class="info-row">
                <span class="label">Device Name:</span>
                <span class="value">{{ deviceDetails?.name || 'Compteur Eau Principal' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Serial Number:</span>
                <span class="value">{{ deviceDetails?.serial || 'SM-001-001' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Device Type:</span>
                <span class="value">{{ deviceDetails?.type || 'Water Meter' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Status:</span>
                <span class="value status" [class.online]="deviceDetails?.status === 'Online'" [class.offline]="deviceDetails?.status === 'Offline'">
                  {{ deviceDetails?.status || 'Online' }}
                </span>
              </div>
            </div>

            <!-- Location Information -->
            <div class="info-section">
              <h4>Location Information</h4>
              <div class="info-row">
                <span class="label">Address:</span>
                <span class="value">{{ deviceDetails?.location || '15 Place Vendôme, 75001 Paris' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Apartment:</span>
                <span class="value">{{ deviceDetails?.apartment || 'Apt 101' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Tenant:</span>
                <span class="value">{{ deviceDetails?.tenant || 'Marie Dubois' }}</span>
              </div>
            </div>

            <!-- Technical Information -->
            <div class="info-section">
              <h4>Technical Information</h4>
              <div class="info-row">
                <span class="label">Firmware Version:</span>
                <span class="value">{{ deviceDetails?.firmwareVersion || 'v2.1.4' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Installation Date:</span>
                <span class="value">{{ deviceDetails?.installationDate || '2023-03-15' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Last Maintenance:</span>
                <span class="value">{{ deviceDetails?.lastMaintenance || '2024-01-10' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Last Seen:</span>
                <span class="value">{{ deviceDetails?.lastSeen || '2 minutes ago' }}</span>
              </div>
            </div>

            <!-- Performance Metrics -->
            <div class="info-section">
              <h4>Performance Metrics</h4>
              <div class="info-row">
                <span class="label">Battery Level:</span>
                <span class="value">
                  <div class="battery-indicator">
                    <div class="battery-bar" [style.width.%]="deviceDetails?.batteryLevel || 85"></div>
                    <span class="battery-text">{{ deviceDetails?.batteryLevel || 85 }}%</span>
                  </div>
                </span>
              </div>
              <div class="info-row">
                <span class="label">Signal Strength:</span>
                <span class="value">
                  <div class="signal-indicator">
                    <div class="signal-bar" [style.width.%]="deviceDetails?.signalStrength || 78"></div>
                    <span class="signal-text">{{ deviceDetails?.signalStrength || 78 }}%</span>
                  </div>
                </span>
              </div>
              <div class="info-row">
                <span class="label">Monthly Consumption:</span>
                <span class="value">{{ deviceDetails?.consumption || 1250 }} m³</span>
              </div>
              <div class="info-row">
                <span class="label">Active Alerts:</span>
                <span class="value alerts">{{ deviceDetails?.alerts || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="onClose()">Close</button>
          <button class="btn btn-primary" (click)="onEdit()">Edit Device</button>
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
      max-width: 800px;
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

    .device-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .info-section {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #e9ecef;
    }

    .info-section h4 {
      margin: 0 0 16px 0;
      color: #2c3e50;
      font-size: 16px;
      font-weight: 600;
      border-bottom: 2px solid #7b61ff;
      padding-bottom: 8px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 600;
      color: #555;
      font-size: 14px;
      min-width: 140px;
    }

    .value {
      color: #333;
      font-size: 14px;
      text-align: right;
      font-weight: 500;
    }

    .status.online {
      color: #28a745;
      font-weight: 600;
    }

    .status.offline {
      color: #dc3545;
      font-weight: 600;
    }

    .battery-indicator, .signal-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 100px;
    }

    .battery-bar, .signal-bar {
      height: 8px;
      background: #28a745;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .signal-bar {
      background: #007bff;
    }

    .battery-text, .signal-text {
      font-size: 12px;
      font-weight: 600;
      color: #555;
    }

    .alerts {
      color: #dc3545;
      font-weight: 600;
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

    .btn-primary {
      background: linear-gradient(135deg, #7b61ff, #6b51ef);
      color: white;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #6b51ef, #5a4fcf);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(123, 97, 255, 0.4);
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
      .device-info-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .modal-container {
        width: 95%;
        margin: 10px;
      }
    }
  `]
})
export class DeviceDetailsModalComponent {
  @Input() isVisible: boolean = false;
  @Input() deviceDetails: DeviceDetails | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onClose() {
    this.close.emit();
  }

  onEdit() {
    this.edit.emit();
  }
}
