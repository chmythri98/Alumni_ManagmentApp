import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import {
  Firestore,
  collection,
  addDoc,
  getDocs
} from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-upload-student',
  templateUrl: './upload-student.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule],
  styleUrls: ['./upload-student.component.scss']
})
export class UploadStudentComponent {
  parsedData: any[] = [];
  uploadMessage = '';

  constructor(private firestore: Firestore) {}

  // Read Excel File
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      this.parsedData = XLSX.utils.sheet_to_json(worksheet);
      console.log('Parsed Excel Data:', this.parsedData);
    };
    reader.readAsArrayBuffer(file);
  }

  // Upload only non-duplicate Student IDs
  async uploadToFirestore() {
    if (!this.parsedData.length) return;

    const studentCollection = collection(this.firestore, 'Student_Data_2016_2025');

    // Step 1: Get existing Student IDs
    const existingSnapshot = await getDocs(studentCollection);
    const existingIDs = new Set(
      existingSnapshot.docs.map(doc => doc.data()['Student ID'])
    );

    let addedCount = 0;
    let skippedCount = 0;

    // Step 2: Loop through Excel rows
    for (const row of this.parsedData) {
      const studentID = row['Student ID'];

      if (!studentID) {
        skippedCount++; // skip missing Student ID
        continue;
      }

      // Skip duplicates
      if (existingIDs.has(studentID)) {
        skippedCount++;
        continue;
      }

      // Step 3: Add new student row
      await addDoc(studentCollection, {
        'First Name': row['First Name'] || '',
        'Last Name': row['Last Name'] || '',
        'Degree': row['Degree'] || '',
        'Major': row['Major'] || '',
        'Email': row['Email'] || '',
        'GPA': row['GPA'] || '',
        'Credits Earned': row['Credits Earned'] || '',
        'Phone': row['Phone'] || '',
        'Student ID': studentID,
        uploadedAt: new Date()
      });

      existingIDs.add(studentID);
      addedCount++;
    }

    this.uploadMessage =
      `✨ Upload completed — Added: ${addedCount}, ` +
      `Skipped duplicates: ${skippedCount}`;
  }
}
