import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../services/mock-data.service';
import { FindDeviceModalComponent } from './find-device-modal.component';

@Component({
  selector: 'app-device-details',
  standalone: true,
  imports: [CommonModule, FormsModule, FindDeviceModalComponent],
  templateUrl: './device-details.component.html',
  styleUrls: ['./device-details.component.css']
})
export class DeviceDetailsComponent implements OnInit {
  selectedRow: number | null = null;
  selectedGroupRow: number | null = null;
  selectedBuildingRow: number | null = null;
  selectedUnassignedRow: number | null = null;
  
  // Device details properties
  selectedDevice: any = null;
  deviceDetails: any = null;
  
  // Find Device Modal properties
  showFindDeviceModal: boolean = false;
  findDeviceLoading: boolean = false;
  
  // Data properties
  devices: any[] = [];
  buildingGroups: any[] = [];
  buildings: any[] = [];
  apartments: any[] = [];
  tenants: any[] = [];
  unassignedDevices: any[] = [];
  
  // Pagination properties
  currentGroupPage = 1;
  buildingGroupTotalPages = 1;
  buildingGroupTotalItems = 0;
  currentBuildingPage = 1;
  buildingTotalPages = 1;
  buildingTotalItems = 0;
  currentUnassignedPage = 1;
  unassignedTotalPages = 1;
  unassignedTotalItems = 0;
  itemsPerPage = 8;
  
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

  // Search state
  private searchTimeout: any;
  private originalBuildingGroups: any[] = [];
  private originalBuildings: any[] = [];
  private originalUnassignedDevices: any[] = [];
  
  loading = false;
  error: string | null = null;

  constructor(private mockDataService: MockDataService) {}

  async ngOnInit() {
    await this.loadData();
  }

  onRowClick(index: number) {
    this.selectedRow = this.selectedRow === index ? null : index;
  }

  onGroupRowClick(index: number) {
    this.selectedGroupRow = this.selectedGroupRow === index ? null : index;
    if (this.selectedGroupRow !== null) {
      const buildingGroup = this.buildingGroups[this.selectedGroupRow];
      this.loadBuildingsForGroup(buildingGroup.id);
    }
  }

  onBuildingRowClick(index: number) {
    this.selectedBuildingRow = this.selectedBuildingRow === index ? null : index;
    this.selectedUnassignedRow = null; // Remove unassigned selection
    this.loadDeviceDetails();
  }

  onUnassignedRowClick(index: number) {
    this.selectedUnassignedRow = this.selectedUnassignedRow === index ? null : index;
    this.selectedBuildingRow = null; // Remove building selection
    this.loadDeviceDetails();
  }

  loadDeviceDetails() {
    if (this.selectedBuildingRow !== null) {
      // Building selected - show building's device details
      const building = this.buildings[this.selectedBuildingRow];
      this.selectedDevice = building;
      this.deviceDetails = {
        name: building?.name || 'Compteur Eau Principal',
        serial: `SM-BLD-${building?.id || '001'}`
      };
    } else if (this.selectedUnassignedRow !== null) {
      // Unassigned device selected - show unassigned device details
      const device = this.unassignedDevices[this.selectedUnassignedRow];
      this.selectedDevice = device;
      this.deviceDetails = {
        name: device?.lastDeviceName || 'Compteur Eau Principal',
        serial: device?.serial || 'SM-001-001'
      };
    } else {
      // No selection - clear details
      this.selectedDevice = null;
      this.deviceDetails = null;
    }
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
    this.showFindDeviceModal = true;
  }

  onFindDeviceAssign(device: any) {
    this.findDeviceLoading = true;
    
    // Simulate API call delay
    setTimeout(() => {
      // Add device to unassigned devices list
      const newDevice = {
        id: device.id,
        name: device.name,
        type: device.type,
        status: device.status,
        signalStrength: device.signalStrength,
        lastSeen: device.lastSeen,
        isOnline: device.isOnline
      };
      
      this.unassignedDevices.unshift(newDevice);
      this.unassignedTotalItems++;
      this.unassignedTotalPages = Math.ceil(this.unassignedTotalItems / this.itemsPerPage);
      
      this.showFindDeviceModal = false;
      this.findDeviceLoading = false;
      this.showNotification(`Device "${device.name}" found and added to unassigned devices`);
    }, 1000);
  }

