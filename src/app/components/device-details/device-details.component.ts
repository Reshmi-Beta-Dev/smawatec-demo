import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

  ngOnInit() {
    // Initialize any component logic here
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
