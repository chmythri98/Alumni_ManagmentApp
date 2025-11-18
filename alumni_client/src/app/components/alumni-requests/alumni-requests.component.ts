import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef, MatDialogActions } from '@angular/material/dialog';
import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  addDoc,
  doc,
} from '@angular/fire/firestore';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-alumni-requests',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    FormsModule,
    MatDialogActions
  ],
  templateUrl: './alumni-requests.component.html',
  styleUrls: ['./alumni-requests.component.scss'],
})
export class AlumniRequestsComponent implements OnInit {
  requests: any[] = [];
  filteredRequests: any[] = [];
  searchTerm = '';

  constructor(
    private firestore: Firestore,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    const reqCol = collection(this.firestore, 'Alumni_Form_Requests');
    const snapshot = await getDocs(reqCol);
    this.requests = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    this.filteredRequests = [...this.requests];
  }

  filterRequests() {
    const term = this.searchTerm.toLowerCase();
    this.filteredRequests = this.requests.filter(
      (req) =>
        req['Student ID']?.toString().toLowerCase().includes(term) ||
        req['First Name']?.toLowerCase().includes(term) ||
        req['Last Name']?.toLowerCase().includes(term)
    );
  }

  openRequest(request: any) {
    const dialogRef = this.dialog.open(AlumniRequestDialog, {
      width: '520px',
      data: request,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result === 'approved') {
        await this.updateStatus(request.id, 'Approved');
        this.snackBar.open('✅ Request approved and record updated!', 'Close', { duration: 3000 });
      } else if (result === 'cancelled') {
        await this.updateStatus(request.id, 'Cancelled');
        this.snackBar.open('❌ Request cancelled.', 'Close', { duration: 3000 });
      }
      this.refresh();
    });
  }

  async updateStatus(docId: string, newStatus: string) {
    const ref = doc(this.firestore, 'Alumni_Form_Requests', docId);
    await updateDoc(ref, { Status: newStatus });
  }

  async refresh() {
    const reqCol = collection(this.firestore, 'Alumni_Form_Requests');
    const snapshot = await getDocs(reqCol);
    this.requests = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    this.filteredRequests = [...this.requests];
  }
}

/** 🧩 Dialog for viewing and processing requests */
@Component({
  selector: 'alumni-request-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatSnackBarModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>📝 Alumni Update Request</h2>
    <mat-dialog-content>
      <p><b>Student ID:</b> {{ data['Student ID'] }}</p>
      <p><b>Name:</b> {{ data['First Name'] }} {{ data['Last Name'] }}</p>
      <p><b>Major:</b> {{ data['Major'] }}</p>
      <p><b>Company:</b> {{ data['Company Name'] }}</p>
      <p><b>Role:</b> {{ data['Role'] }}</p>
      <p><b>Request Type:</b> {{ data['Request Type'] || 'Update Profile' }}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-flat-button color="accent" (click)="updateRecord()"> Add / Update Record</button>
      <button mat-flat-button color="warn" (click)="cancelRequest()">Cancel Request</button>
    </mat-dialog-actions>
  `,
})
export class AlumniRequestDialog {
  constructor(
    private firestore: Firestore,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AlumniRequestDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async searchRecord() {
    const alumniRef = collection(this.firestore, 'alumni');
    const q = query(alumniRef, where('Student ID', '==', this.data['Student ID']));
    const snap = await getDocs(q);

    if (snap.empty) {
      this.snackBar.open('⚠️ No record found for this Student ID.', 'Close', { duration: 3000 });
    } else {
      this.snackBar.open('✅ Existing alumni record found.', 'Close', { duration: 3000 });
    }
  }

  async updateRecord() {
    const alumniRef = collection(this.firestore, 'alumni');
    const q = query(alumniRef, where('Student ID', '==', this.data['Student ID']));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const docRef = snap.docs[0].ref;
      await updateDoc(docRef, { ...this.data, lastUpdated: new Date() });
      this.snackBar.open('✅ Alumni record updated successfully!', 'Close', { duration: 3000 });
    } else {
      await addDoc(alumniRef, { ...this.data, createdAt: new Date() });
      this.snackBar.open('✅ New alumni record added successfully!', 'Close', { duration: 3000 });
    }

    this.dialogRef.close('approved');
  }

  cancelRequest() {
    this.dialogRef.close('cancelled');
  }
}
