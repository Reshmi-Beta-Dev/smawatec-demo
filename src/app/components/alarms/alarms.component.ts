import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-alarms',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './alarms.component.html',
  styleUrls: ['./alarms.component.css']
})
export class AlarmsComponent implements OnInit {
  selectedRow: number | null = null;

  // Table data for Material Design table
  displayedColumns: string[] = ['id', 'building', 'address', 'apartment', 'tenant', 'alarm', 'message', 'action', 'actions'];
  alarmData = [
    {
      id: 1,
      building: 'PAR - B12012',
      address: 'Paris, Champs Elysees, Rue de la P',
      apartment: 'Block 1,L23, Apt 12',
      tenant: 'Duvall',
      alarm: { type: 'Major Leak', severity: 'major' },
      message: 'poss. Pipe break',
      action: 'auto shut off'
    },
    {
      id: 2,
      building: 'PAR - B12012',
      address: 'Paris, Champs Elysees, Rue de la P',
      apartment: 'Block 1,L23, Apt 12',
      tenant: 'Duvall',
      alarm: { type: 'Low Temp.', severity: 'low-temp' },
      message: 'Ice warming',
      action: 'None'
    },
    {
      id: 3,
      building: 'PAR - B12012',
      address: 'Paris, Champs Elysees, Rue de la P',
      apartment: 'Block 1,L23, Apt 12',
      tenant: 'Duvall',
      alarm: { type: 'Medium Leak', severity: 'medium' },
      message: 'poss. Tap / Toilet',
      action: 'None'
    },
    {
      id: 4,
      building: 'PAR - B12012',
      address: 'Paris, Champs Elysees, Rue de la P',
      apartment: 'Block 1,L23, Apt 12',
      tenant: 'Duvall',
      alarm: { type: 'Micro Leak', severity: 'micro' },
      message: 'poss. Toilet',
      action: 'None'
    },
    {
      id: 5,
      building: 'PAR - B12012',
      address: 'Paris, Champs Elysees, Rue de la P',
      apartment: 'Block 1,L23, Apt 12',
      tenant: 'Duvall',
      alarm: { type: 'Micro Leak', severity: 'micro' },
      message: 'poss. Toilet',
      action: 'None'
    },
    {
      id: 6,
      building: 'PAR - B12012',
      address: 'Paris, Champs Elysees, Rue de la P',
      apartment: 'Block 1,L23, Apt 12',
      tenant: 'Duvall',
      alarm: { type: 'Micro Leak', severity: 'micro' },
      message: 'poss. Tap',
      action: 'None'
    },
    {
      id: 7,
      building: 'PAR - B12012',
      address: 'Paris, Champs Elysees, Rue de la P',
      apartment: 'Block 1,L23, Apt 12',
      tenant: 'Duvall',
      alarm: { type: 'Micro Leak', severity: 'micro' },
      message: 'poss. Tap',
      action: 'None'
    },
    {
      id: 8,
      building: 'PAR - B12012',
      address: 'Paris, Champs Elysees, Rue de la P',
      apartment: 'Block 1,L23, Apt 12',
      tenant: 'Duvall',
      alarm: { type: 'Micro Leak', severity: 'micro' },
      message: 'poss. Tap',
      action: 'None'
    },
    {
      id: 9,
      building: 'PAR - B12012',
      address: 'Paris, Champs Elysees, Rue de la P',
      apartment: 'Block 1,L23, Apt 12',
      tenant: 'Duvall',
      alarm: { type: 'Micro Lea.', severity: 'micro' },
      message: 'poss. Toilet',
      action: 'None'
    },
    {
      id: 10,
      building: 'PAR - B12012',
      address: 'Paris, Champs Elysees, Rue de la P',
      apartment: 'Block 1,L23, Apt 12',
      tenant: 'Duvall',
      alarm: { type: 'Micro Leak', severity: 'micro' },
      message: 'poss. Tap',
      action: 'None'
    }
  ];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    // Initialize any component logic here
  }

  onRowClick(index: number) {
    this.selectedRow = this.selectedRow === index ? null : index;
  }

  showDetails(event: Event) {
    event.stopPropagation();
    this.snackBar.open('Opening alarm details...', 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  hideAlarm(event: Event) {
    event.stopPropagation();
    this.snackBar.open('Alarm has been hidden', 'Undo', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  unhideAllAlarms() {
    this.snackBar.open('Showing all hidden alarms', 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}
