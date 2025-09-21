import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDataService, DailyConsumption, AlarmMessage } from '../../services/mock-data.service';

declare var Chart: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedRow: number | null = null;
  showOverview: boolean = true; // Toggle between overview and home content
  private chart: any;
  private chartCheckInterval: any;

  // Mock data properties
  alarms: AlarmMessage[] = [];
  consumptionData: DailyConsumption[] = [];
  deviceStatus: any[] = [];
  monthlyStats: any[] = [];
  loading = false;
  error: string | null = null;

  // Sort functionality
  sortByImportance: boolean = false;
  sortedAlarms: AlarmMessage[] = [];

  // View all alarms functionality
  showAllAlarms: boolean = false;
  allAlarms: AlarmMessage[] = [];
  pageSize: number = 10; // Default to 10 alarms
  
  // Hide alarm functionality
  hiddenAlarmIds: Set<string> = new Set();

  constructor(private mockDataService: MockDataService) {}

  async ngOnInit() {
    await this.loadData();
  }

  ngAfterViewInit() {
    // Initialize chart after view is ready
    setTimeout(() => {
      this.initializeChart();
    }, 100);
  }

  ngOnDestroy() {
    // Clean up chart when component is destroyed
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    if (this.chartCheckInterval) {
      clearInterval(this.chartCheckInterval);
    }
  }

  async loadData() {
    try {
      this.loading = true;
      this.error = null;

      // Load all data in parallel
      const [alarms, consumption, deviceStatus, monthlyStats] = await Promise.all([
        this.loadAlarms(),
        this.loadConsumptionData(),
        this.loadDeviceStatus(),
        this.loadMonthlyStats()
      ]);

      this.alarms = alarms;
      this.allAlarms = [...alarms]; // Store all alarms for "View all" functionality
      this.sortedAlarms = [...alarms]; // Initialize sorted alarms
      this.applySorting(); // Apply initial sorting
      this.consumptionData = consumption;
      this.deviceStatus = deviceStatus;
      this.monthlyStats = monthlyStats;

      // Re-initialize chart after data is loaded
      setTimeout(() => {
        this.initializeChart();
      }, 200);

    } catch (error) {
      console.error('Error loading data:', error);
      this.error = 'Failed to load dashboard data';
    } finally {
      this.loading = false;
    }
  }

  async loadAlarms(): Promise<AlarmMessage[]> {
    try {
      const response = await this.mockDataService.getAlarmMessages(1, 100); // Load more alarms for virtual scrolling
      return response.alarms;
    } catch (error) {
      console.error('Error loading alarms:', error);
      return [];
    }
  }

  async loadConsumptionData(): Promise<DailyConsumption[]> {
    try {
      return await this.mockDataService.getDailyConsumption();
    } catch (error) {
      console.error('Error loading consumption data:', error);
      return [];
    }
  }

  async loadDeviceStatus(): Promise<any[]> {
    // Mock device status data
    return Promise.resolve([
      { device: 'WT-001-001', status: 'Active', location: 'Building A' },
      { device: 'WT-002-001', status: 'Maintenance', location: 'Building B' },
      { device: 'WT-003-001', status: 'Active', location: 'Building C' },
      { device: 'WT-004-001', status: 'Inactive', location: 'Building D' }
    ]);
  }

  async loadMonthlyStats(): Promise<any[]> {
    // Mock monthly stats data
    return Promise.resolve([
      { month: 'January', consumption: 1200.5, alarms: 3 },
      { month: 'February', consumption: 1350.2, alarms: 5 },
      { month: 'March', consumption: 1180.8, alarms: 2 },
      { month: 'April', consumption: 1420.9, alarms: 4 },
      { month: 'May', consumption: 1280.3, alarms: 1 },
      { month: 'June', consumption: 1550.7, alarms: 6 }
    ]);
  }

  onRowClick(index: number) {
    this.selectedRow = this.selectedRow === index ? null : index;
  }

  showDetails(event: Event) {
    event.stopPropagation();
    this.showNotification('Details functionality would show alarm details');
  }

  hideAlarm(event: Event, alarmId: string) {
    event.stopPropagation();
    
    // Add alarm to hidden set
    this.hiddenAlarmIds.add(alarmId);
    
    // Show notification
    this.showNotification(`Alarm ${alarmId} has been hidden`);
    
    // Force change detection to update the display
    this.updateDisplay();
  }

  showHiddenAlarms() {
    // Clear all hidden alarms
    this.hiddenAlarmIds.clear();
    this.showNotification('All hidden alarms have been restored');
    this.updateDisplay();
  }

  private updateDisplay() {
    // Trigger change detection by updating a dummy property
    // This forces Angular to re-evaluate the template
    this.sortedAlarms = [...this.sortedAlarms];
  }

  toggleOverview() {
    this.showOverview = !this.showOverview;
  }

  // Sort functionality
  toggleSortByImportance() {
    this.sortByImportance = !this.sortByImportance;
    this.applySorting();
  }

  private applySorting() {
    const sourceAlarms = this.showAllAlarms ? this.allAlarms : this.alarms;
    
    if (this.sortByImportance) {
      // Sort by priority: high -> medium -> low, then by creation date
      const sorted = [...sourceAlarms].sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        const aPriority = priorityOrder[a.alarm_severity as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.alarm_severity as keyof typeof priorityOrder] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Higher priority first
        }
        
        // If same priority, sort by creation date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      if (this.showAllAlarms) {
        this.allAlarms = sorted;
      } else {
        this.sortedAlarms = sorted;
      }
    } else {
      // Default sort by creation date (newest first)
      const sorted = [...sourceAlarms].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      if (this.showAllAlarms) {
        this.allAlarms = sorted;
      } else {
        this.sortedAlarms = sorted;
      }
    }
  }

  getDisplayAlarms(): AlarmMessage[] {
    let alarmsToShow: AlarmMessage[];
    
    if (this.showAllAlarms) {
      alarmsToShow = this.allAlarms;
    } else {
      alarmsToShow = this.sortedAlarms.slice(0, this.pageSize);
    }
    
    // Filter out hidden alarms
    return alarmsToShow.filter(alarm => !this.hiddenAlarmIds.has(alarm.id));
  }

  // View all alarms functionality
  viewAllAlarms() {
    this.showAllAlarms = true;
    this.applySorting(); // Apply current sorting to all alarms
  }

  revertToLimitedView() {
    this.showAllAlarms = false;
  }

  // Chart methods
  private initializeChart() {
    // Check if Chart is available
    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded');
      // Retry after a short delay
      this.chartCheckInterval = setInterval(() => {
        if (typeof Chart !== 'undefined') {
          clearInterval(this.chartCheckInterval);
          this.initializeChart();
        }
      }, 100);
      return;
    }

    const canvas = document.getElementById('monthlyChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    const chartData = this.processMonthlyStatsForChart();
    console.log('Chart data:', chartData); // Debug log

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Monthly Water Consumption (m³)',
          data: chartData.data,
          borderColor: '#7b61ff',
          backgroundColor: 'rgba(123, 97, 255, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#7b61ff',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            title: {
              display: true,
              text: 'Consumption (m³)',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            ticks: {
              font: {
                size: 11
              }
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            title: {
              display: true,
              text: 'Month',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            ticks: {
              font: {
                size: 11
              }
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                size: 12,
                weight: 'bold'
              },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#7b61ff',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function(context: any) {
                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} m³`;
              }
            }
          }
        }
      }
    });
  }

  private processConsumptionDataForChart() {
    if (!this.consumptionData || this.consumptionData.length === 0) {
      return { data: [], labels: [] };
    }

    const labels = this.consumptionData.map(item => item.date);
    const data = this.consumptionData.map(item => item.consumption);

    return { data, labels };
  }

  private processMonthlyStatsForChart() {
    if (!this.monthlyStats || this.monthlyStats.length === 0) {
      // Generate sample data if no monthly stats available
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const sampleData = months.map((month, index) => {
        // Generate realistic consumption data with seasonal variation
        const baseConsumption = 45;
        const seasonalFactor = index >= 5 && index <= 7 ? 1.3 : // Summer months
                              index >= 11 || index <= 1 ? 0.8 : // Winter months
                              1.0; // Other months
        const randomVariation = 0.8 + Math.random() * 0.4; // ±20% variation
        return Math.round((baseConsumption * seasonalFactor * randomVariation) * 10) / 10;
      });
      return { data: sampleData, labels: months };
    }

    const labels = this.monthlyStats.map(item => item.month);
    const data = this.monthlyStats.map(item => item.consumption);

    return { data, labels };
  }

  // Utility methods
  showNotification(message: string) {
    console.log('Notification:', message);
    // You can implement a proper notification system here
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'resolved':
        return 'status-resolved';
      case 'acknowledged':
        return 'status-acknowledged';
      default:
        return 'status-unknown';
    }
  }

  getSeverityClass(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      case 'low':
        return 'severity-low';
      default:
        return 'severity-unknown';
    }
  }

  // Template helper methods
  getTenantName(alarm: any): string {
    return alarm.tenant || 'N/A';
  }

  getAlarmCount(type: string): number {
    if (type === 'major_leak') {
      return this.alarms.filter(alarm => 
        alarm.alarm_type_name?.toLowerCase().includes('major') || 
        alarm.alarm_type_name?.toLowerCase().includes('majeure') ||
        alarm.alarm_severity === 'high'
      ).length;
    }
    if (type === 'system') {
      return this.alarms.filter(alarm => 
        alarm.alarm_type_name?.toLowerCase().includes('system') ||
        alarm.alarm_type_name?.toLowerCase().includes('wifi') ||
        alarm.alarm_type_name?.toLowerCase().includes('power') ||
        alarm.alarm_type_name?.toLowerCase().includes('temperature')
      ).length;
    }
    return this.alarms.filter(alarm => alarm.alarm_type_name === type).length;
  }

  getTotalLeakageAlarms(): number {
    return this.alarms.filter(alarm => 
      alarm.alarm_type_name?.toLowerCase().includes('leak') || 
      alarm.alarm_type_name?.toLowerCase().includes('fuite') ||
      alarm.message?.toLowerCase().includes('leak') ||
      alarm.message?.toLowerCase().includes('fuite')
    ).length;
  }

  getEstimatedLoss(): number {
    const leakageAlarms = this.alarms.filter(alarm => 
      alarm.alarm_type_name?.toLowerCase().includes('leak') || 
      alarm.alarm_type_name?.toLowerCase().includes('fuite')
    );
    
    // Calculate based on alarm severity and duration
    let totalLoss = 0;
    leakageAlarms.forEach(alarm => {
      const created = new Date(alarm.created_at);
      const resolved = alarm.resolved_at ? new Date(alarm.resolved_at) : new Date();
      const durationHours = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);
      
      // Loss rate based on severity
      let lossRate = 0;
      switch (alarm.alarm_severity) {
        case 'high': lossRate = 2.5; break; // 2.5 m³/hour
        case 'medium': lossRate = 1.2; break; // 1.2 m³/hour
        case 'low': lossRate = 0.5; break; // 0.5 m³/hour
        default: lossRate = 1.0;
      }
      
      totalLoss += durationHours * lossRate;
    });
    
    return Math.round(totalLoss * 10) / 10; // Round to 1 decimal
  }

  getWaterSavings(): number {
    const resolvedAlarms = this.alarms.filter(alarm => 
      alarm.status === 'resolved' && 
      (alarm.alarm_type_name?.toLowerCase().includes('leak') || 
       alarm.alarm_type_name?.toLowerCase().includes('fuite'))
    );
    
    // Calculate potential savings from early detection
    let totalSavings = 0;
    resolvedAlarms.forEach(alarm => {
      const created = new Date(alarm.created_at);
      const resolved = new Date(alarm.resolved_at!);
      const responseTimeHours = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);
      
      // Savings based on quick response (prevented further loss)
      let savingsRate = 0;
      switch (alarm.alarm_severity) {
        case 'high': savingsRate = 5.0; break; // 5 m³/hour prevented
        case 'medium': savingsRate = 2.5; break; // 2.5 m³/hour prevented
        case 'low': savingsRate = 1.0; break; // 1 m³/hour prevented
        default: savingsRate = 2.0;
      }
      
      // More savings for faster response
      const responseMultiplier = responseTimeHours < 2 ? 1.5 : responseTimeHours < 6 ? 1.2 : 1.0;
      totalSavings += savingsRate * responseMultiplier;
    });
    
    return Math.round(totalSavings * 10) / 10; // Round to 1 decimal
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  getCurrentMonth(): string {
    return new Date().toLocaleString('default', { month: 'long' });
  }

  getCurrentYearConsumption(): number {
    return 8750; // Static mock data - won't change on mouse hover
  }

  getPreviousYearConsumption(): number {
    return 9200; // Static mock data - won't change on mouse hover
  }

  getYearlyConsumption(year: number): number {
    // Static mock data based on year - won't change on mouse hover
    const baseValues: { [key: number]: number } = {
      2021: 7800,
      2022: 8500,
      2023: 9200,
      2024: 8750
    };
    return baseValues[year] || 8000;
  }

  // Math object for template
  Math = Math;
}