  onFindDeviceCancel() {
    this.showFindDeviceModal = false;
    this.findDeviceLoading = false;
  }

  async loadData() {
    await Promise.all([
      this.loadBuildingGroups(),
      this.loadDevices(),
      this.loadUnassignedDevices(),
      this.loadDefaultBuildings()
    ]);
    
    // Store original data for search functionality (building groups already stored in loadBuildingGroups)
    this.originalBuildings = [...this.buildings];
    // originalUnassignedDevices already stored in loadUnassignedDevices
  }

  async loadBuildingGroups() {
    try {
      this.loading = true;
      // Load all building groups for search functionality
      const response = await this.mockDataService.getBuildingGroups(1, 1000); // Load all groups
      this.originalBuildingGroups = response.buildingGroups; // Store all groups for search
      
      // Set up pagination for display
      this.buildingGroupTotalItems = response.totalCount;
      this.buildingGroupTotalPages = Math.ceil(response.totalCount / this.itemsPerPage);
      
      // Get paginated data for display
      const startIndex = (this.currentGroupPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.buildingGroups = response.buildingGroups.slice(startIndex, endIndex);
    } catch (error) {
      console.error('Error loading building groups:', error);
      this.error = 'Failed to load building groups';
    } finally {
      this.loading = false;
    }
  }

  async loadBuildingsForGroup(buildingGroupId: string) {
    try {
      this.loading = true;
      const buildings = await this.mockDataService.getBuildingsByGroup(buildingGroupId);
      
      // Enhance buildings with additional dummy data for device-organizer
      // In device organizer: each building has exactly one apartment
      this.buildings = buildings.map((building, index) => {
        const buildingName = building.name || this.getRandomBuildingName(index);
        // Use building ID as seed to ensure unique data per building
        const buildingId = building.id || `building-${index}`;
        return {
          ...building,
          // Ensure we have proper fallback data
          name: buildingName,
          address: building.address || this.getRandomAddress(index),
          // Generate apartment address and tenant name for the single apartment using building ID as seed
          apartmentAddress: this.getRandomApartmentAddress(buildingId, buildingName),
          tenantName: this.getRandomTenantName(buildingId)
        };
      });
      
      this.buildingTotalItems = this.buildings.length;
      this.buildingTotalPages = Math.ceil(this.buildings.length / this.itemsPerPage);
      this.currentBuildingPage = 1;
    } catch (error) {
      console.error('Error loading buildings for group:', error);
      this.error = 'Failed to load buildings for group';
    } finally {
      this.loading = false;
    }
  }

  async loadDevices() {
    try {
    this.loading = true;
    this.error = null;

      // Mock device data with French context
      this.devices = [
        { id: 1, name: 'Compteur Eau 001', serial: 'SM-001-001', status: 'Actif', location: 'Résidence Vendôme' },
        { id: 2, name: 'Compteur Eau 002', serial: 'SM-002-001', status: 'Maintenance', location: 'Résidence Champs-Élysées' },
        { id: 3, name: 'Compteur Eau 003', serial: 'SM-003-001', status: 'Actif', location: 'Résidence Montmartre' }
      ];

    } catch (error) {
      console.error('Error loading devices:', error);
      this.error = 'Failed to load device data';
    } finally {
      this.loading = false;
    }
  }

  async loadUnassignedDevices() {
    try {
      this.loading = true;
      // Mock unassigned devices with French context - devices that were removed or need reassignment
      const allUnassignedDevices = [
        { 
          id: 1, 
          serial: 'SM-UN-001', 
          lastDeviceName: 'Compteur Eau Principal', 
          lastAddress: '15 Place Vendôme, 75001 Paris',
          lastApartment: 'Apt 101',
          lastTenant: 'Dubois, Marie'
        },
        { 
          id: 2, 
          serial: 'SM-UN-002', 
          lastDeviceName: 'Compteur Eau Retiré', 
          lastAddress: '42 Champs-Élysées, 75008 Paris',
          lastApartment: 'Apt 205',
          lastTenant: 'Martin, Pierre'
        },
        { 
          id: 3, 
          serial: 'SM-UN-003', 
          lastDeviceName: 'Compteur Eau Défectueux', 
          lastAddress: '8 Rue de Rivoli, 75004 Paris',
          lastApartment: 'Apt 301',
          lastTenant: 'Laurent, Sophie'
        },
        { 
          id: 4, 
          serial: 'SM-UN-004', 
          lastDeviceName: 'Compteur Eau Rénové', 
          lastAddress: '25 Place de l\'Opéra, 75009 Paris',
          lastApartment: 'Apt 504',
          lastTenant: 'Moreau, Jean'
        },
        { 
          id: 5, 
          serial: 'SM-UN-005', 
          lastDeviceName: 'Compteur Eau Ancien', 
          lastAddress: '14 Rue de Montmartre, 75001 Paris',
          lastApartment: 'Apt 102',
          lastTenant: 'Petit, Isabelle'
        },
        { 
          id: 6, 
          serial: 'SM-UN-006', 
          lastDeviceName: 'Compteur Eau Remplacé', 
          lastAddress: '32 Avenue des Champs-Élysées, 75008 Paris',
          lastApartment: 'Apt 406',
          lastTenant: 'Bernard, François'
        },
        { 
          id: 7, 
          serial: 'SM-UN-007', 
          lastDeviceName: 'Compteur Eau Maintenance', 
          lastAddress: '18 Rue de la Paix, 75002 Paris',
          lastApartment: 'Apt 203',
          lastTenant: 'Rousseau, Claire'
        },
        { 
          id: 8, 
          serial: 'SM-UN-008', 
          lastDeviceName: 'Compteur Eau Temporaire', 
          lastAddress: '67 Boulevard Saint-Germain, 75005 Paris',
          lastApartment: 'Apt 105',
          lastTenant: 'Simon, Antoine'
        },
        { 
          id: 9, 
          serial: 'SM-UN-009', 
          lastDeviceName: 'Compteur Eau Test', 
          lastAddress: '91 Rue de la République, 75011 Paris',
          lastApartment: 'Apt 308',
          lastTenant: 'Durand, Nathalie'
        },
        { 
          id: 10, 
          serial: 'SM-UN-010', 
          lastDeviceName: 'Compteur Eau Réparé', 
          lastAddress: '156 Rue de Vaugirard, 75015 Paris',
          lastApartment: 'Apt 207',
          lastTenant: 'Leroy, Philippe'
        },
        { 
          id: 11, 
          serial: 'SM-UN-011', 
          lastDeviceName: 'Compteur Eau Nouveau', 
          lastAddress: '23 Place de la Bastille, 75011 Paris',
          lastApartment: 'Apt 401',
          lastTenant: 'Roux, Catherine'
        },
        { 
          id: 12, 
          serial: 'SM-UN-012', 
          lastDeviceName: 'Compteur Eau En Attente', 
          lastAddress: '45 Rue de la Roquette, 75011 Paris',
          lastApartment: 'Apt 109',
          lastTenant: 'Blanc, Michel'
        },
        { 
          id: 13, 
          serial: 'SM-UN-013', 
          lastDeviceName: 'Compteur Eau Démonté', 
          lastAddress: '78 Avenue Parmentier, 75011 Paris',
          lastApartment: 'Apt 503',
          lastTenant: 'Moreau, Anne'
        },
        { 
          id: 14, 
          serial: 'SM-UN-014', 
          lastDeviceName: 'Compteur Eau Stock', 
          lastAddress: '12 Rue de Charonne, 75011 Paris',
          lastApartment: 'Apt 204',
          lastTenant: 'Petit, Thomas'
        },
        { 
          id: 15, 
          serial: 'SM-UN-015', 
          lastDeviceName: 'Compteur Eau Réservé', 
          lastAddress: '89 Rue de la Folie-Méricourt, 75011 Paris',
          lastApartment: 'Apt 306',
          lastTenant: 'Bernard, Julie'
        },
        { 
          id: 16, 
          serial: 'SM-UN-016', 
          lastDeviceName: 'Compteur Eau Spare', 
          lastAddress: '34 Rue de la Roquette, 75011 Paris',
          lastApartment: 'Apt 108',
          lastTenant: 'Rousseau, Marc'
        },
        { 
          id: 17, 
          serial: 'SM-UN-017', 
          lastDeviceName: 'Compteur Eau Backup', 
          lastAddress: '56 Rue de la Fontaine au Roi, 75011 Paris',
          lastApartment: 'Apt 405',
          lastTenant: 'Simon, Valérie'
        },
        { 
          id: 18, 
          serial: 'SM-UN-018', 
          lastDeviceName: 'Compteur Eau Remplacement', 
          lastAddress: '78 Rue de la Roquette, 75011 Paris',
          lastApartment: 'Apt 209',
          lastTenant: 'Durand, David'
        },
        { 
          id: 19, 
          serial: 'SM-UN-019', 
          lastDeviceName: 'Compteur Eau Standby', 
          lastAddress: '91 Rue de la Folie-Méricourt, 75011 Paris',
          lastApartment: 'Apt 307',
          lastTenant: 'Leroy, Sandrine'
        },
        { 
          id: 20, 
          serial: 'SM-UN-020', 
          lastDeviceName: 'Compteur Eau En Stock', 
          lastAddress: '123 Rue de Charonne, 75011 Paris',
          lastApartment: 'Apt 408',
          lastTenant: 'Roux, Fabien'
        }
      ];
      
      // Store all unassigned devices for search
      this.originalUnassignedDevices = [...allUnassignedDevices];
      
      // Set up pagination
      this.unassignedTotalItems = allUnassignedDevices.length;
      this.unassignedTotalPages = Math.ceil(allUnassignedDevices.length / this.itemsPerPage);
      this.currentUnassignedPage = 1;
      
      // Get paginated data
      const startIndex = (this.currentUnassignedPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.unassignedDevices = allUnassignedDevices.slice(startIndex, endIndex);
      
    } catch (error) {
      console.error('Error loading unassigned devices:', error);
      this.error = 'Failed to load unassigned devices';
    } finally {
      this.loading = false;
    }
  }

  async loadDefaultBuildings() {
    try {
      this.loading = true;
      // Load default buildings to show some data initially
      const response = await this.mockDataService.getBuildings(1, 8);
      // In device organizer: each building has exactly one apartment
      this.buildings = response.buildings.map((building, index) => {
        const buildingName = building.name || this.getRandomBuildingName(index);
        // Use building ID as seed to ensure unique data per building
        const buildingId = building.id || `building-${index}`;
        return {
          ...building,
          // Ensure we have proper fallback data
          name: buildingName,
          address: building.address || this.getRandomAddress(index),
          // Generate apartment address and tenant name for the single apartment using building ID as seed
          apartmentAddress: this.getRandomApartmentAddress(buildingId, buildingName),
          tenantName: this.getRandomTenantName(buildingId)
        };
      });
      
      this.buildingTotalItems = this.buildings.length;
      this.buildingTotalPages = Math.ceil(this.buildings.length / this.itemsPerPage);
      this.currentBuildingPage = 1;
    } catch (error) {
      console.error('Error loading default buildings:', error);
      this.error = 'Failed to load default buildings';
    } finally {
      this.loading = false;
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

  getUnassignedPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentUnassignedPage - 2);
    const endPage = Math.min(this.unassignedTotalPages, this.currentUnassignedPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onGroupPageChange(page: number) {
    this.currentGroupPage = page;
    // Update displayed building groups with pagination
    if (this.originalBuildingGroups.length > 0) {
      const startIndex = (this.currentGroupPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.buildingGroups = this.originalBuildingGroups.slice(startIndex, endIndex);
    }
  }

  onBuildingPageChange(page: number) {
    this.currentBuildingPage = page;
    // Reload buildings for current group
    if (this.selectedGroupRow !== null) {
      const buildingGroup = this.buildingGroups[this.selectedGroupRow];
      this.loadBuildingsForGroup(buildingGroup.id);
    }
  }

  onUnassignedPageChange(page: number) {
    this.currentUnassignedPage = page;
    this.loadUnassignedDevices();
  }

  // Helper methods for generating random French building data
  getRandomBuildingName(index: number): string {
    const buildingNames = [
      'Résidence Vendôme',
      'Immeuble Champs-Élysées',
      'Résidence Montmartre',
      'Bâtiment Rivoli',
      'Résidence Opéra',
      'Immeuble Saint-Germain',
      'Résidence Bastille',
      'Bâtiment République',
      'Résidence Nation',
      'Immeuble Trocadéro',
      'Résidence Concorde',
      'Bâtiment Madeleine'
    ];
    return buildingNames[index % buildingNames.length];
  }

  getRandomAddress(index: number): string {
    const addresses = [
      '15 Place Vendôme, 75001 Paris',
      '42 Champs-Élysées, 75008 Paris',
      '8 Rue de Rivoli, 75004 Paris',
      '25 Place de l\'Opéra, 75009 Paris',
      '12 Boulevard Saint-Germain, 75005 Paris',
      '18 Place de la Bastille, 75011 Paris',
      '30 Place de la République, 75011 Paris',
      '5 Place de la Nation, 75012 Paris',
      '22 Place du Trocadéro, 75016 Paris',
      '10 Place de la Concorde, 75008 Paris',
      '7 Place de la Madeleine, 75008 Paris',
      '14 Rue de Montmartre, 75001 Paris'
    ];
    return addresses[index % addresses.length];
  }

  getRandomZipCode(index: number): string {
    const zipCodes = ['75001', '75008', '75004', '75009', '75005', '75011', '75012', '75016'];
    return zipCodes[index % zipCodes.length];
  }

  getRandomApartmentAddress(buildingId: string, buildingName?: string): string {
    const apartmentNumbers = ['101', '102', '103', '104', '105', '201', '202', '203', '204', '205', 
                             '301', '302', '303', '304', '305', '401', '402', '403', '404', '405',
                             '501', '502', '503', '504', '505', '601', '602', '603', '604', '605'];
    
    // Create a hash from building ID to get a consistent but unique index
    const hash = this.simpleHash(buildingId);
    const apartmentNumber = apartmentNumbers[Math.abs(hash) % apartmentNumbers.length];
    
    // Use the provided building name or generate a unique one
    const finalBuildingName = buildingName || this.getRandomBuildingName(Math.abs(hash) % 20);
    return `Apt ${apartmentNumber}, ${finalBuildingName}`;
  }

  getRandomTenantName(buildingId: string): string {
    const tenantNames = [
      'Dubois, Marie', 'Martin, Pierre', 'Laurent, Sophie', 'Moreau, Jean',
      'Petit, Isabelle', 'Bernard, François', 'Rousseau, Claire', 'Simon, Antoine',
      'Durand, Nathalie', 'Leroy, Philippe', 'Roux, Catherine', 'Blanc, Michel',
      'Moreau, Anne', 'Petit, Thomas', 'Bernard, Julie', 'Rousseau, Marc',
      'Simon, Valérie', 'Durand, David', 'Leroy, Sandrine', 'Roux, Fabien',
      'Blanc, Caroline', 'Dubois, Nicolas', 'Martin, Patricia', 'Laurent, Sébastien',
      'Moreau, Céline', 'Petit, Olivier', 'Bernard, Hélène', 'Rousseau, Guillaume',
      'Simon, Stéphanie', 'Durand, Laurent', 'Leroy, Véronique', 'Roux, Christophe'
    ];
    
    // Create a hash from building ID to get a consistent but unique index
    const hash = this.simpleHash(buildingId);
    return tenantNames[Math.abs(hash) % tenantNames.length];
  }

  // Simple hash function to generate consistent but unique values from building ID
  simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  // Math object for template
  Math = Math;

  showNotification(message: string) {
    console.log('Notification:', message);
  }

  // Search functionality
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
    // Reset to show all data with pagination
    this.resetToOriginalData();
  }

  resetToOriginalData() {
    // Reset pagination
    this.currentGroupPage = 1;
    this.currentBuildingPage = 1;
    this.currentUnassignedPage = 1;

    // Update pagination info
    this.buildingGroupTotalItems = this.originalBuildingGroups.length;
    this.buildingGroupTotalPages = Math.ceil(this.originalBuildingGroups.length / this.itemsPerPage);

    this.buildingTotalItems = this.originalBuildings.length;
    this.buildingTotalPages = Math.ceil(this.originalBuildings.length / this.itemsPerPage);

    this.unassignedTotalItems = this.originalUnassignedDevices.length;
    this.unassignedTotalPages = Math.ceil(this.originalUnassignedDevices.length / this.itemsPerPage);

    // Update displayed data with pagination
    const groupStartIndex = (this.currentGroupPage - 1) * this.itemsPerPage;
    const groupEndIndex = groupStartIndex + this.itemsPerPage;
    this.buildingGroups = this.originalBuildingGroups.slice(groupStartIndex, groupEndIndex);

    const buildingStartIndex = (this.currentBuildingPage - 1) * this.itemsPerPage;
    const buildingEndIndex = buildingStartIndex + this.itemsPerPage;
    this.buildings = this.originalBuildings.slice(buildingStartIndex, buildingEndIndex);

    const unassignedStartIndex = (this.currentUnassignedPage - 1) * this.itemsPerPage;
    const unassignedEndIndex = unassignedStartIndex + this.itemsPerPage;
    this.unassignedDevices = this.originalUnassignedDevices.slice(unassignedStartIndex, unassignedEndIndex);

    // Select first rows by default
    this.selectedGroupRow = this.originalBuildingGroups.length > 0 ? 0 : null;
    this.selectedBuildingRow = this.originalBuildings.length > 0 ? 0 : null;
    this.selectedUnassignedRow = this.originalUnassignedDevices.length > 0 ? 0 : null;
  }

  performSearch() {
    const searchTerm = this.searchData.keyword.toLowerCase().trim();
    const buildingGroupFilter = this.searchData.buildingGroup.toLowerCase().trim();
    const buildingFilter = this.searchData.building.toLowerCase().trim();
    const deviceNameFilter = this.searchData.deviceName.toLowerCase().trim();
    const cityFilter = this.searchData.city.toLowerCase().trim();
    const zipCodeFilter = this.searchData.zipCode.toLowerCase().trim();
    const tenantFilter = this.searchData.tenant.toLowerCase().trim();
    const tenantIdFilter = this.searchData.tenantId.toLowerCase().trim();

    // If no search criteria, show all data
    if (!searchTerm && !buildingGroupFilter && !buildingFilter && !deviceNameFilter && !cityFilter && !zipCodeFilter && !tenantFilter && !tenantIdFilter) {
      this.loadData();
      return;
    }

    // Filter building groups
    const filteredBuildingGroups = this.originalBuildingGroups.filter(group => {
      const matchesKeyword = !searchTerm || 
        group.name.toLowerCase().includes(searchTerm) ||
        group.description?.toLowerCase().includes(searchTerm) ||
        group.address.toLowerCase().includes(searchTerm);
      
      const matchesBuildingGroup = !buildingGroupFilter || 
        group.name.toLowerCase().includes(buildingGroupFilter);
      
      return matchesKeyword && matchesBuildingGroup;
    });

    // Filter buildings
    const filteredBuildings = this.originalBuildings.filter(building => {
      const matchesKeyword = !searchTerm || 
        building.name.toLowerCase().includes(searchTerm) ||
        building.address.toLowerCase().includes(searchTerm) ||
        building.apartmentAddress?.toLowerCase().includes(searchTerm) ||
        building.tenantName?.toLowerCase().includes(searchTerm);
      
      const matchesBuilding = !buildingFilter || 
        building.name.toLowerCase().includes(buildingFilter);
      
      const matchesCity = !cityFilter || 
        building.address.toLowerCase().includes(cityFilter);
      
      const matchesZipCode = !zipCodeFilter || 
        building.zip_code?.toLowerCase().includes(zipCodeFilter) ||
        building.address.toLowerCase().includes(zipCodeFilter);
      
      const matchesTenant = !tenantFilter || 
        building.tenantName?.toLowerCase().includes(tenantFilter);
      
      const matchesDeviceName = !deviceNameFilter || 
        building.name.toLowerCase().includes(deviceNameFilter);
      
      const matchesBuildingGroup = !buildingGroupFilter || 
        this.originalBuildingGroups.find(g => g.id === building.building_group_id)?.name.toLowerCase().includes(buildingGroupFilter);
      
      return matchesKeyword && matchesBuilding && matchesCity && matchesZipCode && matchesTenant && matchesDeviceName && matchesBuildingGroup;
    });

    // Filter unassigned devices
    const filteredUnassignedDevices = this.originalUnassignedDevices.filter(device => {
      const matchesKeyword = !searchTerm || 
        device.serial.toLowerCase().includes(searchTerm) ||
        device.lastDeviceName.toLowerCase().includes(searchTerm) ||
        device.lastAddress.toLowerCase().includes(searchTerm) ||
        device.lastApartment.toLowerCase().includes(searchTerm) ||
        device.lastTenant.toLowerCase().includes(searchTerm);
      
      const matchesDeviceName = !deviceNameFilter || 
        device.lastDeviceName.toLowerCase().includes(deviceNameFilter) ||
        device.serial.toLowerCase().includes(deviceNameFilter);
      
      const matchesTenant = !tenantFilter || 
        device.lastTenant.toLowerCase().includes(tenantFilter);
      
      const matchesTenantId = !tenantIdFilter || 
        device.id.toString().includes(tenantIdFilter);
      
      const matchesCity = !cityFilter || 
        device.lastAddress.toLowerCase().includes(cityFilter);
      
      const matchesZipCode = !zipCodeFilter || 
        device.lastAddress.toLowerCase().includes(zipCodeFilter);
      
      return matchesKeyword && matchesDeviceName && matchesTenant && matchesTenantId && matchesCity && matchesZipCode;
    });

    // Update pagination info
    this.buildingGroupTotalItems = filteredBuildingGroups.length;
    this.buildingGroupTotalPages = Math.ceil(filteredBuildingGroups.length / this.itemsPerPage);
    this.currentGroupPage = 1;

    this.buildingTotalItems = filteredBuildings.length;
    this.buildingTotalPages = Math.ceil(filteredBuildings.length / this.itemsPerPage);
    this.currentBuildingPage = 1;

    this.unassignedTotalItems = filteredUnassignedDevices.length;
    this.unassignedTotalPages = Math.ceil(filteredUnassignedDevices.length / this.itemsPerPage);
    this.currentUnassignedPage = 1;

    // Update displayed data with pagination
    const groupStartIndex = (this.currentGroupPage - 1) * this.itemsPerPage;
    const groupEndIndex = groupStartIndex + this.itemsPerPage;
    this.buildingGroups = filteredBuildingGroups.slice(groupStartIndex, groupEndIndex);

    const buildingStartIndex = (this.currentBuildingPage - 1) * this.itemsPerPage;
    const buildingEndIndex = buildingStartIndex + this.itemsPerPage;
    this.buildings = filteredBuildings.slice(buildingStartIndex, buildingEndIndex);

    const unassignedStartIndex = (this.currentUnassignedPage - 1) * this.itemsPerPage;
    const unassignedEndIndex = unassignedStartIndex + this.itemsPerPage;
    this.unassignedDevices = filteredUnassignedDevices.slice(unassignedStartIndex, unassignedEndIndex);

    // Select first rows by default
    this.selectedGroupRow = filteredBuildingGroups.length > 0 ? 0 : null;
    this.selectedBuildingRow = filteredBuildings.length > 0 ? 0 : null;
    this.selectedUnassignedRow = filteredUnassignedDevices.length > 0 ? 0 : null;

    // Show search results notification
    this.showNotification(`Search completed: ${filteredBuildingGroups.length} groups, ${filteredBuildings.length} buildings, ${filteredUnassignedDevices.length} unassigned devices found`);
  }
}