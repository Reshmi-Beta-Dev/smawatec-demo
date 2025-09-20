import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService, BuildingGroup, Building, Apartment, Tenant } from '../../services/supabase.service';
import { ModalComponent } from '../../shared/modal/modal.component';
import { BuildingGroupFormComponent } from '../building-group-form/building-group-form.component';
import { BuildingFormComponent } from '../building-form/building-form.component';

@Component({
  selector: 'app-building',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ModalComponent, BuildingGroupFormComponent, BuildingFormComponent],
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

  // Supabase data properties
  buildingGroups: BuildingGroup[] = [];
  buildings: Building[] = [];
  apartments: Apartment[] = [];
  tenants: Tenant[] = [];
  loading = false;
  error: string | null = null;

  // Modal properties
  showAddGroupModal = false;
  showAddBuildingModal = false;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadData();
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
    this.showAddGroupModal = true;
  }

  onModalClose() {
    this.showAddGroupModal = false;
  }

  async onGroupSaved(newGroup: BuildingGroup) {
    try {
      // Add the new group to the beginning of the list
      this.buildingGroups.unshift(newGroup);
      
      // Show success notification
      this.showNotification('Building group created successfully!');
      
      // Close modal
      this.showAddGroupModal = false;
      
      console.log('Building group added to UI:', newGroup);
    } catch (error) {
      console.error('Error updating UI after group creation:', error);
      this.showNotification('Group created but failed to update UI. Please refresh the page.');
    }
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
    this.showAddBuildingModal = true;
  }

  onBuildingModalClose() {
    this.showAddBuildingModal = false;
  }

  async onBuildingSaved(newBuilding: Building) {
    try {
      // Add the new building to the beginning of the list
      this.buildings.unshift(newBuilding);
      
      // Show success notification
      this.showNotification('Building created successfully!');
      
      // Close modal
      this.showAddBuildingModal = false;
      
      console.log('Building added to UI:', newBuilding);
    } catch (error) {
      console.error('Error updating UI after building creation:', error);
      this.showNotification('Building created but failed to update UI. Please refresh the page.');
    }
  }

  removeBuilding() {
    if (this.selectedBuildingRow !== null) {
      this.showNotification('Building removed successfully');
      this.selectedBuildingRow = null;
    } else {
      this.showNotification('Please select a building to remove');
    }
  }

  private async loadData() {
    this.loading = true;
    this.error = null;

    try {
      // Load all data in parallel
      const [buildingGroupsData, buildingsData, apartmentsData, tenantsData] = await Promise.all([
        this.supabaseService.getBuildingGroups(),
        this.supabaseService.getBuildings(),
        this.supabaseService.getApartments(),
        this.supabaseService.getTenants()
      ]);

      this.buildingGroups = buildingGroupsData;
      this.buildings = buildingsData;
      this.apartments = apartmentsData;
      this.tenants = tenantsData;

      console.log('Building data loaded successfully:', {
        groups: this.buildingGroups.length,
        buildings: this.buildings.length,
        apartments: this.apartments.length,
        tenants: this.tenants.length
      });
    } catch (error) {
      console.error('Error loading building data:', error);
      this.error = 'Failed to load data from server';
    } finally {
      this.loading = false;
    }
  }

  getSelectedApartment(): Apartment | null {
    if (this.selectedGroupRow !== null && this.apartments.length > 0) {
      return this.apartments[this.selectedGroupRow] || null;
    }
    return null;
  }

  getSelectedTenant(): Tenant | null {
    const apartment = this.getSelectedApartment();
    if (apartment && apartment.tenants) {
      return apartment.tenants;
    }
    return null;
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
