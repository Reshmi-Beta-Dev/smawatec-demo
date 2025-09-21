import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService, DailyConsumption, BuildingGroup, Building, Apartment } from '../../services/mock-data.service';

declare var Chart: any;

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedBuildingGroupRow: number | null = null;
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
  periodFrom: string = '';
  periodTo: string = '';
  private chart: any;

  // Loading and error states
  loading = false;
  error: string | null = null;

  // Pagination properties for Building Groups
  currentGroupPage = 1;
  buildingGroupTotalPages = 1;
  buildingGroupTotalItems = 0;
  paginatedBuildingGroups: any[] = [];
  buildingGroups: any[] = [];

  // Pagination properties for Buildings
  currentBuildingPage = 1;
  buildingTotalPages = 1;
  buildingTotalItems = 0;
  paginatedBuildings: any[] = [];
  buildings: any[] = [];

  // Apartment grid properties
  apartmentGridData: any[] = [];
  selectedApartmentRow: number | null = null;
  apartmentCurrentPage = 1;
  apartmentTotalPages = 1;
  apartmentTotalItems = 0;

  // Data arrays
  apartments: any[] = [];
  tenants: any[] = [];

  // Pagination settings
  itemsPerPage = 8;

  // Consumption data and controls
  consumptionData: any[] = [];
  timePeriods: any[] = [];
  chartTypes: any[] = [];
  selectedTimePeriod = 'today';
  selectedChartType = 'hourly';
  
  // Time period navigation (UI only - excludes future_year for demo purposes)
  private timePeriodOrder = ['today', 'last_month', 'last_year', 'last_5_years'];
  private currentTimePeriodIndex = 0;
  selectedApartmentId: string | null = null;
  selectedBuildingId: string | null = null;
  selectedBuildingGroupName: string | null = null;

  constructor(private mockDataService: MockDataService) {}

  ngOnInit() {
    this.loadTimePeriods();
    this.loadChartTypes();
    this.loadData();
  }

  async loadData() {
    // Load building groups first
    await this.loadBuildingGroups();
    
    // Set default selections after building groups are loaded
    await this.setDefaultSelections();
    
    // Load other data in parallel
    await Promise.all([
      this.loadTenants(),
      this.loadConsumptionData()
    ]);
    
    // No default apartment selection - let user choose
    
    // Initialize chart after all data is loaded
    setTimeout(() => {
      this.initializeChart();
    }, 100);
  }

  async setDefaultSelections() {
    // Select first building group by default
    if (this.paginatedBuildingGroups.length > 0) {
      this.selectedBuildingGroupRow = 0;
      // Load buildings for the first group
      const firstGroup = this.paginatedBuildingGroups[0];
      await this.loadBuildingsForGroup(firstGroup.id);
    }
  }

  ngAfterViewInit() {
    // Test Chart.js availability
    console.log('🔍 Testing Chart.js availability...');
    console.log('Chart object:', typeof Chart);
    console.log('Chart constructor:', Chart);
    
    // Initialize chart after view is ready and data is loaded
    setTimeout(() => {
      this.initializeChart();
    }, 500);
  }

  ngOnDestroy() {
    // Clean up chart when component is destroyed
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
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

  async onBuildingGroupRowClick(index: number) {
    // Always select the clicked row (no unselect for building groups)
    this.selectedBuildingGroupRow = index;
    this.selectedBuildingRow = null;
    this.selectedApartmentRow = null;
    
    const buildingGroup = this.paginatedBuildingGroups[index];
    this.selectedBuildingGroupName = buildingGroup.name || null;
    this.selectedBuildingId = null;
    this.selectedApartmentId = null;
    // Load buildings for this group
    await this.loadBuildingsForGroup(buildingGroup.id);
    this.loadConsumptionData();
  }

  onBuildingGroupPageChange(page: number) {
    this.currentGroupPage = page;
    this.loadBuildingGroups();
  }

  getBuildingGroupPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentGroupPage - 2);
    const endPage = Math.min(this.buildingGroupTotalPages, this.currentGroupPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
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

  async onBuildingRowClick(index: number) {
    // Toggle selection - unselect if clicking the same row
    if (this.selectedBuildingRow === index) {
      this.selectedBuildingRow = null;
      this.selectedBuildingId = null;
      this.selectedApartmentId = null;
      this.selectedApartmentRow = null;
      // Load all apartments from the selected building group
      await this.loadAllApartmentsForBuildingGroup();
      this.loadConsumptionData();
      return;
    }
    
    // Select the clicked row
    this.selectedBuildingRow = index;
    this.selectedApartmentRow = null;
    
    const building = this.paginatedBuildings[index];
    this.selectedBuildingId = building.id?.toString() || null;
    this.selectedApartmentId = null;
    // Load apartments for this building
    await this.loadApartmentsForBuilding(building.id?.toString() || '');
    // Load apartment grid data based on building
    await this.loadApartmentGridData(building);
    this.loadConsumptionData();
  }

  onBuildingPageChange(page: number) {
    this.currentBuildingPage = page;
    this.loadBuildings();
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
      
      // Load all apartments for the building group when no building is selected
      await this.loadAllApartmentsForBuildingGroup();
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
      this.error = 'Failed to load apartments for building';
    } finally {
      this.loading = false;
    }
  }

  // Load all apartments for the selected building group
  async loadAllApartmentsForBuildingGroup() {
    try {
      this.loading = true;
      if (this.selectedBuildingGroupName) {
        // Get all buildings in the selected group
        const allBuildings = await this.mockDataService.getBuildingsByGroup(
          this.paginatedBuildingGroups[this.selectedBuildingGroupRow!].id
        );
        
        // Load apartments from all buildings in the group
        const allApartments = [];
        for (const building of allBuildings) {
          const apartments = await this.mockDataService.getApartmentsByBuilding(building.id);
          allApartments.push(...apartments);
        }
        
        // Generate apartment grid data for all apartments
        const apartmentGridData: any[] = [];
        allApartments.forEach((apartment, index) => {
          apartmentGridData.push({
            id: apartment.id,
            apartment: `Apt ${String(index + 1).padStart(3, '0')}`,
            tenant: apartment.tenant_name || 'Unknown Tenant',
            type: apartment.type || 'Standard',
            building: apartment.building_name || 'Unknown Building'
          });
        });
        
        this.apartmentGridData = apartmentGridData;
        this.apartmentTotalItems = apartmentGridData.length;
        this.apartmentTotalPages = Math.ceil(apartmentGridData.length / this.itemsPerPage);
        this.apartmentCurrentPage = 1;
        
        // Get paginated data
        const startIndex = (this.apartmentCurrentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.apartmentGridData = apartmentGridData.slice(startIndex, endIndex);
      }
    } catch (error) {
      console.error('Error loading all apartments for building group:', error);
      this.error = 'Failed to load apartments for building group';
    } finally {
      this.loading = false;
    }
  }

  // Load tenants
  async loadTenants() {
    try {
      this.loading = true;
      const tenants = await this.mockDataService.getTenants();
      this.tenants = tenants;
    } catch (error) {
      console.error('Error loading tenants:', error);
      this.error = 'Failed to load tenants';
    } finally {
      this.loading = false;
    }
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
      'Ms. Catherine Deneuve', 'Mr. Jean Reno', 'Ms. Isabelle Adjani', 'Mr. Alain Delon',
      'Ms. Juliette Binoche', 'Mr. Gérard Philipe', 'Ms. Marion Cotillard', 'Mr. Jean Gabin',
      'Ms. Audrey Tautou', 'Mr. Louis de Funès', 'Ms. Emmanuelle Béart', 'Mr. Yves Montand',
      'Ms. Fanny Ardant', 'Mr. Michel Piccoli', 'Ms. Sandrine Bonnaire', 'Mr. Daniel Auteuil',
      'Ms. Isabelle Huppert', 'Mr. Philippe Noiret', 'Ms. Anouk Aimée', 'Mr. Jean-Paul Belmondo',
      'Ms. Romy Schneider', 'Mr. Alain Resnais', 'Ms. Jeanne Moreau', 'Mr. Michel Simon',
      'Ms. Arletty', 'Mr. Fernandel', 'Ms. Michèle Morgan', 'Mr. Bourvil',
      'Ms. Danielle Darrieux', 'Mr. Maurice Chevalier', 'Ms. Simone Signoret', 'Mr. Pierre Brasseur',
      'Ms. Madeleine Renaud', 'Mr. Jean Marais', 'Ms. Edwige Feuillère', 'Mr. Michel Auclair',
      'Ms. Françoise Arnoul', 'Mr. Gérard Oury', 'Ms. Mylène Demongeot', 'Mr. Eddie Constantine',
      'Ms. Dany Robin', 'Mr. Robert Lamoureux', 'Ms. Marina Vlady', 'Mr. Jean-Claude Brialy',
      'Ms. Annette Stroyberg', 'Mr. Jacques Charrier', 'Ms. Pascale Petit', 'Mr. Jean-Pierre Cassel',
      'Ms. Françoise Dorléac', 'Mr. Jean-Louis Trintignant', 'Ms. Stéphane Audran', 'Mr. Michel Bouquet',
      'Ms. Bulle Ogier', 'Mr. Jean-Pierre Léaud', 'Ms. Bernadette Lafont', 'Mr. Claude Rich',
      'Ms. Anna Karina', 'Mr. Jean-Claude Van Damme', 'Ms. Béatrice Dalle', 'Mr. Vincent Cassel',
      'Ms. Sophie Marceau', 'Mr. Gérard Depardieu', 'Ms. Isabelle Adjani', 'Mr. Alain Delon',
      'Ms. Catherine Deneuve', 'Mr. Jean Reno', 'Ms. Juliette Binoche', 'Mr. Gérard Philipe',
      'Ms. Marion Cotillard', 'Mr. Jean Gabin', 'Ms. Audrey Tautou', 'Mr. Louis de Funès',
      'Ms. Emmanuelle Béart', 'Mr. Yves Montand', 'Ms. Fanny Ardant', 'Mr. Michel Piccoli',
      'Ms. Sandrine Bonnaire', 'Mr. Daniel Auteuil', 'Ms. Isabelle Huppert', 'Mr. Philippe Noiret',
      'Ms. Anouk Aimée', 'Mr. Jean-Paul Belmondo', 'Ms. Romy Schneider', 'Mr. Alain Resnais',
      'Ms. Jeanne Moreau', 'Mr. Michel Simon', 'Ms. Arletty', 'Mr. Fernandel',
      'Ms. Michèle Morgan', 'Mr. Bourvil', 'Ms. Danielle Darrieux', 'Mr. Maurice Chevalier',
      'Ms. Simone Signoret', 'Mr. Pierre Brasseur', 'Ms. Madeleine Renaud', 'Mr. Jean Marais',
      'Ms. Edwige Feuillère', 'Mr. Michel Auclair', 'Ms. Françoise Arnoul', 'Mr. Gérard Oury',
      'Ms. Mylène Demongeot', 'Mr. Eddie Constantine', 'Ms. Dany Robin', 'Mr. Robert Lamoureux',
      'Ms. Marina Vlady', 'Mr. Jean-Claude Brialy', 'Ms. Annette Stroyberg', 'Mr. Jacques Charrier',
      'Ms. Pascale Petit', 'Mr. Jean-Pierre Cassel', 'Ms. Françoise Dorléac', 'Mr. Jean-Louis Trintignant',
      'Ms. Stéphane Audran', 'Mr. Michel Bouquet', 'Ms. Bulle Ogier', 'Mr. Jean-Pierre Léaud',
      'Ms. Bernadette Lafont', 'Mr. Claude Rich', 'Ms. Anna Karina', 'Mr. Jean-Claude Van Damme',
      'Ms. Béatrice Dalle', 'Mr. Vincent Cassel', 'Ms. Sophie Marceau', 'Mr. Gérard Depardieu'
    ];
    
    const apartmentTypes = [
      'Studio', '1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4 Bedrooms', '5 Bedrooms',
      'Penthouse', 'Duplex', 'Loft', 'Garden Apartment', 'Terrace Apartment', 'Balcony Apartment',
      'Corner Apartment', 'Top Floor', 'Ground Floor', 'Mezzanine', 'Attic', 'Basement',
      'Modern Apartment', 'Classic Apartment', 'Contemporary', 'Traditional', 'Luxury', 'Standard',
      'Executive', 'Family', 'Couple', 'Single', 'Student', 'Senior', 'Pet Friendly',
      'Furnished', 'Unfurnished', 'Semi-Furnished', 'Fully Equipped', 'Minimalist', 'Rustic',
      'Art Deco', 'Bauhaus', 'Victorian', 'Edwardian', 'Georgian', 'Regency', 'Colonial',
      'Mediterranean', 'Scandinavian', 'Japanese', 'Industrial', 'Bohemian', 'Eclectic',
      'Mid-Century', 'Post-Modern', 'Neo-Classical', 'Baroque', 'Rococo', 'Gothic',
      'Renaissance', 'Byzantine', 'Romanesque', 'Gothic Revival', 'Queen Anne', 'Tudor',
      'Craftsman', 'Prairie', 'Mission', 'Spanish Colonial', 'French Colonial', 'Dutch Colonial',
      'Federal', 'Greek Revival', 'Italianate', 'Second Empire', 'Stick', 'Shingle',
      'Beaux-Arts', 'Art Nouveau', 'Arts and Crafts', 'Prairie School', 'International Style',
      'Brutalist', 'Postmodern', 'Deconstructivist', 'High-Tech', 'Sustainable', 'Green',
      'Smart Home', 'Connected', 'Automated', 'Digital', 'Eco-Friendly', 'Energy Efficient',
      'Solar Powered', 'Geothermal', 'Rainwater Harvesting', 'Green Roof', 'Living Wall'
    ];
    
    for (let i = 0; i < count; i++) {
      // Use seeded random for consistent data per building
      const random = this.seededRandom(seed + i);
      const tenantIndex = Math.floor(random() * tenantNames.length);
      const typeIndex = Math.floor(random() * apartmentTypes.length);
      
      apartments.push({
        id: `apt-${String(i + 1).padStart(3, '0')}`,
        apartment: `Apt ${String(i + 1).padStart(3, '0')}`,
        tenant: tenantNames[tenantIndex],
        type: apartmentTypes[typeIndex],
        building: buildingName
      });
    }
    
    return apartments;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private seededRandom(seed: number) {
    let x = Math.sin(seed) * 10000;
    return () => {
      x = Math.sin(x) * 10000;
      return x - Math.floor(x);
    };
  }

  onApartmentRowClick(index: number) {
    // Toggle selection - unselect if clicking the same row
    if (this.selectedApartmentRow === index) {
      this.selectedApartmentRow = null;
      this.selectedApartmentId = null;
      this.loadConsumptionData();
      return;
    }
    
    // Select the clicked row
    this.selectedApartmentRow = index;
    
    const apartment = this.apartmentGridData[index];
    this.selectedApartmentId = apartment.id || null;
    this.loadConsumptionData();
  }

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

  // Consumption methods
  async loadTimePeriods() {
    this.timePeriods = await this.mockDataService.getTimePeriods();
  }

  async loadChartTypes() {
    this.chartTypes = await this.mockDataService.getChartTypes();
  }

  async loadConsumptionData() {
    try {
      console.log('🔄 Loading consumption data...', {
        apartment: this.selectedApartmentId,
        building: this.selectedBuildingId,
        group: this.selectedBuildingGroupName,
        period: this.selectedTimePeriod,
        chart: this.selectedChartType
      });

      let data: any[] = [];

      if (this.selectedApartmentId) {
        // Show apartment consumption
        data = await this.mockDataService.getConsumptionByApartment(
          this.selectedTimePeriod,
          this.selectedApartmentId,
          this.selectedChartType
        );
        console.log('✅ Apartment consumption loaded:', data.length, 'records');
      } else if (this.selectedBuildingId) {
        // Show building consumption (sum of all apartments in building)
        data = await this.mockDataService.getConsumptionByBuilding(
          this.selectedTimePeriod,
          this.selectedBuildingId,
          this.selectedChartType
        );
        console.log('✅ Building consumption loaded:', data.length, 'records');
      } else if (this.selectedBuildingGroupName) {
        // Show building group consumption (sum of all buildings in group)
        data = await this.mockDataService.getConsumptionByBuildingGroup(
          this.selectedTimePeriod,
          this.selectedBuildingGroupName,
          this.selectedChartType
        );
        console.log('✅ Building group consumption loaded:', data.length, 'records');
      } else {
        // Show all building groups consumption
        data = await this.mockDataService.getConsumptionByBuildingGroup(
          this.selectedTimePeriod,
          '',
          this.selectedChartType
        );
        console.log('✅ All building groups consumption loaded:', data.length, 'records');
      }

      this.consumptionData = data;
      this.updateChart();
    } catch (error: any) {
      console.error('❌ Error loading consumption data:', error);
      this.error = `Failed to load consumption data: ${error.message}`;
    }
  }

  onTimePeriodChange() {
    // Update the current index when dropdown changes
    this.currentTimePeriodIndex = this.timePeriodOrder.indexOf(this.selectedTimePeriod);
    console.log('🔄 Time period changed to:', this.selectedTimePeriod);
    this.loadConsumptionData();
  }

  onChartTypeChange() {
    this.loadConsumptionData();
  }

  // Chart methods
  private initializeChart() {
    console.log('🔄 Initializing chart...');
    
    // Check if Chart is available
    if (typeof Chart === 'undefined') {
      console.error('❌ Chart.js is not loaded');
      return;
    }
    console.log('✅ Chart.js is available');

    const canvas = document.getElementById('waterChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('❌ Canvas element not found');
      return;
    }
    console.log('✅ Canvas element found');
    
    // Check if canvas is visible
    const canvasStyle = window.getComputedStyle(canvas);
    if (canvasStyle.display === 'none' || canvasStyle.visibility === 'hidden') {
      console.error('❌ Canvas element is not visible, retrying in 500ms...');
    setTimeout(() => {
      this.initializeChart();
      }, 500);
      return;
    }
    console.log('✅ Canvas element is visible');

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    try {
      // Test with minimal chart first
      console.log('🧪 Creating test chart...');
      this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Test 1', 'Test 2', 'Test 3'],
      datasets: [{
          label: 'Water Consumption (m³)',
          data: [1, 2, 3],
          backgroundColor: 'rgba(123, 97, 255, 0.8)',
          borderColor: '#7b61ff',
          borderWidth: 2,
          borderRadius: 6,
        borderSkipped: false,
          hoverBackgroundColor: 'rgba(123, 97, 255, 1)',
          hoverBorderColor: '#5a4fcf',
          hoverBorderWidth: 2
        }]
      },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        layout: {
          padding: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10
            }
          },
          scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Consumption (m³)',
              font: {
                size: 12,
                weight: 'bold'
              },
              color: '#374151'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            },
            ticks: {
              font: {
                size: 11
              },
              color: '#6b7280'
            }
          },
          x: {
            title: {
              display: true,
              text: this.getTimeAxisLabel(),
              font: {
                size: 12,
                weight: 'bold'
              },
              color: '#374151'
            },
              grid: {
                display: false
              },
              ticks: {
                font: {
                  size: 11
              },
              color: '#6b7280'
            }
          }
        },
        plugins: {
          title: {
            display: false
          },
          legend: {
            display: true,
            position: 'top',
            align: 'start',
            labels: {
              usePointStyle: true,
              pointStyle: 'rect',
                font: {
                size: 11,
                weight: '600'
              },
              color: '#374151',
              padding: 15
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: '#7b61ff',
            borderWidth: 1,
            cornerRadius: 6,
            displayColors: true,
            titleFont: {
              size: 12,
              weight: 'bold'
            },
            bodyFont: {
              size: 11
            }
            }
          }
        }
      });
      console.log('✅ Chart created successfully');
      
      // Load consumption data after chart is created
      this.loadConsumptionData();
    } catch (error) {
      console.error('❌ Error creating chart:', error);
      return;
    }
  }

  private updateChart() {
    if (!this.chart) {
      console.log('❌ Chart not initialized, cannot update');
      return;
    }

    console.log('🔄 Updating chart with data:', this.consumptionData.length, 'records');
    console.log('📊 Consumption data:', this.consumptionData);
    
    const labels = this.consumptionData.map(item => item.time_label);
    const data = this.consumptionData.map(item => item.consumption_m3);
    
    console.log('🏷️ Labels:', labels);
    console.log('📈 Data values:', data);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
    this.chart.data.datasets[0].label = this.getChartLabel();
    this.chart.options.scales.x.title.text = this.getTimeAxisLabel();
    this.chart.update();
    
    console.log('✅ Chart updated successfully');
    console.log('📊 Final chart data:', this.chart.data);
  }

  getTimeAxisLabel(): string {
    switch (this.selectedTimePeriod) {
      case 'today': return 'Hour';
      case 'last_month': return 'Day';
      case 'last_year': return 'Month';
      case 'last_5_years': return 'Year';
      case 'future_year': return 'Month (Future)';
      default: return 'Time';
    }
  }

  getChartLabel(): string {
    if (this.selectedApartmentId) {
      const apartment = this.apartmentGridData.find(a => a.id === this.selectedApartmentId);
      return `Apartment: ${apartment?.apartment || this.selectedApartmentId} (${apartment?.tenant || 'Unknown Tenant'})`;
    } else if (this.selectedBuildingId) {
      const building = this.paginatedBuildings.find(b => b.id === this.selectedBuildingId);
      return `Building: ${building?.name || this.selectedBuildingId}`;
    } else if (this.selectedBuildingGroupName) {
      return `Building Group: ${this.selectedBuildingGroupName}`;
    } else {
      return 'All Building Groups Consumption';
    }
  }

  // Utility methods
  showNotification(message: string) {
    console.log('Notification:', message);
    // You can implement a proper notification system here
  }

  // Math object for template
  Math = Math;

  // Time period navigation methods
  async previousPeriod() {
    if (this.currentTimePeriodIndex > 0) {
      this.currentTimePeriodIndex--;
      this.selectedTimePeriod = this.timePeriodOrder[this.currentTimePeriodIndex];
      console.log('🔄 Previous period:', this.selectedTimePeriod);
      await this.loadConsumptionData();
    } else {
      console.log('⚠️ Already at first time period');
    }
  }
    
  async nextPeriod() {
    if (this.currentTimePeriodIndex < this.timePeriodOrder.length - 1) {
      this.currentTimePeriodIndex++;
      this.selectedTimePeriod = this.timePeriodOrder[this.currentTimePeriodIndex];
      console.log('🔄 Next period:', this.selectedTimePeriod);
      await this.loadConsumptionData();
    } else {
      console.log('⚠️ Already at last time period');
    }
  }

  resetPeriod() {
    this.periodFrom = '';
    this.periodTo = '';
    this.showNotification('Period has been reset to default');
  }

  // Navigation button states
  isPreviousPeriodDisabled(): boolean {
    return this.currentTimePeriodIndex <= 0;
  }

  isNextPeriodDisabled(): boolean {
    return this.currentTimePeriodIndex >= this.timePeriodOrder.length - 1;
  }

  // Get dynamic chart title based on current time period
  getChartTitle(): string {
    const periodNames = {
      'today': 'Today\'s Device Consumption',
      'last_month': 'Last Month\'s Device Consumption',
      'last_year': 'Last Year\'s Device Consumption',
      'last_5_years': 'Last 5 Years\' Device Consumption'
    };
    return periodNames[this.selectedTimePeriod as keyof typeof periodNames] || 'Device Consumption';
  }

  exportPDF() {
    this.showNotification('PDF export functionality would generate a PDF report');
  }

  exportXLS() {
    this.showNotification('Excel export functionality would generate an Excel file');
  }
}