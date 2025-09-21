import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface LocationOption {
  id: string;
  name: string;
  address: string;
  apartment: string;
  tenant: string;
  isAvailable: boolean;
}

@Component({
  selector: 'app-assign-location-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="onOverlayClick($event)">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Assign Device to New Location</h3>
          <button class="close-btn" (click)="onClose()">&times;</button>
        </div>
        
        <div class="modal-body">
          <!-- Device Information -->
          <div class="device-info-section">
            <h4>Device Information</h4>
            <div class="device-info">
              <div class="info-item">
                <span class="label">Device Name:</span>
                <span class="value">{{ deviceName || 'Compteur Eau Principal' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Serial Number:</span>
                <span class="value">{{ deviceSerial || 'SM-001-001' }}</span>
              </div>
            </div>
          </div>

          <!-- Location Selection -->
          <div class="location-selection-section">
            <h4>Select New Location</h4>
            
            <!-- Search Filter -->
            <div class="search-filter">
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (input)="filterLocations()"
                placeholder="Search locations by address, apartment, or tenant..."
                class="search-input">
            </div>

            <!-- Location List -->
            <div class="location-list">
              <div 
                *ngFor="let location of filteredLocations; let i = index" 
                class="location-item"
                [class.selected]="selectedLocationId === location.id"
                [class.unavailable]="!location.isAvailable"
                (click)="selectLocation(location)">
                
                <div class="location-info">
                  <div class="location-name">{{ location.name }}</div>
                  <div class="location-address">{{ location.address }}</div>
                  <div class="location-details">
                    <span class="apartment">{{ location.apartment }}</span>
                    <span class="tenant">{{ location.tenant }}</span>
                  </div>
                </div>
                
                <div class="location-status">
                  <span *ngIf="location.isAvailable" class="status available">Available</span>
                  <span *ngIf="!location.isAvailable" class="status occupied">Occupied</span>
                </div>
              </div>
            </div>

            <!-- No Results -->
            <div *ngIf="filteredLocations.length === 0" class="no-results">
              <div class="no-results-icon">📍</div>
              <h4>No locations found</h4>
              <p>Try adjusting your search criteria or add a new location.</p>
            </div>
          </div>

          <!-- Assignment Notes -->
          <div class="notes-section">
            <h4>Assignment Notes (Optional)</h4>
            <textarea 
              [(ngModel)]="assignmentNotes"
              placeholder="Add any notes about this device assignment..."
              class="notes-textarea"
              rows="3">
            </textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="onClose()">Cancel</button>
          <button 
            class="btn btn-primary" 
            (click)="onAssign()"
            [disabled]="!selectedLocationId || isAssigning">
            <span *ngIf="!isAssigning">Assign Device</span>
            <span *ngIf="isAssigning">Assigning...</span>
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
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      animation: slideIn 0.3s ease;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
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
      padding: 16px 20px;
    }

    .device-info-section, .location-selection-section, .notes-section {
      margin-bottom: 16px;
    }

    .device-info-section h4, .location-selection-section h4, .notes-section h4 {
      margin: 0 0 12px 0;
      color: #2c3e50;
      font-size: 15px;
      font-weight: 600;
      border-bottom: 2px solid #7b61ff;
      padding-bottom: 6px;
    }

    .device-info {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 12px;
      border: 1px solid #e9ecef;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
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

    .search-filter {
      margin-bottom: 12px;
    }

    .search-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: #7b61ff;
      box-shadow: 0 0 0 3px rgba(123, 97, 255, 0.1);
    }

    .location-list {
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
    }

    .location-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .location-item:last-child {
      border-bottom: none;
    }

    .location-item:hover:not(.unavailable) {
      background: #f8f9fa;
    }

    .location-item.selected {
      background: #e3f2fd;
      border-left: 4px solid #7b61ff;
    }

    .location-item.unavailable {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .location-info {
      flex: 1;
    }

    .location-name {
      font-size: 14px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 3px;
    }

    .location-address {
      font-size: 13px;
      color: #6c757d;
      margin-bottom: 3px;
    }

    .location-details {
      display: flex;
      gap: 12px;
    }

    .apartment, .tenant {
      font-size: 11px;
      color: #6c757d;
      background: #e9ecef;
      padding: 2px 6px;
      border-radius: 10px;
    }

    .location-status {
      margin-left: 12px;
    }

    .status {
      font-size: 12px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 12px;
    }

    .status.available {
      background: #d4edda;
      color: #155724;
    }

    .status.occupied {
      background: #f8d7da;
      color: #721c24;
    }

    .no-results {
      text-align: center;
      padding: 40px 20px;
      color: #6c757d;
    }

    .no-results-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .no-results h4 {
      margin: 0 0 12px 0;
      color: #495057;
      font-size: 18px;
    }

    .notes-textarea {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 13px;
      font-family: inherit;
      resize: vertical;
      min-height: 60px;
      transition: all 0.2s ease;
    }

    .notes-textarea:focus {
      outline: none;
      border-color: #7b61ff;
      box-shadow: 0 0 0 3px rgba(123, 97, 255, 0.1);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 20px;
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

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #6b51ef, #5a4fcf);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(123, 97, 255, 0.4);
    }

    .btn-primary:disabled {
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
      
      .location-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      
      .location-status {
        margin-left: 0;
        align-self: flex-end;
      }
    }
  `]
})
export class AssignLocationModalComponent {
  @Input() isVisible: boolean = false;
  @Input() deviceName: string = '';
  @Input() deviceSerial: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() assign = new EventEmitter<{locationId: string, notes: string}>();

  searchQuery: string = '';
  selectedLocationId: string = '';
  assignmentNotes: string = '';
  isAssigning: boolean = false;

  // Mock location data
  locations: LocationOption[] = [
    {
      id: '1',
      name: 'Apartment 201',
      address: '15 Place Vendôme, 75001 Paris',
      apartment: 'Apt 201',
      tenant: 'Jean Martin',
      isAvailable: true
    },
    {
      id: '2',
      name: 'Apartment 302',
      address: '15 Place Vendôme, 75001 Paris',
      apartment: 'Apt 302',
      tenant: 'Sophie Dubois',
      isAvailable: false
    },
    {
      id: '3',
      name: 'Apartment 105',
      address: '15 Place Vendôme, 75001 Paris',
      apartment: 'Apt 105',
      tenant: 'Pierre Moreau',
      isAvailable: true
    }
  ];

  filteredLocations: LocationOption[] = this.locations;

  ngOnInit() {
    this.filteredLocations = this.locations;
  }

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onClose() {
    this.close.emit();
    this.resetForm();
  }

  selectLocation(location: LocationOption) {
    if (location.isAvailable) {
      this.selectedLocationId = location.id;
    }
  }

  filterLocations() {
    if (!this.searchQuery.trim()) {
      this.filteredLocations = this.locations;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredLocations = this.locations.filter(location =>
        location.name.toLowerCase().includes(query) ||
        location.address.toLowerCase().includes(query) ||
        location.apartment.toLowerCase().includes(query) ||
        location.tenant.toLowerCase().includes(query)
      );
    }
  }

  onAssign() {
    if (this.selectedLocationId) {
      this.isAssigning = true;
      
      // Simulate API call
      setTimeout(() => {
        this.assign.emit({
          locationId: this.selectedLocationId,
          notes: this.assignmentNotes
        });
        this.isAssigning = false;
        this.resetForm();
      }, 1500);
    }
  }

  private resetForm() {
    this.searchQuery = '';
    this.selectedLocationId = '';
    this.assignmentNotes = '';
    this.filteredLocations = this.locations;
  }
}
