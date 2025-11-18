import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { Chart, registerables } from 'chart.js';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

Chart.register(...registerables);

@Component({
  selector: 'app-events-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatSelectModule
  ],
  templateUrl: './events-page.component.html',
  styleUrls: ['./events-page.component.scss']
})
export class EventsPageComponent implements OnInit {

  fileRecords: any[] = [];
  eventSummaries: any[] = [];
  eventAlumni: any[] = [];

  selectedYear: number | 'all' = 'all';
  availableYears: number[] = [];

  displayedColumns = ['fileName', 'uploadedOn', 'uploadedBy', 'rowsProcessed', 'status'];
  displayedEventColumns = ['eventName', 'attendees', 'speakers', 'volunteers', 'location'];

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    await this.loadData();
    this.extractAvailableYears();
    this.renderAllCharts();
  }

  async loadData() {
    const adminSnap = await getDocs(collection(this.firestore, 'admin'));
    const adminMap: any = {};
    adminSnap.docs.forEach(doc => {
      const d = doc.data();
      adminMap[doc.id] = `${d['firstName']} ${d['lastName']}`;
    });

    const fileSnap = await getDocs(collection(this.firestore, 'file_upload_logs'));
    this.fileRecords = fileSnap.docs.map(doc => {
      const data = doc.data();
      return {
        fileName: data['fileName'],
        uploadedOn: this.formatDate(data['timeUploaded']),
        rowsProcessed: data['rowsProcessed'],
        status: data['status'],
        adminName: adminMap[data['adminId']] || 'Unknown'
      };
    });

    const eventSnap = await getDocs(collection(this.firestore, 'events'));
    this.eventSummaries = eventSnap.docs.map(doc => ({
      eventId: doc.data()['eventId'],
      eventName: doc.data()['eventTitle'],
      attendees: doc.data()['totalAttendees'],
      speakers: doc.data()['totalSpeakers'],
      volunteers: doc.data()['totalVolunteers'],
      location: doc.data()['location'],
      year: doc.data()['year']
    }));

    const alumniSnap = await getDocs(collection(this.firestore, 'event_alumni'));
    this.eventAlumni = alumniSnap.docs.map(doc => doc.data());
  }

  extractAvailableYears() {
    const years = new Set(this.eventSummaries.map(e => e.year));
    this.availableYears = Array.from(years).sort();
  }

  filterByYear() {
    this.renderAllCharts();
  }

  formatDate(ts: any) {
    if (!ts) return '—';
    const d = ts.toDate();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  renderAllCharts() {
    setTimeout(() => {
      this.renderCharts();
      this.renderYearCharts();
    }, 300);
  }

  getFilteredEvents() {
    return this.selectedYear === 'all'
      ? this.eventSummaries
      : this.eventSummaries.filter(e => e.year === this.selectedYear);
  }

  renderCharts() {
    const events = this.getFilteredEvents();

    const uniqueCounts = events.map(event => {
      const items = this.eventAlumni.filter(a => a.eventId === event.eventId);
      return new Set(items.map(a => a.studentId)).size;
    });

    new Chart('chartUnique', {
      type: 'bar',
      data: {
        labels: events.map(e => e.eventName),
        datasets: [{
          label: 'Unique Alumni',
          data: uniqueCounts,
          backgroundColor: '#039BE5'
        }]
      }
    });

    const locationCounts: any = {};
    events.forEach(e => locationCounts[e.location] = (locationCounts[e.location] || 0) + 1);

    new Chart('chartLocations', {
      type: 'pie',
      data: {
        labels: Object.keys(locationCounts),
        datasets: [{
          data: Object.values(locationCounts),
          backgroundColor: ['#8E24AA', '#43A047', '#FB8C00', '#039BE5']
        }]
      }
    });

    // new Chart('chartParticipation', {
    //   type: 'pie',
    //   data: {
    //     labels: ['Attendees', 'Speakers', 'Volunteers'],
    //     datasets: [{
    //       data: [
    //         events.reduce((a, b) => a + b.attendees, 0),
    //         events.reduce((a, b) => a + b.speakers, 0),
    //         events.reduce((a, b) => a + b.volunteers, 0)
    //       ],
    //       backgroundColor: ['#6a1b9a', '#039BE5', '#43A047']
    //     }]
    //   }
    // });
  }

  renderYearCharts() {
    const eventCountByYear: any = {};
    const attendeesByYear: any = {};
    const speakersByYear: any = {};
    const volunteersByYear: any = {};
    const attendeesByYear2: any = {}; // new dataset for Chart 3

    this.eventSummaries.forEach(e => {
      eventCountByYear[e.year] = (eventCountByYear[e.year] || 0) + 1;
      attendeesByYear[e.year] = (attendeesByYear[e.year] || 0) + e.attendees;
      speakersByYear[e.year] = (speakersByYear[e.year] || 0) + e.speakers;
      volunteersByYear[e.year] = (volunteersByYear[e.year] || 0) + e.volunteers;
      attendeesByYear2[e.year] = (attendeesByYear2[e.year] || 0) + e.attendees;
    });

    new Chart('chartEventsPerYear', {
      type: 'bar',
      data: {
        labels: Object.keys(eventCountByYear),
        datasets: [{
          label: 'Events Organized',
          data: Object.values(eventCountByYear),
          backgroundColor: '#8E24AA'
        }]
      }
    });

    new Chart('chartAttendeesPerYear', {
      type: 'line',
      data: {
        labels: Object.keys(attendeesByYear),
        datasets: [{
          label: 'Total Attendees',
          data: Object.values(attendeesByYear),
          borderColor: '#039BE5',
          borderWidth: 3,
          tension: 0.3
        }]
      }
    });
new Chart('chartSVPerYear', {
  type: 'bar',
  data: {
    labels: Object.keys(attendeesByYear2),
    datasets: [
      {
        label: 'Speakers',
        data: Object.values(speakersByYear),
        backgroundColor: '#FB8C00'
      },
      {
        label: 'Volunteers',
        data: Object.values(volunteersByYear),
        backgroundColor: '#43A047'
      },
      {
        label: 'Attendees',
        data: Object.values(attendeesByYear2),
        backgroundColor: '#1E88E5'
      }
    ]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        stacked: false,
        ticks: { font: { size: 14 } }
      },
      y: {
        stacked: false,
        beginAtZero: true,
        ticks: { font: { size: 14 } }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 14 } }
      }
    }
  }
});

  }
}
