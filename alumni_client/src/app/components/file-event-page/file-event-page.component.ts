import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-file-event-page',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule],
  templateUrl: './file-event-page.component.html',
  styleUrls: ['./file-event-page.component.scss']
})
export class FileEventPageComponent implements OnInit {

  fileRecords: any[] = [];
  eventSummaries: any[] = [];

  displayedColumns = ['fileName', 'uploadedOn', 'uploadedBy', 'rowsProcessed', 'status'];
  displayedEventColumns = ['eventName', 'attendees', 'speakers', 'volunteers', 'location'];

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    // Build admin map: doc.id = auth UID
    const adminSnap = await getDocs(collection(this.firestore, 'admin'));
    const adminMap: any = {};
    adminSnap.docs.forEach(doc => {
      const d = doc.data() as any;
      adminMap[doc.id] = [d.firstName, d.lastName].filter(x => x).join(' ');
    });

    // File upload logs
    const fileSnap = await getDocs(collection(this.firestore, 'file_upload_logs'));
    this.fileRecords = fileSnap.docs.map(doc => {
      const data = doc.data() as any;
      return {
        fileName: data.fileName,
        uploadedOn: this.formatDate(data.timeUploaded),
        rowsProcessed: data.rowsProcessed,
        status: data.status,
        adminName: adminMap[data.adminId] || 'Unknown'
      };
    });

    // Event summary table
    const eventSnap = await getDocs(collection(this.firestore, 'events'));
    this.eventSummaries = eventSnap.docs.map(doc => {
      const d = doc.data() as any;
      return {
        eventName: d.eventTitle,
        attendees: d.totalAttendees,
        speakers: d.totalSpeakers,
        volunteers: d.totalVolunteers,
        location: d.location
      };
    });
  }

  formatDate(ts: any) {
    if (!ts || !ts.toDate) return '—';
    const d = ts.toDate();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
