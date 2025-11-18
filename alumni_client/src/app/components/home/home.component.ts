import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';

import { Firestore, collection, collectionData, Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  userEmail: string | null = null;

  // KPI Values
  activeAdmins = 0;
  activeAlumniThisMonth = 0;
  recentGradYear: number | null = null;
  totalFilesUploaded = 0;

  // Recent Activity Values
  latestBatchYear: number | null = null;
  latestFileName: string | null = null;
  latestFormRequest: any = null;
  pendingRequests = 0;

  constructor(
    private snackBar: MatSnackBar,
    private auth: Auth,
    private firestore: Firestore
  ) {}

  ngOnInit(): void {
    this.handleAuth();
    this.loadAdmins();
    this.loadAlumni();
    this.loadActiveAlumni();
    this.loadUploadLogs();
    this.loadFormRequests();
  }

  // ============================================
  // AUTH HANDLER
  // ============================================
  handleAuth() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userEmail = user.email;
        this.snackBar.open(`Welcome back, ${user.email}!`, 'Close', {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  // ============================================
  // 👨‍💼 ACTIVE ADMINS
  // ============================================
  loadAdmins() {
    const adminRef = collection(this.firestore, 'admin');
    collectionData(adminRef).subscribe((admins: any[]) => {
      this.activeAdmins = admins.length;
    });
  }

  // ============================================
  // 🎓 ALUMNI + LATEST GRADUATION YEAR
  // ============================================
  loadAlumni() {
    const alumniRef = collection(this.firestore, 'alumni');

    collectionData(alumniRef).subscribe((alumni: any[]) => {
      const years = alumni
        .map(a => Number(a['Graduation Year']))
        .filter(y => !!y);

      if (years.length) {
        this.recentGradYear = Math.max(...years);
        this.latestBatchYear = this.recentGradYear;
      }
    });
  }

  // ============================================
  // ⭐ ACTIVE ALUMNI THIS MONTH (event_alumni)
  // ============================================
  loadActiveAlumni() {
    const eventRef = collection(this.firestore, 'event_alumni');

    collectionData(eventRef).subscribe((records: any[]) => {
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();

      this.activeAlumniThisMonth = records.filter(e => {
        if (!e.timestamp) return false;

        let t: Date;

        if (e.timestamp instanceof Timestamp) t = e.timestamp.toDate();
        else if (typeof e.timestamp.toDate === 'function') t = e.timestamp.toDate();
        else t = new Date(e.timestamp);

        return t.getMonth() === month && t.getFullYear() === year;
      }).length;
    });
  }

  // ============================================
  // 📁 FILE UPLOAD LOGS + LATEST FILE NAME
  // ============================================
  loadUploadLogs() {
    const logsRef = collection(this.firestore, 'file_upload_logs');

    collectionData(logsRef).subscribe((logs: any[]) => {
      this.totalFilesUploaded = logs.length;

      if (!logs.length) return;

      // 🔥 Sort by timestamp DESC
      const sorted = logs.sort((a, b) => {
        const t1 = a.timeUploaded instanceof Timestamp ? a.timeUploaded.toDate() : new Date(a.timeUploaded);
        const t2 = b.timeUploaded instanceof Timestamp ? b.timeUploaded.toDate() : new Date(b.timeUploaded);
        return t2.getTime() - t1.getTime();
      });

      this.latestFileName = sorted[0].fileName || null;
    });
  }

  // ============================================
  // 📝 ALUMNI FORM REQUESTS
  // ============================================
  loadFormRequests() {
    const reqRef = collection(this.firestore, 'Alumni_Form_Requests');

    collectionData(reqRef).subscribe((req: any[]) => {
      if (!req.length) return;

      this.pendingRequests = req.filter(r => r.Status === "Pending").length;

      // Most recent (just pick last entry)
      this.latestFormRequest = req[req.length - 1];
    });
  }
}
