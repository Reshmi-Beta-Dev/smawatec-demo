import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService, BuildingGroup, Building, Apartment } from '../../services/mock-data.service';
import { BuildingGroupModalComponent } from './building-group-modal.component';
import { DataModalComponent } from './data-modal.component';

@Component({
  selector: 'app-building',
  standalone: true,
  imports: [CommonModule, FormsModule, BuildingGroupModalComponent, DataModalComponent],
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

  // Modal functionality
  showModal: boolean = false;
  modalType: 'add' | 'edit' | 'delete' = 'add';
  modalGroupName: string = '';
  modalLoading: boolean = false;
  modalItemType: 'Building Group' | 'Building' | 'Apartment' = 'Building Group';
  
  // Data modal functionality
  showDataModal: boolean = false;
  dataModalType: 'add' | 'edit' | 'delete' = 'add';
  dataModalItemType: 'Building Group' | 'Building' | 'Apartment' = 'Building Group';
  dataModalFormData: any = {};
  dataModalLoading: boolean = false;
  dataModalFieldConfigs: any[] = [];
  dataModalDeleteItemName: string = '';


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
      this.loadTenants()
    ]);
    
    // Load apartment grid data based on default selected building
    if (this.paginatedBuildings.length > 0) {
      await this.loadApartmentGridData(this.paginatedBuildings[0]);
      // Select first apartment by default
      this.selectedApartmentRow = 0;
    }
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
    // Always select the clicked row (no unselect)
    this.selectedGroupRow = index;
    this.selectedBuildingRow = null;
    this.selectedRow = null;
    
    const buildingGroup = this.paginatedBuildingGroups[index];
    // Load buildings for this group
    await this.loadBuildingsForGroup(buildingGroup.id);
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
    // Always select the clicked row (no unselect)
    this.selectedBuildingRow = index;
    this.selectedRow = index;
    
    const building = this.paginatedBuildings[index];
    // Load apartments for this building
    await this.loadApartmentsForBuilding(building.id);
    // Load apartment grid data based on building
    await this.loadApartmentGridData(building);
  }

  onBuildingRowDoubleClick(index: number) {
    this.selectedBuildingRow = index;
    this.openEditBuildingModal();
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
        // Load apartment grid data for the first building
        await this.loadApartmentGridData(buildings[0]);
        // Select first apartment by default
        this.selectedApartmentRow = 0;
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
    // Get selected apartment from apartment grid
    if (this.selectedApartmentRow !== null && this.apartmentGridData[this.selectedApartmentRow]) {
      const apartment = this.apartmentGridData[this.selectedApartmentRow];
      return {
        number: apartment.apartment,
        water_price_per_m3: 3.45,
        floor: 1,
        surface_area: 45.5,
        rooms: 2,
        tenant: apartment.tenant,
        buildingName: apartment.buildingName
      };
    }
    
    // Fallback to building-based apartment if no apartment selected
    if (this.selectedBuildingRow !== null && this.paginatedBuildings[this.selectedBuildingRow]) {
      const building = this.paginatedBuildings[this.selectedBuildingRow];
      return {
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
    // Get tenant from selected apartment in apartment grid
    if (this.selectedApartmentRow !== null && this.apartmentGridData[this.selectedApartmentRow]) {
      const apartment = this.apartmentGridData[this.selectedApartmentRow];
      // Parse tenant name from apartment data
      const tenantName = apartment.tenant || 'Marie Dubois';
      const nameParts = tenantName.split(' ');
      const firstName = nameParts[0] || 'Marie';
      const lastName = nameParts.slice(1).join(' ') || 'Dubois';
      
      return {
        first_name: firstName,
        last_name: lastName,
        phone: '+33 1 42 36 78 90',
        mobile_phone: '+33 6 12 34 56 78',
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.fr`
      };
    }
    
    // Fallback to building-based tenant if no apartment selected
    if (this.selectedBuildingRow !== null && this.paginatedBuildings[this.selectedBuildingRow]) {
      const building = this.paginatedBuildings[this.selectedBuildingRow];
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

  editBuildingApartmentDetails() {
    if (this.selectedBuildingRow !== null && this.paginatedBuildings[this.selectedBuildingRow]) {
      this.dataModalType = 'edit';
      this.dataModalItemType = 'Building';
      this.dataModalFieldConfigs = this.buildingFields;
      this.dataModalFormData = { ...this.paginatedBuildings[this.selectedBuildingRow] };
      this.showDataModal = true;
    }
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
  private searchTimeout: any;
  
  onSearch() {
    // Clear existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    // Set new timeout for debounced search
    this.searchTimeout = setTimeout(() => {
      this.performSearch();
    }, 300); // 300ms delay
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
    // Reset to show all data
    this.loadData();
  }

  performSearch() {
    const searchTerm = this.searchData.keyword.toLowerCase().trim();
    const buildingGroupFilter = this.searchData.buildingGroup.toLowerCase().trim();
    const buildingFilter = this.searchData.building.toLowerCase().trim();
    const cityFilter = this.searchData.city.toLowerCase().trim();
    const zipCodeFilter = this.searchData.zipCode.toLowerCase().trim();
    const tenantFilter = this.searchData.tenant.toLowerCase().trim();
    const tenantIdFilter = this.searchData.tenantId.toLowerCase().trim();

    // If no search criteria, show all data
    if (!searchTerm && !buildingGroupFilter && !buildingFilter && !cityFilter && !zipCodeFilter && !tenantFilter && !tenantIdFilter) {
      this.loadData();
      return;
    }

    // Filter building groups
    const filteredBuildingGroups = this.buildingGroups.filter(group => {
      const matchesKeyword = !searchTerm || 
        group.name.toLowerCase().includes(searchTerm) ||
        group.description.toLowerCase().includes(searchTerm) ||
        group.address.toLowerCase().includes(searchTerm);
      
      const matchesBuildingGroup = !buildingGroupFilter || 
        group.name.toLowerCase().includes(buildingGroupFilter);
      
      return matchesKeyword && matchesBuildingGroup;
    });

    // Filter buildings
    const filteredBuildings = this.buildings.filter(building => {
      const matchesKeyword = !searchTerm || 
        building.name.toLowerCase().includes(searchTerm) ||
        building.address.toLowerCase().includes(searchTerm) ||
        building.city.toLowerCase().includes(searchTerm);
      
      const matchesBuilding = !buildingFilter || 
        building.name.toLowerCase().includes(buildingFilter);
      
      const matchesCity = !cityFilter || 
        building.city.toLowerCase().includes(cityFilter);
      
      const matchesZipCode = !zipCodeFilter || 
        building.zip_code.toLowerCase().includes(zipCodeFilter);
      
      const matchesBuildingGroup = !buildingGroupFilter || 
        this.buildingGroups.find(g => g.id === building.building_group_id)?.name.toLowerCase().includes(buildingGroupFilter);
      
      return matchesKeyword && matchesBuilding && matchesCity && matchesZipCode && matchesBuildingGroup;
    });

    // Filter apartments based on tenant search
    const filteredApartments = this.apartmentGridData.filter(apartment => {
      const matchesTenant = !tenantFilter || 
        apartment.tenant.toLowerCase().includes(tenantFilter);
      
      const matchesTenantId = !tenantIdFilter || 
        apartment.id.toString().includes(tenantIdFilter);
      
      const matchesKeyword = !searchTerm || 
        apartment.apartment.toLowerCase().includes(searchTerm) ||
        apartment.tenant.toLowerCase().includes(searchTerm);
      
      return matchesTenant && matchesTenantId && matchesKeyword;
    });

    // Update paginated data
    this.paginatedBuildingGroups = filteredBuildingGroups;
    this.paginatedBuildings = filteredBuildings;
    this.apartmentGridData = filteredApartments;

    // Update pagination info
    this.buildingGroupTotalItems = filteredBuildingGroups.length;
    this.buildingGroupTotalPages = Math.ceil(filteredBuildingGroups.length / this.itemsPerPage);
    this.currentGroupPage = 1;

    this.buildingTotalItems = filteredBuildings.length;
    this.buildingTotalPages = Math.ceil(filteredBuildings.length / this.itemsPerPage);
    this.currentBuildingPage = 1;

    this.apartmentTotalItems = filteredApartments.length;
    this.apartmentTotalPages = Math.ceil(filteredApartments.length / this.itemsPerPage);
    this.apartmentCurrentPage = 1;

    // Select first rows by default
    this.selectedGroupRow = filteredBuildingGroups.length > 0 ? 0 : null;
    this.selectedBuildingRow = filteredBuildings.length > 0 ? 0 : null;
    this.selectedApartmentRow = filteredApartments.length > 0 ? 0 : null;

    // Show search results notification
    this.showNotification(`Search completed: ${filteredBuildingGroups.length} groups, ${filteredBuildings.length} buildings, ${filteredApartments.length} apartments found`);
  }

  // Utility methods
  showNotification(message: string): void {
    console.log('Notification:', message);
    // In a real app, this would show a toast notification
  }

  // Apartment grid methods
  async loadApartmentGridData(selectedBuilding?: any, resetPage: boolean = true) {
    // Generate apartment data based on selected building's apartment count
    // For demo purposes, ensure at least 8 apartments per building
    const originalCount = selectedBuilding?.apartmentCount || 4;
    const apartmentCount = Math.max(originalCount, 8); // Minimum 8 apartments for demo
    const buildingName = selectedBuilding?.name || 'Building';
    
    // Generate apartment data based on the building's apartment count
    const allApartmentData = this.generateApartmentData(apartmentCount, buildingName, selectedBuilding?.id);
    
    // Set up pagination
    this.apartmentTotalItems = allApartmentData.length;
    this.apartmentTotalPages = Math.ceil(allApartmentData.length / this.itemsPerPage);
    
    // Only reset page if explicitly requested (for new building selection)
    if (resetPage) {
      this.apartmentCurrentPage = 1;
    }
    
    // Get paginated data
    const startIndex = (this.apartmentCurrentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.apartmentGridData = allApartmentData.slice(startIndex, endIndex);
  }

  generateApartmentData(count: number, buildingName: string, buildingId?: string): any[] {
    const apartments = [];
    
    // Use building ID as seed for unique data generation
    const seed = this.hashCode(buildingId || buildingName);
    
    const tenantNames = [
      'Mr. Francois Duc de la Roche Focault', 'Mr. Napoleon Bonaparte', 'Mr. Gerard Depardieu', 'Mr. Luis Vuitton',
      'Ms. Marie Curie', 'Mr. Victor Hugo', 'Ms. Coco Chanel', 'Mr. Albert Einstein',
      'Ms. Edith Piaf', 'Mr. Claude Monet', 'Ms. Brigitte Bardot', 'Mr. Jean-Paul Sartre',
      'Ms. Simone de Beauvoir', 'Mr. Marcel Proust', 'Ms. Josephine Baker', 'Mr. Henri Matisse',
      'Ms. Coco Chanel', 'Mr. Louis Pasteur', 'Ms. Marie Antoinette', 'Mr. Charles de Gaulle',
      'Ms. Simone Signoret', 'Mr. Yves Montand', 'Ms. Edith Piaf', 'Mr. Maurice Chevalier',
      'Ms. Catherine Deneuve', 'Mr. Alain Delon', 'Ms. Brigitte Bardot', 'Mr. Jean Gabin',
      'Ms. Isabelle Adjani', 'Mr. Gérard Depardieu', 'Ms. Juliette Binoche', 'Mr. Jean Reno',
      'Ms. Marion Cotillard', 'Mr. Omar Sy', 'Ms. Audrey Tautou', 'Mr. Jean Dujardin',
      'Ms. Sophie Marceau', 'Mr. Vincent Cassel', 'Ms. Eva Green', 'Mr. Romain Duris',
      'Ms. Léa Seydoux', 'Mr. Guillaume Canet', 'Ms. Mélanie Laurent', 'Mr. Mathieu Amalric',
      'Ms. Emmanuelle Béart', 'Mr. Daniel Auteuil', 'Ms. Fanny Ardant', 'Mr. Gaspard Ulliel',
      'Ms. Charlotte Gainsbourg', 'Mr. Benoît Magimel', 'Ms. Sandrine Kiberlain', 'Mr. Fabrice Luchini',
      'Ms. Karin Viard', 'Mr. François Cluzet', 'Ms. Nathalie Baye', 'Mr. Jean-Pierre Bacri',
      'Ms. Isabelle Huppert', 'Mr. Michel Blanc', 'Ms. Valérie Lemercier', 'Mr. Kad Merad',
      'Ms. Julie Depardieu', 'Mr. Jean-Paul Belmondo', 'Ms. Anouk Aimée', 'Mr. Philippe Noiret',
      'Ms. Marion Cotillard', 'Mr. Omar Sy', 'Ms. Audrey Tautou', 'Mr. Jean Dujardin',
      'Ms. Sophie Marceau', 'Mr. Vincent Cassel', 'Ms. Eva Green', 'Mr. Romain Duris',
      'Ms. Léa Seydoux', 'Mr. Guillaume Canet', 'Ms. Mélanie Laurent', 'Mr. Mathieu Amalric',
      'Ms. Emmanuelle Béart', 'Mr. Daniel Auteuil', 'Ms. Fanny Ardant', 'Mr. Gaspard Ulliel',
      'Ms. Charlotte Gainsbourg', 'Mr. Benoît Magimel', 'Ms. Sandrine Kiberlain', 'Mr. Fabrice Luchini',
      'Ms. Karin Viard', 'Mr. François Cluzet', 'Ms. Nathalie Baye', 'Mr. Jean-Pierre Bacri',
      'Ms. Isabelle Huppert', 'Mr. Michel Blanc', 'Ms. Valérie Lemercier', 'Mr. Kad Merad',
      'Ms. Julie Depardieu', 'Mr. Jean-Paul Belmondo', 'Ms. Anouk Aimée', 'Mr. Philippe Noiret'
    ];

    const apartmentTypes = [
      'Block 1, L2, APT', 'L23, APT', 'Block 3, L45, APT', 'Block, 32 L1, APT',
      'Block 2, L5, APT', 'L12, APT', 'Block 4, L8, APT', 'L45, APT',
      'Block 5, L15, APT', 'L67, APT', 'Block 6, L22, APT', 'L89, APT',
      'Block 7, L10, APT', 'L34, APT', 'Block 8, L18, APT', 'L56, APT',
      'Block 9, L25, APT', 'L78, APT', 'Block 10, L30, APT', 'L90, APT',
      'Block 11, L5, APT', 'L15, APT', 'Block 12, L20, APT', 'L35, APT',
      'Block 13, L8, APT', 'L42, APT', 'Block 14, L12, APT', 'L58, APT',
      'Block 15, L25, APT', 'L72, APT', 'Block 16, L18, APT', 'L85, APT',
      'Block 17, L3, APT', 'L28, APT', 'Block 18, L14, APT', 'L63, APT',
      'Block 19, L7, APT', 'L38, APT', 'Block 20, L22, APT', 'L75, APT',
      'Block 21, L11, APT', 'L48, APT', 'Block 22, L16, APT', 'L68, APT',
      'Block 23, L4, APT', 'L31, APT', 'Block 24, L19, APT', 'L76, APT',
      'Block 25, L9, APT', 'L52, APT', 'Block 26, L24, APT', 'L81, APT',
      'Block 27, L6, APT', 'L41, APT', 'Block 28, L17, APT', 'L59, APT',
      'Block 29, L13, APT', 'L74, APT', 'Block 30, L21, APT', 'L87, APT',
      'Block 31, L9, APT', 'L46, APT', 'Block 32, L26, APT', 'L93, APT',
      'Block 33, L4, APT', 'L37, APT', 'Block 34, L19, APT', 'L64, APT',
      'Block 35, L11, APT', 'L53, APT', 'Block 36, L28, APT', 'L79, APT',
      'Block 37, L7, APT', 'L44, APT', 'Block 38, L15, APT', 'L71, APT',
      'Block 39, L23, APT', 'L66, APT', 'Block 40, L12, APT', 'L88, APT'
    ];

    for (let i = 0; i < count; i++) {
      // Use seeded random selection for unique data per building
      const tenantIndex = (seed + i * 7) % tenantNames.length;
      const apartmentTypeIndex = (seed + i * 11) % apartmentTypes.length;
      
      const apartmentType = apartmentTypes[apartmentTypeIndex];
      const apartmentNumber = String(i + 1).padStart(2, '0');
      const tenantName = tenantNames[tenantIndex];
      
      apartments.push({
        id: i + 1,
        apartment: `${apartmentType} ${apartmentNumber}`,
        tenant: tenantName,
        buildingName: buildingName
      });
    }

    return apartments;
  }

  // Simple hash function to create seed from building ID
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  onApartmentRowClick(index: number) {
    // Always select the clicked row (no unselect)
    this.selectedApartmentRow = index;
    
    // Load apartment details for the selected apartment
    const selectedApartment = this.apartmentGridData[index];
    if (selectedApartment) {
      this.loadApartmentDetails(selectedApartment);
    }
  }

  onApartmentRowDoubleClick(index: number) {
    this.selectedApartmentRow = index;
    this.openEditApartmentModal();
  }

  loadApartmentDetails(apartment: any) {
    // Load apartment details - this could populate a details panel or form
    console.log('Selected apartment:', apartment);
    // In a real app, this would load detailed apartment information
    // For now, we'll just log the selection
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
    // Get the currently selected building
    const selectedBuilding = this.selectedBuildingRow !== null ? this.paginatedBuildings[this.selectedBuildingRow] : null;
    this.loadApartmentGridData(selectedBuilding, false);
  }

  // Math object for template
  Math = Math;

  // Field configurations for different item types
  buildingGroupFields = [
    { name: 'name', label: 'Group Name', type: 'text', required: true, placeholder: 'Enter group name...', maxlength: 100 },
    { name: 'address', label: 'Address', type: 'text', required: true, placeholder: 'Enter group address...', maxlength: 200 }
  ];

  buildingFields = [
    { name: 'name', label: 'Building Name', type: 'text', required: true, placeholder: 'Enter building name...', maxlength: 100 },
    { name: 'address', label: 'Address', type: 'text', required: true, placeholder: 'Enter building address...', maxlength: 200 },
    { name: 'zip_code', label: 'Zip Code', type: 'text', required: true, placeholder: 'Enter zip code...', maxlength: 10 }
  ];

  apartmentFields = [
    { name: 'apartment_number', label: 'Apartment Number', type: 'text', required: true, placeholder: 'Enter apartment number...', maxlength: 20 },
    { name: 'tenant', label: 'Tenant Name', type: 'text', required: true, placeholder: 'Enter tenant name...', maxlength: 100 },
    { name: 'apartment_type', label: 'Apartment Type', type: 'text', required: true, placeholder: 'Enter apartment type...', maxlength: 50 },
    { name: 'floor', label: 'Floor', type: 'number', required: true, placeholder: 'Enter floor number...' }
  ];

  // Modal methods
  openAddGroupModal() {
    this.modalType = 'add';
    this.modalGroupName = '';
    this.modalItemType = 'Building Group';
    this.showModal = true;
  }

  openEditGroupModal() {
    if (this.selectedGroupRow !== null && this.paginatedBuildingGroups[this.selectedGroupRow]) {
      this.modalType = 'edit';
      this.modalGroupName = this.paginatedBuildingGroups[this.selectedGroupRow].name || '';
      this.modalItemType = 'Building Group';
      this.showModal = true;
    }
  }

  openDeleteGroupModal() {
    if (this.selectedGroupRow !== null && this.paginatedBuildingGroups[this.selectedGroupRow]) {
      this.modalType = 'delete';
      this.modalGroupName = this.paginatedBuildingGroups[this.selectedGroupRow].name || '';
      this.modalItemType = 'Building Group';
      this.showModal = true;
    }
  }

  onGroupRowDoubleClick(index: number) {
    this.selectedGroupRow = index;
    this.openEditGroupModal();
  }

  onModalSave(event: { type: string, name: string }) {
    this.modalLoading = true;
    
    // Simulate API call delay
    setTimeout(() => {
      try {
        if (event.type === 'add') {
          this.addBuildingGroup(event.name);
        } else if (event.type === 'edit') {
          this.editBuildingGroup(event.name);
        } else if (event.type === 'delete') {
          // Determine what to delete based on current selection
          if (this.selectedGroupRow !== null) {
            this.deleteBuildingGroup();
          } else if (this.selectedBuildingRow !== null) {
            this.deleteBuilding();
          } else if (this.selectedApartmentRow !== null) {
            this.deleteApartment();
          }
        }
        
        this.showModal = false;
        this.modalLoading = false;
        this.showNotification(`Item ${event.type === 'add' ? 'added' : event.type === 'edit' ? 'updated' : 'deleted'} successfully`);
      } catch (error) {
        this.modalLoading = false;
        this.showNotification('Error processing request. Please try again.');
      }
    }, 1000);
  }

  onModalCancel() {
    this.showModal = false;
    this.modalLoading = false;
  }

  // Data modal methods
  openAddBuildingModal() {
    this.dataModalType = 'add';
    this.dataModalItemType = 'Building';
    this.dataModalFieldConfigs = this.buildingFields;
    this.dataModalFormData = {};
    this.showDataModal = true;
  }

  openEditBuildingModal() {
    if (this.selectedBuildingRow !== null && this.paginatedBuildings[this.selectedBuildingRow]) {
      this.dataModalType = 'edit';
      this.dataModalItemType = 'Building';
      this.dataModalFieldConfigs = this.buildingFields;
      this.dataModalFormData = { ...this.paginatedBuildings[this.selectedBuildingRow] };
      this.showDataModal = true;
    }
  }

  openAddApartmentModal() {
    this.dataModalType = 'add';
    this.dataModalItemType = 'Apartment';
    this.dataModalFieldConfigs = this.apartmentFields;
    this.dataModalFormData = {};
    this.showDataModal = true;
  }

  openEditApartmentModal() {
    if (this.selectedApartmentRow !== null && this.apartmentGridData[this.selectedApartmentRow]) {
      this.dataModalType = 'edit';
      this.dataModalItemType = 'Apartment';
      this.dataModalFieldConfigs = this.apartmentFields;
      this.dataModalFormData = { ...this.apartmentGridData[this.selectedApartmentRow] };
      this.showDataModal = true;
    }
  }

  onDataModalSave(event: { type: string, data: any }) {
    this.dataModalLoading = true;
    
    // Simulate API call delay
    setTimeout(() => {
      try {
        if (event.type === 'add') {
          if (this.dataModalItemType === 'Building') {
            this.addBuilding(event.data);
          } else if (this.dataModalItemType === 'Apartment') {
            this.addApartment(event.data);
          }
        } else if (event.type === 'edit') {
          if (this.dataModalItemType === 'Building') {
            this.editBuilding(event.data);
          } else if (this.dataModalItemType === 'Apartment') {
            this.editApartment(event.data);
          }
        }
        
        this.showDataModal = false;
        this.dataModalLoading = false;
        this.showNotification(`${this.dataModalItemType} ${event.type === 'add' ? 'added' : 'updated'} successfully`);
      } catch (error) {
        this.dataModalLoading = false;
        this.showNotification('Error processing request. Please try again.');
      }
    }, 1000);
  }

  onDataModalCancel() {
    this.showDataModal = false;
    this.dataModalLoading = false;
  }

  private addBuildingGroup(name: string) {
    const newGroup: BuildingGroup = {
      id: `bg-${Date.now()}`,
      name: name,
      address: 'New Address',
      buildingCount: 0,
      apartmentCount: 0,
      deviceCount: 0
    };
    
    this.paginatedBuildingGroups.unshift(newGroup);
    this.buildingGroupTotalItems++;
    this.buildingGroupTotalPages = Math.ceil(this.buildingGroupTotalItems / this.itemsPerPage);
  }

  private editBuildingGroup(name: string) {
    if (this.selectedGroupRow !== null) {
      this.paginatedBuildingGroups[this.selectedGroupRow].name = name;
    }
  }

  private deleteBuildingGroup() {
    if (this.selectedGroupRow !== null) {
      const groupToDelete = this.paginatedBuildingGroups[this.selectedGroupRow];
      // Remove from source data
      this.buildingGroups = this.buildingGroups.filter(group => group.id !== groupToDelete.id);
      // Refresh the UI
      this.loadBuildingGroups();
      this.selectedGroupRow = null;
    }
  }

  // Building delete functionality
  openDeleteBuildingModal() {
    if (this.selectedBuildingRow !== null && this.paginatedBuildings[this.selectedBuildingRow]) {
      this.modalType = 'delete';
      this.modalGroupName = this.paginatedBuildings[this.selectedBuildingRow].name || '';
      this.modalItemType = 'Building';
      this.showModal = true;
    }
  }

  private deleteBuilding() {
    if (this.selectedBuildingRow !== null) {
      const buildingToDelete = this.paginatedBuildings[this.selectedBuildingRow];
      // Remove from source data
      this.buildings = this.buildings.filter(building => building.id !== buildingToDelete.id);
      // Refresh the UI
      this.loadBuildings();
      this.selectedBuildingRow = null;
      
      // Refresh apartment grid
      this.loadApartmentGridData();
    }
  }

  // Apartment delete functionality
  openDeleteApartmentModal() {
    if (this.selectedApartmentRow !== null && this.apartmentGridData[this.selectedApartmentRow]) {
      this.modalType = 'delete';
      this.modalGroupName = this.apartmentGridData[this.selectedApartmentRow].apartment_number || '';
      this.modalItemType = 'Apartment';
      this.showModal = true;
    }
  }

  private deleteApartment() {
    if (this.selectedApartmentRow !== null) {
      const apartmentToDelete = this.apartmentGridData[this.selectedApartmentRow];
      // Remove from source data
      this.apartments = this.apartments.filter(apartment => apartment.id !== apartmentToDelete.id);
      // Refresh the UI
      this.loadApartmentGridData();
      this.selectedApartmentRow = null;
    }
  }

  // Building add/edit methods
  private addBuilding(data: any) {
    const newBuilding: any = {
      id: `b-${Date.now()}`,
      name: data.name,
      address: data.address,
      zip_code: data.zip_code,
      apartmentCount: 0,
      deviceCount: 0,
      building_group_id: this.selectedGroupRow !== null ? this.paginatedBuildingGroups[this.selectedGroupRow].id : null
    };
    
    this.buildings.unshift(newBuilding);
    this.buildingTotalItems++;
    this.buildingTotalPages = Math.ceil(this.buildingTotalItems / this.itemsPerPage);
    this.loadBuildings();
  }

  editBuilding(data: any) {
    if (this.selectedBuildingRow !== null) {
      const building = this.paginatedBuildings[this.selectedBuildingRow];
      building.name = data.name;
      building.address = data.address;
      building.zip_code = data.zip_code;
      
      // Update in source data
      const sourceIndex = this.buildings.findIndex(b => b.id === building.id);
      if (sourceIndex !== -1) {
        this.buildings[sourceIndex] = { ...building };
      }
      
      this.loadBuildings();
    }
  }

  // Apartment add/edit methods
  addApartment(data?: any) {
    if (data) {
      // Called from modal with data
      const selectedBuilding = this.selectedBuildingRow !== null ? this.paginatedBuildings[this.selectedBuildingRow] : null;
      if (!selectedBuilding) return;

      const newApartment: any = {
        id: `a-${Date.now()}`,
        apartment_number: data.apartment_number,
        tenant: data.tenant,
        apartment_type: data.apartment_type,
        floor: data.floor,
        building_id: selectedBuilding.id,
        apartment: data.apartment_number // For compatibility
      };
      
      this.apartments.unshift(newApartment);
      this.apartmentTotalItems++;
      this.apartmentTotalPages = Math.ceil(this.apartmentTotalItems / this.itemsPerPage);
      this.loadApartmentGridData();
    } else {
      // Called from button click - open add modal
      this.openAddApartmentModal();
    }
  }

  editApartment(data: any) {
    if (this.selectedApartmentRow !== null) {
      const apartment = this.apartmentGridData[this.selectedApartmentRow];
      apartment.apartment_number = data.apartment_number;
      apartment.tenant = data.tenant;
      apartment.apartment_type = data.apartment_type;
      apartment.floor = data.floor;
      apartment.apartment = data.apartment_number; // For compatibility
      
      // Update in source data
      const sourceIndex = this.apartments.findIndex(a => a.id === apartment.id);
      if (sourceIndex !== -1) {
        this.apartments[sourceIndex] = { ...apartment };
      }
      
      this.loadApartmentGridData();
    }
  }

}
