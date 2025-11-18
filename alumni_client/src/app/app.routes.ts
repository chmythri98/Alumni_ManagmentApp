import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
// import { EventsComponent } from './components/events/events.component';
// import { UploadComponent } from './components/upload/upload.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './auth.guard';
import { RegisterComponent } from './components/register/register.component';
import { UploadPageComponent } from './components/upload-page/upload-page.component';
import { EventsPageComponent } from './components/events-page/events-page.component';
import { AlumniDataPageComponent } from './components/alumni-data-page/alumni-data-page.component';
import { AlumniRequestsComponent } from './components/alumni-requests/alumni-requests.component';
import { UploadStudentComponent } from './components/upload-student/upload-student.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // ✅ Protected routes inside layout
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'Alumni Data', component: AlumniDataPageComponent },
      { path: 'Alumni Requests', component: AlumniRequestsComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'events', component: EventsPageComponent },
      {path: 'upload', component: UploadPageComponent},
      {path: 'student-upload', component: UploadStudentComponent}

    ]
  },
];
