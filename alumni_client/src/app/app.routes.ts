import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './auth.guard';
import { UploadPageComponent } from './components/upload-page/upload-page.component';
import { EventsPageComponent } from './components/events-page/events-page.component';
import { AlumniDataPageComponent } from './components/alumni-data-page/alumni-data-page.component';
import { AlumniRequestsComponent } from './components/alumni-requests/alumni-requests.component';
import { UploadStudentComponent } from './components/upload-student/upload-student.component';
import { FileEventPageComponent } from './components/file-event-page/file-event-page.component';
import { UpdateEventAlumniComponent } from './components/update-event-alumni/update-event-alumni.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'Alumni Data', component: AlumniDataPageComponent },
      { path: 'Alumni Requests', component: AlumniRequestsComponent },
      { path: 'events', component: EventsPageComponent },
      { path: 'File Uploads', component: FileEventPageComponent },
      { path: 'upload', component: UploadPageComponent },
      { path: 'student-upload', component: UploadStudentComponent },
      { path: 'update-event', component: UpdateEventAlumniComponent }
    ]
  },
];
