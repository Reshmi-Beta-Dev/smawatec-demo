import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../services/mock-data.service';

@Component({
  selector: 'app-device-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './device-details.component.html',
  styleUrls: ['./device-details.component.css']
})
export class DeviceDetailsComponent implements OnInit {
  selectedRow: number | null = null;
  selectedGroupRow: number | null = null;
  selectedBuildingRow: number | null = null;
  selectedUnassignedRow: number | null = null;
  
  // Mock data properties
  devices: any[] = [];
  searchData: any = {
    keyword: '',
    building: '',
    buildingGroup: '',
    deviceName: '',
    city: '',
    zipCode: '',
    tenant: '',
    tenantId: ''
  };
  loading = false;
  error: string | null = null;

  constructor(private mockDataService: MockDataService) {}

  async ngOnInit() {
    await this.loadDevices();
  }

  onRowClick(index: number) {
    this.selectedRow = this.selectedRow === index ? null : index;
  }

  onGroupRowClick(index: number) {
    this.selectedGroupRow = this.selectedGroupRow === index ? null : index;
  }

  onBuildingRowClick(index: number) {
    this.selectedBuildingRow = this.selectedBuildingRow === index ? null : index;
  }

  onUnassignedRowClick(index: number) {
    this.selectedUnassignedRow = this.selectedUnassignedRow === index ? null : index;
  }

  showDetails(event: Event) {
    event.stopPropagation();
    this.showNotification('Device details functionality');
  }

  assignToNewLocation() {
    this.showNotification('Assign to new location functionality');
  }

  unassignDevice() {
    this.showNotification('Unassign device functionality');
  }

  findNewDevice() {
    this.showNotification('Find new device functionality');
  }

  private async loadDevices() {
    try {
      this.loading = true;
      this.error = null;

      // Mock device data
      this.devices = [
        { id: 1, name: 'Water Meter 001', serial: 'WT-001-001', status: 'Active', location: 'Building A' },
        { id: 2, name: 'Water Meter 002', serial: 'WT-002-001', status: 'Maintenance', location: 'Building B' },
        { id: 3, name: 'Water Meter 003', serial: 'WT-003-001', status: 'Active', location: 'Building C' }
      ];

    } catch (error) {
      console.error('Error loading devices:', error);
      this.error = 'Failed to load device data';
    } finally {
      this.loading = false;
    }
  }

  showNotification(message: string) {
    console.log('Notification:', message);
  }
}