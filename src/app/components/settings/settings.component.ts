import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  languages: string[] = ['English'];
  selectedLanguage: string = 'English';

  softwareVersion: string = 'V1.2 beta';
  latestUpdate: string = '23.09.2025';
}
