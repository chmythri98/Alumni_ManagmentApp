import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
// import { EventsComponent } from './components/events/events.component';
// import { UploadComponent } from './components/upload/upload.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // ✅ Protected routes inside layout
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
    //   { path: 'upload', component: UploadComponent },
      { path: 'dashboard', component: DashboardComponent },
    //   { path: 'events', component: EventsComponent }
    ]
  },
];
