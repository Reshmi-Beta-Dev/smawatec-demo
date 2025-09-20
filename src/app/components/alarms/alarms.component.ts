import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseAlarmsService, AlarmCategories } from '../../services/supabase-alarms.service';

@Component({
  selector: 'app-alarms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alarms.component.html',
  styleUrls: ['./alarms.component.css']
})
export class AlarmsComponent implements OnInit {
  selectedRow: number | null = null;
  alarmCategories: AlarmCategories | null = null;
  loading = false;
  error: string | null = null;
  
  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  paginatedAlarms: any[] = [];
  allAlarms: any[] = [];
  
  // Expose Math object to template
  Math = Math;

  constructor(private supabaseAlarmsService: SupabaseAlarmsService) {}

  async ngOnInit() {
    await Promise.all([
      this.loadAlarmCategories(),
      this.loadAlarms()
    ]);
  }

  async loadAlarmCategories() {
    this.loading = true;
    this.error = null;
    
    try {
      this.alarmCategories = await this.supabaseAlarmsService.getAlarmCategories();
      console.log('✅ Alarm categories loaded:', this.alarmCategories);
    } catch (error: any) {
      console.error('❌ Error loading alarm categories:', error);
      this.error = `Failed to load alarm categories: ${error.message}`;
    } finally {
      this.loading = false;
    }
  }

  async loadAlarms() {
    try {
      this.allAlarms = await this.supabaseAlarmsService.getAlarmsMessageBoard();
      this.totalItems = this.allAlarms.length;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      this.updatePaginatedAlarms();
      console.log('✅ Alarms loaded:', this.allAlarms.length, 'total items');
    } catch (error: any) {
      console.error('❌ Error loading alarms:', error);
      this.error = `Failed to load alarms: ${error.message}`;
    }
  }

  updatePaginatedAlarms() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedAlarms = this.allAlarms.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedAlarms();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onRowClick(index: number) {
    this.selectedRow = this.selectedRow === index ? null : index;
  }

  showDetails(event: Event) {
    event.stopPropagation();
    this.showNotification('Opening alarm details...');
  }

  hideAlarm(event: Event) {
    event.stopPropagation();
    this.showNotification('Alarm has been hidden');
    
    // Add visual feedback
    const row = (event.target as HTMLElement).closest('tr');
    if (row) {
      (row as HTMLElement).style.opacity = '0.5';
      (row as HTMLElement).style.textDecoration = 'line-through';
    }
  }

  unhideAllAlarms() {
    this.showNotification('Showing all hidden alarms');
    
    // Restore all hidden alarms
    const hiddenRows = document.querySelectorAll('.message-table tbody tr');
    hiddenRows.forEach(row => {
      (row as HTMLElement).style.opacity = '1';
      (row as HTMLElement).style.textDecoration = 'none';
    });
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
