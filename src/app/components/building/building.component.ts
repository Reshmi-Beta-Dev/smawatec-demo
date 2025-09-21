import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService, BuildingGroup, Building, Apartment } from '../../services/mock-data.service';

@Component({
  selector: 'app-building',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BuildingComponent implements OnInit {
  selectedRow: number | null = null;
  selectedGroupRow: number | null = null;
  selectedBuildingRow: number | null = null;
  
  // Search data
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

  // Pagination properties
  currentBuildingPage = 1;
  buildingTotalPages = 1;
  buildingTotalItems = 0;
  currentGroupPage = 1;
  buildingGroupTotalPages = 1;
  buildingGroupTotalItems = 0;
  itemsPerPage = 8;
  paginatedBuildings: any[] = [];
  paginatedBuildingGroups: any[] = [];

  // Apartment grid properties
  apartmentGridData: any[] = [];
  selectedApartmentRow: number | null = null;
  apartmentCurrentPage = 1;
  apartmentTotalPages = 1;
  apartmentTotalItems = 0;

  // Modal properties
  showAddGroupModal = false;
  showAddBuildingModal = false;
  showUpdateBuildingModal = false;
  showDeleteConfirmation = false;
  selectedBuildingForEdit: any = null;
  deleteConfirmationData: any = null;
  isDeleting = false;
  
  // Data arrays
  buildingGroups: any[] = [];
  buildings: any[] = [];
  apartments: any[] = [];
  tenants: any[] = [];
  
  // Loading and error states
  loading = false;
  error: string | null = null;

  constructor(private mockDataService: MockDataService) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    // Load building groups first
    await this.loadBuildingGroups();
    
    // Set default selections after building groups are loaded
    await this.setDefaultSelections();
    
    // Load other data in parallel (but don't load buildings again as it's already loaded by setDefaultSelections)
    await Promise.all([
      this.loadApartments(),
      this.loadTenants(),
      this.loadApartmentGridData()
    ]);
  }

  async setDefaultSelections() {
    // Select first building group by default
    if (this.paginatedBuildingGroups.length > 0) {
      this.selectedGroupRow = 0;
      // Load buildings for the first group
      const firstGroup = this.paginatedBuildingGroups[0];
      await this.loadBuildingsForGroup(firstGroup.id);
    }
  }

  // Building Group methods
  async loadBuildingGroups() {
    try {
      this.loading = true;
      const response = await this.mockDataService.getBuildingGroups(this.currentGroupPage, this.itemsPerPage);
      this.paginatedBuildingGroups = response.buildingGroups;
      this.buildingGroups = response.buildingGroups;
      this.buildingGroupTotalPages = response.totalPages;
      this.buildingGroupTotalItems = response.totalCount;
    } catch (error) {
      console.error('Error loading building groups:', error);
      this.error = 'Failed to load building groups';
    } finally {
      this.loading = false;
    }
  }

  async onGroupRowClick(index: number) {
    // Only select if not already selected
    if (this.selectedGroupRow !== index) {
      this.selectedGroupRow = index;
      this.selectedBuildingRow = null;
      this.selectedRow = null;
      
      const buildingGroup = this.paginatedBuildingGroups[index];
      // Load buildings for this group
      await this.loadBuildingsForGroup(buildingGroup.id);
    }
  }

  onGroupPageChange(page: number) {
    this.currentGroupPage = page;
    this.loadBuildingGroups();
  }

  // Building methods
  async loadBuildings() {
    try {
      this.loading = true;
      const response = await this.mockDataService.getBuildings(this.currentBuildingPage, this.itemsPerPage);
      this.paginatedBuildings = response.buildings;
      this.buildings = response.buildings;
      this.buildingTotalPages = response.totalPages;
      this.buildingTotalItems = response.totalCount;
    } catch (error) {
      console.error('Error loading buildings:', error);
      this.error = 'Failed to load buildings';
    } finally {
      this.loading = false;
    }
  }

  onBuildingPageChange(page: number) {
    this.currentBuildingPage = page;
    this.loadBuildings();
  }

  async onBuildingRowClick(index: number) {
    // Only select if not already selected
    if (this.selectedBuildingRow !== index) {
      this.selectedBuildingRow = index;
      this.selectedRow = index;
      
      const building = this.paginatedBuildings[index];
      // Load apartments for this building
      await this.loadApartmentsForBuilding(building.id);
    }
  }

  onBuildingRowDoubleClick(building: any, index: number) {
    this.selectedBuildingForEdit = building;
    this.showUpdateBuildingModal = true;
  }

  // Load buildings for a specific group
  async loadBuildingsForGroup(buildingGroupId: string) {
    try {
      this.loading = true;
      const buildings = await this.mockDataService.getBuildingsByGroup(buildingGroupId);
      this.paginatedBuildings = buildings;
      this.buildings = buildings;
      this.buildingTotalItems = buildings.length;
      this.buildingTotalPages = Math.ceil(buildings.length / this.itemsPerPage);
      this.currentBuildingPage = 1;
      
      // Select first building by default and load its apartments
      if (buildings.length > 0) {
        this.selectedBuildingRow = 0;
        this.selectedRow = 0;
        // Load apartments for the first building
        await this.loadApartmentsForBuilding(buildings[0].id);
      }
    } catch (error) {
      console.error('Error loading buildings for group:', error);
      this.error = 'Failed to load buildings for group';
    } finally {
      this.loading = false;
    }
  }

  // Load apartments for a specific building
  async loadApartmentsForBuilding(buildingId: string) {
    try {
      this.loading = true;
      const apartments = await this.mockDataService.getApartmentsByBuilding(buildingId);
      this.apartments = apartments;
    } catch (error) {
      console.error('Error loading apartments for building:', error);
    } finally {
      this.loading = false;
    }
  }

  // Apartment methods
  async loadApartments() {
    try {
      const response = await this.mockDataService.getApartments(1, 1000); // Load all apartments
      this.apartments = response.apartments;
    } catch (error) {
      console.error('Error loading apartments:', error);
    }
  }

  // Tenant methods
  async loadTenants() {
    try {
      this.tenants = await this.mockDataService.getTenants();
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  }

  // Pagination helper methods
  getGroupPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentGroupPage - 2);
    const endPage = Math.min(this.buildingGroupTotalPages, this.currentGroupPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getBuildingPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentBuildingPage - 2);
    const endPage = Math.min(this.buildingTotalPages, this.currentBuildingPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Template helper methods
  getSelectedBuildingGroup(): any {
    if (this.selectedGroupRow !== null && this.paginatedBuildingGroups[this.selectedGroupRow]) {
      return this.paginatedBuildingGroups[this.selectedGroupRow];
    }
    return null;
  }

  getSelectedBuilding(): any {
    if (this.selectedBuildingRow !== null && this.paginatedBuildings[this.selectedBuildingRow]) {
      return this.paginatedBuildings[this.selectedBuildingRow];
    }
    return null;
  }

  getSelectedApartment(): any {
    if (this.selectedBuildingRow !== null && this.paginatedBuildings[this.selectedBuildingRow]) {
      const building = this.paginatedBuildings[this.selectedBuildingRow];
      // Try to find apartment by building name or building ID
      const apartment = this.apartments.find(apt => 
        apt.building === building.name || 
        apt.building_id === building.id ||
        apt.buildingGroup === building.buildingGroup
      );
      
      return apartment || {
        number: `Apt ${building.name?.split(' ').pop() || '001'}`,
        water_price_per_m3: 3.45,
        floor: 1,
        surface_area: 45.5,
        rooms: 2
      };
    }
    return {
      number: 'Apt 001',
      water_price_per_m3: 3.45,
      floor: 1,
      surface_area: 45.5,
      rooms: 2
    };
  }

  getSelectedTenant(): any {
    if (this.selectedBuildingRow !== null && this.paginatedBuildings[this.selectedBuildingRow]) {
      const building = this.paginatedBuildings[this.selectedBuildingRow];
      // Try to find apartment by building name or building ID
      const apartment = this.apartments.find(apt => 
        apt.building === building.name || 
        apt.building_id === building.id ||
        apt.buildingGroup === building.buildingGroup
      );
      const tenant = this.tenants.find(t => t.apartment_id === apartment?.id);
      
      return tenant || {
        first_name: 'Marie',
        last_name: 'Dubois',
        phone: '+33 1 42 36 78 90',
        mobile_phone: '+33 6 12 34 56 78',
        email: 'marie.dubois@email.fr'
      };
    }
    return {
      first_name: 'Marie',
      last_name: 'Dubois',
      phone: '+33 1 42 36 78 90',
      mobile_phone: '+33 6 12 34 56 78',
      email: 'marie.dubois@email.fr'
    };
  }

  // Action methods
  addGroup() {
    this.showAddGroupModal = true;
  }

  removeGroup() {
    if (this.selectedGroupRow !== null) {
      const group = this.paginatedBuildingGroups[this.selectedGroupRow];
        this.deleteConfirmationData = {
          type: 'group',
        item: group
        };
        this.showDeleteConfirmation = true;
    } else {
      this.showNotification('Please select a building group to delete');
    }
  }

  addBuilding() {
    this.showAddBuildingModal = true;
  }

  removeBuilding() {
    if (this.selectedBuildingRow !== null) {
      const building = this.paginatedBuildings[this.selectedBuildingRow];
      this.deleteConfirmationData = {
        type: 'building',
        item: building
      };
      this.showDeleteConfirmation = true;
    } else {
      this.showNotification('Please select a building to delete');
    }
  }


  saveDetails() {
    this.showNotification('Save details functionality');
  }

  // Modal event handlers
  onModalClose() {
    this.showAddGroupModal = false;
  }

  onBuildingModalClose() {
    this.showAddBuildingModal = false;
  }

  onUpdateBuildingModalClose() {
    this.showUpdateBuildingModal = false;
    this.selectedBuildingForEdit = null;
  }

  onGroupSaved(group: any) {
    this.showNotification('Building group saved successfully');
    this.showAddGroupModal = false;
    this.loadBuildingGroups();
  }

  onBuildingSaved(building: any) {
    this.showNotification('Building saved successfully');
      this.showAddBuildingModal = false;
    this.loadBuildings();
  }

  onBuildingUpdated(building: any) {
    this.showNotification('Building updated successfully');
        this.showUpdateBuildingModal = false;
        this.selectedBuildingForEdit = null;
    this.loadBuildings();
  }

  onDeleteConfirm() {
    this.isDeleting = true;
    const deleteType = this.deleteConfirmationData?.type;
    const deleteItem = this.deleteConfirmationData?.item;
    
    setTimeout(() => {
      this.showNotification(`${deleteType === 'group' ? 'Building Group' : 'Building'} deleted successfully`);
      this.showDeleteConfirmation = false;
      this.isDeleting = false;
      
      if (deleteType === 'group') {
        // Remove from paginated data
        this.paginatedBuildingGroups = this.paginatedBuildingGroups.filter(g => g.id !== deleteItem.id);
        this.buildingGroupTotalItems--;
        this.buildingGroupTotalPages = Math.ceil(this.buildingGroupTotalItems / this.itemsPerPage);
        
        // Select first available group or clear if none
        if (this.paginatedBuildingGroups.length > 0) {
          this.selectedGroupRow = 0;
          this.loadBuildingsForGroup(this.paginatedBuildingGroups[0].id);
        } else {
          this.selectedGroupRow = null;
          this.selectedBuildingRow = null;
          this.selectedRow = null;
        }
        
        // Reload data
        this.loadBuildingGroups();
      } else {
        // Remove from paginated data
        this.paginatedBuildings = this.paginatedBuildings.filter(b => b.id !== deleteItem.id);
        this.buildingTotalItems--;
        this.buildingTotalPages = Math.ceil(this.buildingTotalItems / this.itemsPerPage);
        
        // Select first available building or clear if none
        if (this.paginatedBuildings.length > 0) {
          this.selectedBuildingRow = 0;
          this.selectedRow = 0;
          this.loadApartmentsForBuilding(this.paginatedBuildings[0].id);
        } else {
          this.selectedBuildingRow = null;
          this.selectedRow = null;
        }
        
        // Reload data
        this.loadBuildings();
      }
      
      this.deleteConfirmationData = null;
    }, 1000);
  }

  onDeleteCancel() {
    this.showDeleteConfirmation = false;
    this.deleteConfirmationData = null;
  }

  // Search functionality
  onSearch() {
    this.showNotification('Search functionality');
    // Implement search logic here
  }

  onClearSearch() {
    this.searchData = {
      keyword: '',
      building: '',
      buildingGroup: '',
      deviceName: '',
      city: '',
      zipCode: '',
      tenant: '',
      tenantId: ''
    };
    this.loadData();
  }

  // Utility methods
  showNotification(message: string): void {
    console.log('Notification:', message);
    // In a real app, this would show a toast notification
  }

  // Apartment grid methods
  async loadApartmentGridData() {
    // Mock apartment grid data based on the image - create more data for pagination
    const allApartmentData = [
      {
        id: 1,
        apartment: 'Block 1, L2, APT 12',
        tenant: 'Mr. Francois Duc de la Roche Focault'
      },
      {
        id: 2,
        apartment: 'L23, APT 3',
        tenant: 'Mr. Napoleon Bonaparte'
      },
      {
        id: 3,
        apartment: 'Block 3, L45, APT 23',
        tenant: 'Mr. Gerard Depardieu'
      },
      {
        id: 4,
        apartment: 'Block, 32 L1, APT1',
        tenant: 'Mr. Luis Vuitton'
      },
      {
        id: 5,
        apartment: 'Block 2, L5, APT 15',
        tenant: 'Ms. Marie Curie'
      },
      {
        id: 6,
        apartment: 'L12, APT 8',
        tenant: 'Mr. Victor Hugo'
      },
      {
        id: 7,
        apartment: 'Block 4, L8, APT 32',
        tenant: 'Ms. Coco Chanel'
      },
      {
        id: 8,
        apartment: 'L45, APT 12',
        tenant: 'Mr. Albert Einstein'
      },
      {
        id: 9,
        apartment: 'Block 5, L15, APT 45',
        tenant: 'Ms. Edith Piaf'
      },
      {
        id: 10,
        apartment: 'L67, APT 23',
        tenant: 'Mr. Claude Monet'
      },
      {
        id: 11,
        apartment: 'Block 6, L22, APT 67',
        tenant: 'Ms. Brigitte Bardot'
      },
      {
        id: 12,
        apartment: 'L89, APT 34',
        tenant: 'Mr. Jean-Paul Sartre'
      }
    ];
    
    // Set up pagination
    this.apartmentTotalItems = allApartmentData.length;
    this.apartmentTotalPages = Math.ceil(allApartmentData.length / this.itemsPerPage);
    this.apartmentCurrentPage = 1;
    
    // Get paginated data
    const startIndex = (this.apartmentCurrentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.apartmentGridData = allApartmentData.slice(startIndex, endIndex);
  }

  onApartmentRowClick(index: number) {
    this.selectedApartmentRow = this.selectedApartmentRow === index ? null : index;
  }

  addApartment() {
    this.showNotification('Add Apartment functionality');
  }

  removeApartment() {
    if (this.selectedApartmentRow !== null) {
      this.apartmentGridData.splice(this.selectedApartmentRow, 1);
      this.selectedApartmentRow = null;
      this.showNotification('Apartment removed successfully');
    } else {
      this.showNotification('Please select an apartment to remove');
    }
  }

  // Apartment pagination methods
  getApartmentPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.apartmentCurrentPage - 2);
    const endPage = Math.min(this.apartmentTotalPages, this.apartmentCurrentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onApartmentPageChange(page: number) {
    this.apartmentCurrentPage = page;
    this.loadApartmentGridData();
  }

  // Math object for template
  Math = Math;
}