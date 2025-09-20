import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService, Device, BuildingGroup, Building } from '../../services/supabase.service';

@Component({
  selector: 'app-device-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './device-details.component.html',
  styleUrls: ['./device-details.component.css']
})
export class DeviceDetailsComponent implements OnInit {
  selectedGroupRow: number | null = null;
  selectedBuildingRow: number | null = null;
  selectedUnassignedRow: number | null = null;
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

  // Supabase data properties
  devices: Device[] = [];
  buildingGroups: BuildingGroup[] = [];
  buildings: Building[] = [];
  unassignedDevices: Device[] = [];
  loading = false;
  error: string | null = null;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadData();
  }

  onGroupRowClick(index: number) {
    this.selectedGroupRow = this.selectedGroupRow === index ? null : index;
    this.updateDeviceAssignmentContext('group', index);
  }

  onBuildingRowClick(index: number) {
    this.selectedBuildingRow = this.selectedBuildingRow === index ? null : index;
    this.updateDeviceAssignmentContext('building', index);
  }

  onUnassignedRowClick(index: number) {
    this.selectedUnassignedRow = this.selectedUnassignedRow === index ? null : index;
    this.updateDeviceAssignmentContext('unassigned', index);
  }

  updateDeviceAssignmentContext(type: string, index: number) {
    this.showNotification(`Selected ${type} ${index + 1} for device assignment`);
  }

  assignToNewLocation() {
    this.showNotification('Opening device assignment form...');
  }

  unassignDevice() {
    this.showNotification('Device unassigned successfully');
  }

  findNewDevice() {
    this.showNotification('Searching for new devices...');
  }

  private async loadData() {
    this.loading = true;
    this.error = null;

    try {
      // Load all data in parallel
      const [devicesData, buildingGroupsData, buildingsData] = await Promise.all([
        this.supabaseService.getDevices(),
        this.supabaseService.getBuildingGroups(),
        this.supabaseService.getBuildings()
      ]);

      this.devices = devicesData;
      this.buildingGroups = buildingGroupsData;
      this.buildings = buildingsData;
      
      // Filter unassigned devices (devices without apartment_id)
      this.unassignedDevices = this.devices.filter(device => !device.apartment_id);

      console.log('Device details data loaded successfully:', {
        devices: this.devices.length,
        groups: this.buildingGroups.length,
        buildings: this.buildings.length,
        unassigned: this.unassignedDevices.length
      });
    } catch (error) {
      console.error('Error loading device details data:', error);
      this.error = 'Failed to load data from server';
    } finally {
      this.loading = false;
    }
  }

  private showNotification(message: string) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #7b61ff;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}
