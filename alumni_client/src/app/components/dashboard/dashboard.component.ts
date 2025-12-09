import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { Chart, registerables } from 'chart.js';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { MatTabNavPanel } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';


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
    MatTabNavPanel,
    MatExpansionModule
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
  companyPredictionText = '';
  majorPredictionText = '';
  locationPredictionText = '';

 brightColors = [
  '#8E24AA', '#D81B60', '#F4511E', '#FB8C00', '#FDD835',
  '#43A047', '#00ACC1', '#1E88E5', '#3949AB', '#6D4C41',
  '#00897B', '#5E35B1', '#EF5350', '#BA68C8', '#FF7043',
  '#FFA726', '#FFCA28', '#26A69A', '#29B6F6', '#42A5F5',
  '#7E57C2', '#66BB6A', '#26C6DA', '#AB47BC', '#EC407A',
  '#26A69A', '#FF8A65', '#AED581', '#7986CB', '#4DB6AC',
  '#9575CD', '#F06292', '#4FC3F7', '#4DB6AC', '#81C784',
  '#FBC02D', '#9CCC65', '#7CB342', '#F48FB1', '#64B5F6',
  '#4DD0E1', '#A1887F', '#BDBDBD', '#90CAF9', '#5C6BC0',
  '#FFAB91', '#CE93D8', '#FFCC80', '#DCE775', '#B2DFDB',
  '#80CBC4', '#EF9A9A', '#9FA8DA'
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
          backgroundColor: this.brightColors
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

    // 🔥 NEW — 6️⃣ Alumni by Company Location
    const locations = this.countBy('Company Location');
    const sortedLocations = Object.entries(locations).sort((a, b) => b[1] - a[1]);
    new Chart('alumniLocation', {
      type: 'bar',
      data: {
        labels: sortedLocations.map(([l]) => l),
        datasets: [{
          label: 'Alumni Count',
          data: sortedLocations.map(([, v]) => v),
          backgroundColor: this.brightColors
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true } }
      }
    });
    
    this.renderPredictTopCompanies();
    this.renderPredictTopMajors();
    this.renderPredictTopLocations();
  }
 
renderPredictTopCompanies() {
  const comp = this.countBy('Company Name');
  const labels = Object.keys(comp);
  const current = Object.values(comp) as number[];

  // Forecast using enhanced category rules
  const forecast = labels.map((name, i) => {
    const val = current[i];
    const lower = name.toLowerCase();

    if (lower.includes("ai") || lower.includes("data")) return Math.round(val * 1.15);
    if (lower.includes("cyber")) return Math.round(val * 1.12);
    if (lower.includes("software") || lower.includes("dev")) return Math.round(val * 1.10);
    if (lower.includes("qa") || lower.includes("test")) return Math.round(val * 1.08);

    return Math.round(val * 1.05); // generic growth
  });

  Chart.getChart('forecastTopCompanies')?.destroy();
  new Chart('forecastTopCompanies', {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Forecast', data: forecast, backgroundColor: '#6A1B9A' }] }
  });

  Chart.getChart('trendTopCompanies')?.destroy();
  new Chart('trendTopCompanies', {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Current', data: current, borderColor: '#039BE5', fill: false },
        { label: 'Forecast', data: forecast, borderColor: '#6A1B9A', borderDash: [6, 6], fill: false }
      ]
    }
  });

  // Dynamic Description
  const topIndex = forecast.indexOf(Math.max(...forecast));
  const topCompany = labels[topIndex];
  const mid = labels.slice(1, 5).join(', ');
  const low = labels.slice(-4).join(', ');

  this.companyPredictionText =
    `Projected hiring activity is highest for ${topCompany}, indicating strong forward representation among alumni. `
    + `Other influential employers include ${mid}, showing steady upward movement. `
    + `Lower-volume organizations such as ${low} show minimal change, maintaining stable hiring patterns. `
    + `Overall, the distribution suggests continued dominance among leading recruiters next year.`;
}

