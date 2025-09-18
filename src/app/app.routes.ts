import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { OverviewComponent } from './components/overview/overview.component';
import { DeviceDetailsComponent } from './components/device-details/device-details.component';
import { BuildingComponent } from './components/building/building.component';
import { AlarmsComponent } from './components/alarms/alarms.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: '/overview', pathMatch: 'full' },
  { path: 'overview', component: HomeComponent },
  { path: 'alarms', component: AlarmsComponent },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'buildings', component: BuildingComponent },
  { path: 'device-organizer', component: DeviceDetailsComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '/home' }
];