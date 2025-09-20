import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService, BuildingGroup, Building, Apartment, Tenant } from '../../services/supabase.service';
import { ModalComponent } from '../../shared/modal/modal.component';
import { BuildingGroupFormComponent } from '../building-group-form/building-group-form.component';
import { BuildingFormComponent } from '../building-form/building-form.component';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-building',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ModalComponent, BuildingGroupFormComponent, BuildingFormComponent, ConfirmationModalComponent],
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
  showUpdateBuildingModal = false;
  showDeleteConfirmation = false;
  deleteConfirmationData: { type: 'building' | 'group', item: any, index: number } | null = null;
  isDeleting = false;
  selectedBuildingForEdit: Building | null = null;

  // Pagination properties
  itemsPerPage = 10;
  currentGroupPage = 1;
  currentBuildingPage = 1;
  totalGroupPages = 1;
  totalBuildingPages = 1;

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

  onBuildingRowDoubleClick(building: Building, index: number) {
    this.selectedBuildingForEdit = { ...building };
    this.showUpdateBuildingModal = true;
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
    } catch (error) {
      console.error('Error updating UI after group creation:', error);
      this.showNotification('Group created but failed to update UI. Please refresh the page.');
    }
  }

  removeGroup() {
    if (this.selectedGroupRow !== null) {
      const group = this.buildingGroups[this.selectedGroupRow];
      if (group) {
        this.deleteConfirmationData = {
          type: 'group',
          item: group,
          index: this.selectedGroupRow
        };
        this.showDeleteConfirmation = true;
      }
    } else {
      this.showNotification('Please select a group to delete');
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

  onUpdateBuildingModalClose() {
    this.showUpdateBuildingModal = false;
    this.selectedBuildingForEdit = null;
  }

  async onBuildingSaved(newBuilding: Building) {
    try {
      // Add the new building to the beginning of the list
      this.buildings.unshift(newBuilding);
      
      // Show success notification
      this.showNotification('Building created successfully!');
      
      // Close modal
      this.showAddBuildingModal = false;
    } catch (error) {
      console.error('Error updating UI after building creation:', error);
      this.showNotification('Building created but failed to update UI. Please refresh the page.');
    }
  }

  async onBuildingUpdated(updatedBuilding: Building) {
    try {
      // Find and update the building in the list
      const index = this.buildings.findIndex(b => b.id === updatedBuilding.id);
      if (index !== -1) {
        this.buildings[index] = updatedBuilding;
        this.showNotification('Building updated successfully!');
        this.showUpdateBuildingModal = false;
        this.selectedBuildingForEdit = null;
      }
    } catch (error) {
      console.error('Error updating UI after building update:', error);
      this.showNotification('Building updated but failed to update UI. Please refresh the page.');
    }
  }

  removeBuilding() {
    if (this.selectedBuildingRow !== null) {
      const building = this.buildings[this.selectedBuildingRow];
      if (building) {
        this.deleteConfirmationData = {
          type: 'building',
          item: building,
          index: this.selectedBuildingRow
        };
        this.showDeleteConfirmation = true;
      }
    } else {
      this.showNotification('Please select a building to delete');
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

      // Update pagination after loading data
      this.updateGroupPagination();
      this.updateBuildingPagination();

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

  // Confirmation modal handlers
  async onDeleteConfirm() {
    if (!this.deleteConfirmationData) return;

    this.isDeleting = true;

    try {
      if (this.deleteConfirmationData.type === 'building') {
        await this.supabaseService.deleteBuilding(this.deleteConfirmationData.item.id);
        this.buildings.splice(this.deleteConfirmationData.index, 1);
        this.selectedBuildingRow = null;
        this.showNotification('Building deleted successfully');
      } else if (this.deleteConfirmationData.type === 'group') {
        await this.supabaseService.deleteBuildingGroup(this.deleteConfirmationData.item.id);
        this.buildingGroups.splice(this.deleteConfirmationData.index, 1);
        this.selectedGroupRow = null;
        this.showNotification('Building group deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      this.showNotification('Failed to delete item. Please try again.');
    } finally {
      this.isDeleting = false;
      this.showDeleteConfirmation = false;
      this.deleteConfirmationData = null;
    }
  }

  onDeleteCancel() {
    this.showDeleteConfirmation = false;
    this.deleteConfirmationData = null;
    this.isDeleting = false;
  }

  // Pagination methods
  get paginatedBuildingGroups() {
    const startIndex = (this.currentGroupPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.buildingGroups.slice(startIndex, endIndex);
  }

  get paginatedBuildings() {
    const startIndex = (this.currentBuildingPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.buildings.slice(startIndex, endIndex);
  }

  updateGroupPagination() {
    this.totalGroupPages = Math.ceil(this.buildingGroups.length / this.itemsPerPage);
    if (this.currentGroupPage > this.totalGroupPages) {
      this.currentGroupPage = Math.max(1, this.totalGroupPages);
    }
  }

  updateBuildingPagination() {
    this.totalBuildingPages = Math.ceil(this.buildings.length / this.itemsPerPage);
    if (this.currentBuildingPage > this.totalBuildingPages) {
      this.currentBuildingPage = Math.max(1, this.totalBuildingPages);
    }
  }

  onGroupPageChange(page: number) {
    this.currentGroupPage = page;
    this.selectedGroupRow = null; // Clear selection when changing pages
  }

  onBuildingPageChange(page: number) {
    this.currentBuildingPage = page;
    this.selectedBuildingRow = null; // Clear selection when changing pages
  }

  getGroupPageNumbers() {
    const pages = [];
    for (let i = 1; i <= this.totalGroupPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getBuildingPageNumbers() {
    const pages = [];
    for (let i = 1; i <= this.totalBuildingPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Expose Math for template
  Math = Math;
}
