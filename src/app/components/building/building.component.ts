import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-building',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.css']
})
export class BuildingComponent implements OnInit {
  selectedGroupRow: number | null = null;
  selectedBuildingRow: number | null = null;
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
    this.updateBuildingDetails(index);
  }

  onBuildingRowClick(index: number) {
    this.selectedBuildingRow = this.selectedBuildingRow === index ? null : index;
  }

  updateBuildingDetails(selectedIndex: number) {
    // This would typically update the building/apartment details based on selection
    this.showNotification(`Updated details for group ${selectedIndex + 1}`);
  }

  addGroup() {
    this.showNotification('Opening add group form...');
  }

  removeGroup() {
    if (this.selectedGroupRow !== null) {
      this.showNotification('Group removed successfully');
      this.selectedGroupRow = null;
    } else {
      this.showNotification('Please select a group to remove');
    }
  }

  addApartment() {
    this.showNotification('Opening add apartment form...');
  }

  saveDetails() {
    this.showNotification('Building details saved successfully');
  }

  addBuilding() {
    this.showNotification('Opening add building form...');
  }

  removeBuilding() {
    if (this.selectedBuildingRow !== null) {
      this.showNotification('Building removed successfully');
      this.selectedBuildingRow = null;
    } else {
      this.showNotification('Please select a building to remove');
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
