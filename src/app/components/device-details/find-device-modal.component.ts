import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DeviceSearchResult {
  id: string;
  name: string;
  type: string;
  status: string;
  location?: string;
  signalStrength?: number;
  lastSeen?: string;
  isOnline: boolean;
}

@Component({
  selector: 'app-find-device-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="onOverlayClick($event)">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Find New Device</h3>
          <button class="close-btn" (click)="onCancel()">&times;</button>
        </div>
        
        <div class="modal-body">
          <!-- Search Section -->
          <div class="search-section">
            <div class="search-input-group">
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (input)="onSearchInput()"
                placeholder="Enter Device Serial Number"
                class="search-input">
              <button class="search-btn" (click)="searchDevices()" [disabled]="isSearching">
                <span *ngIf="!isSearching">🔍 Search</span>
                <span *ngIf="isSearching">Searching...</span>
              </button>
            </div>
          </div>

          <!-- Search Results -->
          <div class="results-section" *ngIf="searchResults.length > 0">
            <h4>Available Devices ({{ searchResults.length }})</h4>
            <div class="device-list">
              <div 
                *ngFor="let device of searchResults; let i = index" 
                class="device-item"
                [class.selected]="selectedDeviceIndex === i"
                (click)="selectDevice(i)">
                <div class="device-info">
                  <div class="device-name">{{ device.name }}</div>
                  <div class="device-details">
                    <span class="device-type">{{ device.type }}</span>
                    <span class="device-status" [class.online]="device.isOnline" [class.offline]="!device.isOnline">
                      {{ device.isOnline ? 'Online' : 'Offline' }}
                    </span>
                  </div>
                  <div class="device-location" *ngIf="device.location">
                    📍 {{ device.location }}
                  </div>
                  <div class="device-signal" *ngIf="device.signalStrength">
                    📶 Signal: {{ device.signalStrength }}%
                  </div>
                </div>
                <div class="device-actions">
                  <button class="btn btn-primary btn-sm" (click)="assignDevice(device, $event)">
                    Assign
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- No Results -->
          <div class="no-results" *ngIf="hasSearched && searchResults.length === 0">
            <div class="no-results-icon">🔍</div>
            <h4>No devices found</h4>
            <p>Try adjusting your search criteria or check if the device is powered on and connected.</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            class="btn btn-secondary" 
            (click)="onCancel()"
            [disabled]="isSearching">
            Close
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

    .search-section {
      margin-bottom: 24px;
    }

    .search-input-group {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .search-input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }

    .search-btn {
      padding: 12px 20px;
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .search-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #2980b9, #1f618d);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
    }

    .search-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .results-section h4 {
      margin: 0 0 16px 0;
      color: #2c3e50;
      font-size: 16px;
      font-weight: 600;
    }

    .device-list {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
    }

    .device-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .device-item:last-child {
      border-bottom: none;
    }

    .device-item:hover {
      background: #f8f9fa;
    }

    .device-item.selected {
      background: #e3f2fd;
      border-left: 4px solid #3498db;
    }

    .device-info {
      flex: 1;
    }

    .device-name {
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 4px;
    }

    .device-details {
      display: flex;
      gap: 12px;
      margin-bottom: 4px;
    }

    .device-type {
      background: #e9ecef;
      color: #495057;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .device-status {
      font-size: 12px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 12px;
    }

    .device-status.online {
      background: #d4edda;
      color: #155724;
    }

    .device-status.offline {
      background: #f8d7da;
      color: #721c24;
    }

    .device-location, .device-signal {
      font-size: 12px;
      color: #6c757d;
      margin-top: 2px;
    }

    .device-actions {
      margin-left: 12px;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #28a745, #20c997);
      color: white;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #20c997, #17a2b8);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 11px;
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

    .serial-input-section {
      padding: 20px 0;
    }

    .serial-input-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .serial-input-group label {
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 8px;
    }

    .serial-input {
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .serial-input:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
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

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
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
  `]
})
export class FindDeviceModalComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Input() isLoading: boolean = false;
  @Output() assign = new EventEmitter<DeviceSearchResult>();
  @Output() cancel = new EventEmitter<void>();

  searchQuery: string = '';
  serialNumber: string = '';
  searchResults: DeviceSearchResult[] = [];
  selectedDeviceIndex: number = -1;
  isSearching: boolean = false;
  hasSearched: boolean = false;

  ngOnInit() {
    this.resetModal();
  }

  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  onSearchInput() {
    // Auto-search as user types (debounced)
    if (this.searchQuery.length >= 2) {
      this.searchDevices();
    } else {
      this.searchResults = [];
      this.hasSearched = false;
    }
  }

  searchBySerial() {
    if (!this.serialNumber.trim()) {
      return;
    }

    this.isSearching = true;
    this.hasSearched = true;

    // Simulate API call delay
    setTimeout(() => {
      this.searchResults = this.generateMockSearchResultsBySerial();
      this.isSearching = false;
    }, 1000);
  }

  searchDevices() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.hasSearched = false;
      return;
    }

    this.isSearching = true;
    this.hasSearched = true;

    // Simulate API call delay
    setTimeout(() => {
      this.searchResults = this.generateMockSearchResults();
      this.isSearching = false;
    }, 1000);
  }

  selectDevice(index: number) {
    this.selectedDeviceIndex = index;
  }

  assignDevice(device: DeviceSearchResult, event: MouseEvent) {
    event.stopPropagation();
    this.assign.emit(device);
  }

  onCancel() {
    this.cancel.emit();
  }

  private generateMockSearchResults(): DeviceSearchResult[] {
    const mockDevices: DeviceSearchResult[] = [
      {
        id: 'dev-001',
        name: 'Smart Thermostat - Living Room',
        type: 'Thermostat',
        status: 'Ready',
        location: 'Nearby Building A',
        signalStrength: 85,
        lastSeen: '2 minutes ago',
        isOnline: true
      },
      {
        id: 'dev-002',
        name: 'Motion Sensor - Hallway',
        type: 'Motion Sensor',
        status: 'Ready',
        location: 'Building B - Floor 2',
        signalStrength: 72,
        lastSeen: '5 minutes ago',
        isOnline: true
      },
      {
        id: 'dev-003',
        name: 'Smart Lock - Main Entrance',
        type: 'Smart Lock',
        status: 'Ready',
        location: 'Building C - Ground Floor',
        signalStrength: 90,
        lastSeen: '1 minute ago',
        isOnline: true
      },
      {
        id: 'dev-004',
        name: 'Water Leak Detector - Basement',
        type: 'Water Sensor',
        status: 'Ready',
        location: 'Building A - Basement',
        signalStrength: 45,
        lastSeen: '10 minutes ago',
        isOnline: false
      },
      {
        id: 'dev-005',
        name: 'Air Quality Monitor - Office',
        type: 'Air Quality Sensor',
        status: 'Ready',
        location: 'Building B - Floor 3',
        signalStrength: 78,
        lastSeen: '3 minutes ago',
        isOnline: true
      }
    ];

    // Filter results based on search query
    const query = this.searchQuery.toLowerCase();
    return mockDevices.filter(device => 
      device.name.toLowerCase().includes(query) ||
      device.type.toLowerCase().includes(query) ||
      device.id.toLowerCase().includes(query)
    );
  }

  private generateMockSearchResultsBySerial(): DeviceSearchResult[] {
    // Simulate finding a device by serial number
    const serial = this.serialNumber.trim().toUpperCase();
    
    // Mock device found by serial number
    const foundDevice: DeviceSearchResult = {
      id: `dev-${serial}`,
      name: `Device ${serial}`,
      type: 'Smart Device',
      status: 'Ready',
      location: 'Network Detected',
      signalStrength: 95,
      lastSeen: 'Just now',
      isOnline: true
    };

    return [foundDevice];
  }

  private resetModal() {
    this.searchQuery = '';
    this.serialNumber = '';
    this.searchResults = [];
    this.selectedDeviceIndex = -1;
    this.isSearching = false;
    this.hasSearched = false;
  }
}
