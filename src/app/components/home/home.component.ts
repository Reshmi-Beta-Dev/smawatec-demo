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
      this.sortedAlarms = [...alarms]; // Initialize sorted alarms
      this.applySorting(); // Apply initial sorting
      this.consumptionData = consumption;
      this.deviceStatus = deviceStatus;
      this.monthlyStats = monthlyStats;

    } catch (error) {
      console.error('Error loading data:', error);
      this.error = 'Failed to load dashboard data';
    } finally {
      this.loading = false;
    }
  }

  async loadAlarms(): Promise<AlarmMessage[]> {
    try {
      const response = await this.mockDataService.getAlarmMessages(1, 15);
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

  hideAlarm(event: Event) {
    event.stopPropagation();
    this.showNotification('Hide alarm functionality would hide this alarm');
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
    if (this.sortByImportance) {
      // Sort by priority: high -> medium -> low, then by creation date
      this.sortedAlarms = [...this.alarms].sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        const aPriority = priorityOrder[a.alarm_severity as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.alarm_severity as keyof typeof priorityOrder] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Higher priority first
        }
        
        // If same priority, sort by creation date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else {
      // Default sort by creation date (newest first)
      this.sortedAlarms = [...this.alarms].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  }

  getDisplayAlarms(): AlarmMessage[] {
    return this.sortedAlarms;
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

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Monthly Water Consumption (m³)',
          data: chartData.data,
          borderColor: '#7b61ff',
          backgroundColor: 'rgba(123, 97, 255, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Consumption (m³)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Month'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
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
      return { data: [], labels: [] };
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
    return this.alarms.filter(alarm => alarm.alarm_type_name === type).length;
  }

  getTotalLeakageAlarms(): number {
    return this.alarms.filter(alarm => 
      alarm.alarm_type_name?.includes('leak') || alarm.alarm_type_name?.includes('Leak')
    ).length;
  }

  getEstimatedLoss(): number {
    return Math.floor(Math.random() * 100) + 50; // Mock data
  }

  getWaterSavings(): number {
    return Math.floor(Math.random() * 200) + 100; // Mock data
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  getCurrentMonth(): string {
    return new Date().toLocaleString('default', { month: 'long' });
  }

  getCurrentYearConsumption(): number {
    return Math.floor(Math.random() * 10000) + 5000; // Mock data
  }

  getPreviousYearConsumption(): number {
    return Math.floor(Math.random() * 10000) + 5000; // Mock data
  }

  getYearlyConsumption(year: number): number {
    return Math.floor(Math.random() * 10000) + 5000; // Mock data
  }

  // Math object for template
  Math = Math;
}