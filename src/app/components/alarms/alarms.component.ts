import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService, Alarm } from '../../services/supabase.service';

@Component({
  selector: 'app-alarms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alarms.component.html',
  styleUrls: ['./alarms.component.css']
})
export class AlarmsComponent implements OnInit {
  selectedRow: number | null = null;
  
  // Supabase data properties
  alarms: Alarm[] = [];
  loading = false;
  error: string | null = null;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadAlarms();
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

  private async loadAlarms() {
    this.loading = true;
    this.error = null;

    try {
      this.alarms = await this.supabaseService.getAlarms();
      console.log('Alarms loaded successfully:', this.alarms.length);
    } catch (error) {
      console.error('Error loading alarms:', error);
      this.error = 'Failed to load alarms from server';
    } finally {
      this.loading = false;
    }
  }

  getTenantName(alarm: Alarm): string {
    return alarm.devices?.apartments?.tenants?.first_name + ' ' + alarm.devices?.apartments?.tenants?.last_name || 'N/A';
  }

  getAlarmCount(type: string): number {
    return this.alarms.filter(alarm => alarm.alarm_type === type).length;
  }

  getTotalLeakageAlarms(): number {
    return this.alarms.filter(alarm => 
      alarm.alarm_type === 'major_leak' || 
      alarm.alarm_type === 'medium_leak' || 
      alarm.alarm_type === 'micro_leak'
    ).length;
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
