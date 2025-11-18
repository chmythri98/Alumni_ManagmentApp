import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { Chart, registerables } from 'chart.js';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatGridListModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  alumni: any[] = [];
  filteredAlumni: any[] = [];

  selectedMajor = '';
  selectedYear = '';
  selectedCompany = '';

  majors: string[] = [];
  years: string[] = [];
  companies: string[] = [];

  brightColors = [
    '#8E24AA', '#F4511E', '#039BE5', '#43A047', '#FB8C00',
    '#3949AB', '#D81B60', '#00ACC1', '#7CB342', '#C0CA33',
    '#E53935', '#1E88E5', '#FDD835', '#6D4C41'
  ];

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    const alumniCollection = collection(this.firestore, 'alumni');

    collectionData(alumniCollection, { idField: 'id' }).subscribe((data: any[]) => {
      console.log('✅ Firestore sample:', data[0]);
      this.alumni = data;
      this.filteredAlumni = [...this.alumni];
      this.populateDropdowns();
      this.renderCharts();
    });
  }

  // ✅ Create unique dropdowns safely
  populateDropdowns() {
    this.majors = [...new Set(
      this.alumni.map(a => a['Major']).filter(Boolean)
    )];

    this.years = [...new Set(
      this.alumni.map(a => a['Graduation Year']?.toString()).filter(Boolean)
    )];

    this.companies = [...new Set(
      this.alumni.map(a => a['Company Name']).filter(Boolean)
    )];
  }

  // ✅ Filter dataset based on selected dropdowns
  filterData() {
    this.filteredAlumni = this.alumni.filter(a =>
      (!this.selectedMajor || a['Major'] === this.selectedMajor) &&
      (!this.selectedYear || a['Graduation Year']?.toString() === this.selectedYear) &&
      (!this.selectedCompany || a['Company Name'] === this.selectedCompany)
    );
    this.renderCharts();
  }

  // ✅ Generic countBy utility
  countBy(field: string) {
    return this.filteredAlumni.reduce((acc: Record<string, number>, curr: any) => {
      const key = curr[field] || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  // ✅ KPI metrics
  totalAlumni() { return this.filteredAlumni.length; }
  totalMajors() { return Object.keys(this.countBy('Major')).length; }
  totalCompanies() { return Object.keys(this.countBy('Company Name')).length; }
  totalRoles() { return Object.keys(this.countBy('Role')).length; }

  // ✅ Render all charts
  renderCharts() {
    const chartIds = ['gradTrend', 'majorPie', 'topMajors', 'topCompanies', 'roleDist'];
    chartIds.forEach(id => Chart.getChart(id)?.destroy());

    // 1️⃣ Graduation Trends
    const gradTrendData = this.countBy('Graduation Year');
    new Chart('gradTrend', {
      type: 'line',
      data: {
        labels: Object.keys(gradTrendData),
        datasets: [{
          label: 'Graduates per Year',
          data: Object.values(gradTrendData),
          fill: true,
          backgroundColor: 'rgba(142,36,170,0.2)',
          borderColor: '#8E24AA',
          tension: 0.3
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    // 2️⃣ Major-wise Alumni Distribution
    const majors = this.countBy('Major');
    new Chart('majorPie', {
      type: 'doughnut',
      data: {
        labels: Object.keys(majors),
        datasets: [{
          data: Object.values(majors),
          backgroundColor: this.brightColors.slice(0, Object.keys(majors).length),
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });

    // 3️⃣ Top Majors by Count
    const sortedMajors = Object.entries(majors).sort((a, b) => b[1] - a[1]);
    new Chart('topMajors', {
      type: 'bar',
      data: {
        labels: sortedMajors.map(([m]) => m),
        datasets: [{
          label: 'Alumni Count',
          data: sortedMajors.map(([, v]) => v),
          backgroundColor: this.brightColors
        }]
      },
      options: { indexAxis: 'y', plugins: { legend: { display: false } } }
    });

    // 4️⃣ Top Companies Hired (from "Company Name")
    const companies = this.countBy('Company Name');
    const sortedCompanies = Object.entries(companies).sort((a, b) => b[1] - a[1]);
    new Chart('topCompanies', {
      type: 'bar',
      data: {
        labels: sortedCompanies.map(([c]) => c),
        datasets: [{
          label: 'Alumni Hired',
          data: sortedCompanies.map(([, v]) => v),
          backgroundColor: this.brightColors
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });

    // 5️⃣ Role Distribution Across Majors
    const roles = this.countBy('Role');
    const majorsList = Object.keys(majors);
    const rolesList = Object.keys(roles);

    const datasets = rolesList.map((role, i) => ({
      label: role,
      data: majorsList.map(m =>
        this.filteredAlumni.filter(a => a['Major'] === m && a['Role'] === role).length
      ),
      backgroundColor: this.brightColors[i % this.brightColors.length]
    }));

    new Chart('roleDist', {
      type: 'bar',
      data: { labels: majorsList, datasets },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
        scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
      }
    });
  }
}
