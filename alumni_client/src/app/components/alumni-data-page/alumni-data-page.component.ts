import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-alumni-data-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './alumni-data-page.component.html',
  styleUrls: ['./alumni-data-page.component.scss'],
})
export class AlumniDataPageComponent implements OnInit {
 // displayedColumns: string[] = ['name', 'year', 'major', 'company', 'role'];
  dataSource = new MatTableDataSource<any>([]);
  searchValue = '';
  successMessage: string | null = null;

  // Upload Tab fields
  eventTitle = '';
  eventYear!: number;
  eventLocation = '';
  displayedColumns: string[] = [
  'firstName',
  'lastName',
  'studentID',
  'graduationYear',
  'major',
  'companyName',
  'role',
  'stillWorking'
];


  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private firestore: Firestore
  ) {}

  ngOnInit() {
    this.fetchAlumniData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /** 🔄 Fetch Firestore alumni data */
  fetchAlumniData() {
    const alumniRef = collection(this.firestore, 'alumni');
    onSnapshot(alumniRef, (snapshot) => {
      const alumniData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.dataSource.data = alumniData;
    });
  }

  /** 🔍 Search filter */
  applyFilter() {
    this.dataSource.filter = this.searchValue.trim().toLowerCase();
  }

  /** 📤 Export filtered data to Excel */
  exportToExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.filteredData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'AlumniData');
    XLSX.writeFile(wb, 'GHU_Alumni_Data.xlsx');
    this.snackBar.open('✅ Alumni data exported successfully!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  /** ➕ Navigate to upload page */
  goToUploadPage() {
    this.router.navigate(['/upload'], {
      state: {
        eventData: {
          eventTitle: this.eventTitle,
          eventYear: this.eventYear,
          eventLocation: this.eventLocation,
        },
      },
    });
  }
}
