import { Component, Inject } from '@angular/core';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  collection,
  addDoc,
  getFirestore,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-upload-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './upload-page.component.html',
  styleUrls: ['./upload-page.component.scss'],
})
export class UploadPageComponent {
  step = 0;
  fileName = '';
  headers: string[] = [];
  sheetData: any[][] = [];
  selectedHeaderRow = 0;
  columnMapping: Record<string, string> = {};
  validatedData: any = { toAdd: [], toUpdate: [] };

  eventTitle = '';
  eventYear: number | null = null;
  eventLocation = '';

  requiredFields = [
    'First Name',
    'Last Name',
    'Student ID',
    'Graduation Year',
    'Major',
    'Company Name',
    'Company Location',
    'Role',
    'Still Working',
  ];

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { eventData?: any };
    if (state?.eventData) {
      this.eventTitle = state.eventData.eventTitle;
      this.eventYear = state.eventData.eventYear;
      this.eventLocation = state.eventData.eventLocation;
    }
  }

  /** STEP 1: Upload file */
  onFileUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.fileName = file.name;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      this.sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      this.headers = this.sheetData[0].map(String);

      this.snackBar.open(`✅ ${this.fileName} uploaded successfully`, 'Close', {
        duration: 2500,
      });
      this.step = 1;
    };
    reader.readAsBinaryString(file);
  }

  selectHeaderRow(index: number) {
    this.selectedHeaderRow = index;
    this.headers = this.sheetData[index].map(String);
  }

  goToMatchColumns() {
    if (!this.headers.length) {
      this.snackBar.open('⚠️ Please select a header row before proceeding', 'Close', {
        duration: 3000,
      });
      return;
    }
    this.step = 2;
  }

  /** STEP 3: Validate and Preview before Upload */
  async validateAndPreview() {
    try {
      const db = getFirestore();
      const studentsCollection = collection(db, 'Student_Data_2016_2025');
      const alumniCollection = collection(db, 'alumni');

      // Fetch all student IDs
      const studentSnapshot = await getDocs(studentsCollection);
      const validStudentIds = studentSnapshot.docs.map((d) => d.data()['Student ID']);

      // Fetch all existing alumni IDs
      const alumniSnapshot = await getDocs(alumniCollection);
      const existingAlumniIds = alumniSnapshot.docs.map((d) => d.data()['Student ID']);

      const headerRow = this.selectedHeaderRow;
      const rows = this.sheetData.slice(headerRow + 1);
      const toAdd: any[] = [];
      const toUpdate: any[] = [];

      for (const row of rows) {
        const record: any = {};
        this.requiredFields.forEach((field) => {
          const header = this.columnMapping[field];
          const colIndex = this.headers.indexOf(header);
          record[field] = colIndex >= 0 ? row[colIndex] : '';
        });

        const studentId = record['Student ID'];

        if (validStudentIds.includes(studentId)) {
          if (existingAlumniIds.includes(studentId)) {
            toUpdate.push(record);
          } else {
            toAdd.push(record);
          }
        }
      }

      this.validatedData = { toAdd, toUpdate };
      this.step = 3;

    } catch (error) {
      console.error('Validation error:', error);
      this.snackBar.open('⚠️ Validation failed. Check console for details.', 'Close', { duration: 3000 });
    }
  }

  /** STEP 5: Final upload */
  async finishUpload() {
    try {
      const db = getFirestore();
      const alumniCollection = collection(db, 'alumni');
      const eventCollection = collection(db, 'events');
      const eventAlumniCollection = collection(db, 'event_alumni');
      const logsCollection = collection(db, 'file_upload_logs');

      const logRef = await addDoc(logsCollection, {
        adminId: 'juGmZthJfxRXnqO4CR1GGQQlTff1',
        fileName: this.fileName,
        status: 'Processing',
        rowsProcessed: 0,
        timeUploaded: serverTimestamp(),
      });

      const eventId = `EVT${this.eventYear}${this.eventTitle.replace(/\s+/g, '').toUpperCase().slice(0, 6)}${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(2, '0')}`;

      const allRecords = [...this.validatedData.toAdd, ...this.validatedData.toUpdate];
      let updatedCount = 0;

      this.router.navigate(['/Alumni Data'], {
        state: { alertMessage: `${this.fileName} is being processed...` },
      });

      for (const record of allRecords) {
        const studentId = record['Student ID'];

        const q = query(alumniCollection, where('Student ID', '==', studentId));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const docRef = snapshot.docs[0].ref;
          await updateDoc(docRef, {
            ...record,
            linkedURL: `https://yourapp.com/alumni/${studentId}`,
            lastUpdated: new Date(),
          });
        } else {
          await addDoc(alumniCollection, {
            ...record,
            linkedURL: `https://yourapp.com/alumni/${studentId}`,
            createdAt: new Date(),
          });
        }

        await addDoc(eventAlumniCollection, {
          eventId,
          studentId,
          attended: true,
          feedbackScore: Math.floor(Math.random() * 5) + 1,
          timestamp: new Date(),
        });

        updatedCount++;
      }

      await addDoc(eventCollection, {
        eventId,
        eventTitle: this.eventTitle,
        location: this.eventLocation,
        year: this.eventYear,
        eventDate: new Date(),
        totalAttendees: allRecords.length,
        totalVolunteers: Math.floor(allRecords.length * 0.1),
        totalSpeakers: Math.floor(allRecords.length * 0.05),
        createdAt: new Date(),
      });

      await updateDoc(logRef, {
        status: 'Completed',
        rowsProcessed: allRecords.length,
      });

      this.snackBar.open(`✅ ${this.fileName} processed successfully`, 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Upload error:', error);
      this.snackBar.open('❌ Upload failed. Check console for details.', 'Close', {
        duration: 4000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  resetFlow() {
    this.step = 0;
    this.fileName = '';
    this.headers = [];
    this.sheetData = [];
    this.columnMapping = {};
    this.selectedHeaderRow = 0;
    this.validatedData = { toAdd: [], toUpdate: [] };
  }
}

/** ⚠️ Dialog Component */
@Component({
  selector: 'unmatched-columns-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>⚠️ Required Columns Missing</h2>
    <mat-dialog-content>
      <p>Some required columns were not matched:</p>
      <ul>
        <li *ngFor="let col of data.unmapped">• {{ col }}</li>
      </ul>
      <p>You must select all required columns before continuing.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button color="primary" [mat-dialog-close]="'proceed'">Return</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="'exit'">Exit Flow</button>
    </mat-dialog-actions>
  `,
})
export class UnmatchedColumnsDialog {
  constructor(
    public dialogRef: MatDialogRef<UnmatchedColumnsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
