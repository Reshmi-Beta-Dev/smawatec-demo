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
  async loadApartmentGridData(selectedBuilding?: any) {
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
    this.apartmentCurrentPage = 1;
    
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

  loadApartmentDetails(apartment: any) {
    // Load apartment details - this could populate a details panel or form
    console.log('Selected apartment:', apartment);
    // In a real app, this would load detailed apartment information
    // For now, we'll just log the selection
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