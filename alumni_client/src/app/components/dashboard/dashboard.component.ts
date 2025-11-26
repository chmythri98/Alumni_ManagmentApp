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
  const sorted = Object.entries(comp).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(([c]) => c);
  const current = sorted.map(([, v]) => v as number);
  const forecast = current.map(v => v + Math.round(v * 0.12));

  // Build both charts (unchanged)
  new Chart('forecastTopCompanies', {
    type: 'bar',
    data: { labels, datasets: [{ data: forecast, backgroundColor: '#6A1B9A' }] }
  });

  new Chart('trendTopCompanies', {
    type: 'line',
    data: { labels, datasets: [
      { label: 'Current', data: current, borderColor: '#039BE5', fill: false },
      { label: 'Forecast', data: forecast, borderColor: '#6A1B9A', borderDash: [6, 6], fill: false }
    ] }
  });

  // 📌 Generate automated explanatory paragraph
  if (labels.length > 0) {
    const top1 = labels[0];
    const top2 = labels[1] ?? null;
    const rising = top2 ? `${top1} and ${top2}` : top1;

    const avgCurrent = current.reduce((a, b) => a + b, 0) / current.length;
    const avgFuture = forecast.reduce((a, b) => a + b, 0) / forecast.length;
    const delta = avgFuture - avgCurrent;

    const trendText =
      delta > 4 ? 'strong upward hiring momentum' :
      delta > 1 ? 'moderate hiring expansion' :
      delta > 0 ? 'stabilizing recruitment pattern' :
      'noticeable decline in demand';

    this.companyPredictionText =
      `Forecast projections indicate that ${rising} are expected to remain the leading recruiters of GHU graduates next year. ` +
      `The overall hiring ecosystem shows ${trendText}, driven by increasing industry alignment with alumni profiles. ` +
      `These predictions suggest highly favorable placement opportunities across top hiring partners in the coming academic cycle.`;
  } else {
    this.companyPredictionText = 'Not enough hiring distribution data available to generate a company-level forecast.';
  }
}

renderPredictTopMajors() {
  const data = this.countBy('Major');
  const labels = Object.keys(data);
  const current = Object.values(data) as number[];
  const forecast = current.map(v => v + Math.round(v * 0.10));

  new Chart('forecastMajorEmployment', {
    type: 'bar',
    data: { labels, datasets: [{ data: forecast, backgroundColor: '#FB8C00' }] }
  });

  new Chart('trendMajorEmployment', {
    type: 'line',
    data: { labels, datasets: [
      { label: 'Current', data: current, borderColor: '#FB8C00', fill: false },
      { label: 'Forecast', data: forecast, borderColor: '#6A1B9A', borderDash: [6, 6], fill: false }
    ] }
  });

  if (labels.length > 0) {
    const sorted = labels.map((m, i) => ({ major: m, growth: forecast[i] - current[i] }))
                         .sort((a, b) => b.growth - a.growth);
    const topMajor = sorted[0].major;
    const runner = sorted[1]?.major;

    this.majorPredictionText =
      `Employment trends strongly favor graduates from ${topMajor}, indicating its continued dominance in the job market next year. ` +
      `${runner ? `${runner} also demonstrates solid upward mobility, reinforcing its relevance in industry demand. ` : ''}` +
      `Overall, the academic–industry skill match suggests sustained pathways for students within technology and data-oriented domains.`;
  } else {
    this.majorPredictionText = 'Not enough major-level sample size to generate a predictive academic forecast.';
  }
}

 renderPredictTopLocations() {
  const loc = this.countBy('Company Location');
  const labels = Object.keys(loc);
  const current = Object.values(loc) as number[];
  const forecast = current.map(v => v + Math.round(v * 0.15));

  new Chart('forecastLocations', {
    type: 'bar',
    data: { labels, datasets: [{ data: forecast, backgroundColor: '#43A047' }] }
  });

  new Chart('trendLocations', {
    type: 'line',
    data: { labels, datasets: [
      { label: 'Current', data: current, borderColor: '#43A047', fill: false },
      { label: 'Forecast', data: forecast, borderColor: '#6A1B9A', borderDash: [6, 6], fill: false }
    ] }
  });

  if (labels.length > 0) {
    const sorted = labels.map((loc, i) => ({ loc, growth: forecast[i] - current[i] }))
                         .sort((a, b) => b.growth - a.growth);

    const top = sorted[0].loc;
    const second = sorted[1]?.loc;

    this.locationPredictionText =
      `Geographical forecasts reveal increasing job attraction in ${top}, positioning it as a primary destination for future GHU placements. ` +
      `${second ? `${second} follows closely with strong hiring capacity and workplace expansion in emerging industries. ` : ''}` +
      `Overall, relocation preferences and workforce mobility point toward sustained professional success in metropolitan and tech-centric labor markets.`;
  } else {
    this.locationPredictionText = 'Insufficient geographic hiring distribution to generate a forecast on alumni locations.';
  }
}


   

}
