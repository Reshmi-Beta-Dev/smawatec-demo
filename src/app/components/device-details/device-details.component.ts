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

  async loadData() {
    await Promise.all([
      this.loadBuildingGroups(),
      this.loadDevices(),
      this.loadUnassignedDevices()
    ]);
  }

  async loadBuildingGroups() {
    try {
      this.loading = true;
      const response = await this.mockDataService.getBuildingGroups(this.currentGroupPage, this.itemsPerPage);
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

  async loadBuildingsForGroup(buildingGroupId: string) {
    try {
      this.loading = true;
      const buildings = await this.mockDataService.getBuildingsByGroup(buildingGroupId);
      this.buildings = buildings;
      this.buildingTotalItems = buildings.length;
      this.buildingTotalPages = Math.ceil(buildings.length / this.itemsPerPage);
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
      // Mock unassigned devices with French context
      this.unassignedDevices = [
        { 
          id: 1, 
          serial: 'SM-UN-001', 
          lastDeviceName: 'Compteur Eau Ancien', 
          lastAddress: '15 Place Vendôme, 75001 Paris',
          lastApartment: 'Apt 101',
          lastTenant: 'Marie Dubois'
        },
        { 
          id: 2, 
          serial: 'SM-UN-002', 
          lastDeviceName: 'Compteur Eau Retiré', 
          lastAddress: '42 Champs-Élysées, 75008 Paris',
          lastApartment: 'Apt 205',
          lastTenant: 'Pierre Martin'
        }
      ];
    } catch (error) {
      console.error('Error loading unassigned devices:', error);
      this.error = 'Failed to load unassigned devices';
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

  onGroupPageChange(page: number) {
    this.currentGroupPage = page;
    this.loadBuildingGroups();
  }

  onBuildingPageChange(page: number) {
    this.currentBuildingPage = page;
    // Reload buildings for current group
    if (this.selectedGroupRow !== null) {
      const buildingGroup = this.buildingGroups[this.selectedGroupRow];
      this.loadBuildingsForGroup(buildingGroup.id);
    }
  }

  // Math object for template
  Math = Math;

  showNotification(message: string) {
    console.log('Notification:', message);
  }
}