renderPredictTopMajors() {
  const data = this.countBy('Major');
  const labels = Object.keys(data);
  const current = Object.values(data) as number[];

  const forecast = labels.map((major, i) => {
    const val = current[i];
    const lower = major.toLowerCase();

    if (lower.includes("ai") || lower.includes("machine")) return Math.round(val * 1.20);
    if (lower.includes("data")) return Math.round(val * 1.18);
    if (lower.includes("cyber")) return Math.round(val * 1.15);
    if (lower.includes("software") || lower.includes("computer")) return Math.round(val * 1.12);
    if (lower.includes("cloud") || lower.includes("devops")) return Math.round(val * 1.10);
    if (lower.includes("information") || lower.includes("mis") || lower.includes("it")) return Math.round(val * 1.06);

    return Math.round(val * 1.04);
  });

  Chart.getChart('forecastMajorEmployment')?.destroy();
  new Chart('forecastMajorEmployment', {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Forecast', data: forecast, backgroundColor: '#FB8C00' }] }
  });

  Chart.getChart('trendMajorEmployment')?.destroy();
  new Chart('trendMajorEmployment', {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Current', data: current, borderColor: '#FB8C00', fill: false },
        { label: 'Forecast', data: forecast, borderColor: '#6A1B9A', borderDash: [6, 6], fill: false }
      ]
    }
  });

  // Dynamic Description
  const topIndex = forecast.indexOf(Math.max(...forecast));
  const topMajor = labels[topIndex];

  const rising = labels
    .sort((a, b) => forecast[labels.indexOf(b)] - forecast[labels.indexOf(a)])
    .slice(1, 5)
    .join(', ');

  const stable = labels.slice(-4).join(', ');

  this.majorPredictionText =
    `Among academic programs, ${topMajor} shows the strongest projected representation next year. `
    + `Additional majors such as ${rising} demonstrate notable upward patterns in anticipated alumni distribution. `
    + `Majors including ${stable} show smaller shifts, maintaining stable participation trends. `
    + `The projection closely follows existing patterns while highlighting areas of notable growth.`;
}

renderPredictTopLocations() {
  const loc = this.countBy('Company Location');
  const labels = Object.keys(loc);
  const current = Object.values(loc) as number[];

  const forecast = labels.map((location, i) => {
    const val = current[i];
    const lower = location.toLowerCase();

    if (lower.includes("new york") || lower.includes("seattle") ||
        lower.includes("san francisco") || lower.includes("austin"))
      return Math.round(val * 1.15);

    if (lower.includes("virginia") || lower.includes("dc") || lower.includes("boston"))
      return Math.round(val * 1.12);

    if (lower.includes("dallas") || lower.includes("chicago") || lower.includes("atlanta"))
      return Math.round(val * 1.07);

    if (lower.includes("remote") || lower.includes("hybrid"))
      return Math.round(val * 1.05);

    return Math.round(val * 1.06);
  });

  Chart.getChart('forecastLocations')?.destroy();
  new Chart('forecastLocations', {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Forecast', data: forecast, backgroundColor: '#43A047' }] }
  });

  Chart.getChart('trendLocations')?.destroy();
  new Chart('trendLocations', {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Current', data: current, borderColor: '#43A047', fill: false },
        { label: 'Forecast', data: forecast, borderColor: '#6A1B9A', borderDash: [6, 6], fill: false }
      ]
    }
  });

  // Dynamic Description
  const topIndex = forecast.indexOf(Math.max(...forecast));
  const topLocation = labels[topIndex];

  const strong = labels.slice(1, 6).join(', ');
  const lower = labels.slice(-4).join(', ');

  this.locationPredictionText =
    `Geographic forecasts show ${topLocation} as the leading region for projected alumni presence next year. `
    + `Other key markets such as ${strong} also show upward growth patterns. `
    + `Smaller regions including ${lower} display minimal fluctuations from current levels. `
    + `The distribution highlights continued demand in major metropolitan and tech-oriented areas.`;
}


  
}
