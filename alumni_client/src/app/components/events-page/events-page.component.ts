import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { Chart, registerables } from 'chart.js';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

Chart.register(...registerables);

@Component({
  selector: 'app-events-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatSelectModule, MatExpansionModule],
  templateUrl: './events-page.component.html',
  styleUrls: ['./events-page.component.scss']
})
export class EventsPageComponent implements OnInit {

  eventSummaries: any[] = [];
  eventAlumni: any[] = [];

  // FILTERS
  filterYear: number | 'all' = 'all';
  filterLocation: string | 'all' = 'all';
  filterGradYear: number | 'all' = 'all';

  availableYears: number[] = [];
  availableLocations: string[] = [];
  availableGradYears: number[] = [];

  // KPIs
  kpiTotalEvents = 0;
  kpiTotalAttendees = 0;
  kpiUniqueAlumni = 0;
  kpiTopEvent = '-';

  // Dynamic prediction texts
  predictionTextP1 = '';
  predictionTextP2 = '';
  predictionTextP3 = '';

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    await this.loadData();
    this.extractFilters();

    this.filterYear = 'all';
    this.filterLocation = 'all';
    this.filterGradYear = 'all';

    this.updateKPIs();
    this.renderAllCharts();
  }

  async loadData() {
    // EVENTS
    const eventSnap = await getDocs(collection(this.firestore, 'events'));
    this.eventSummaries = eventSnap.docs.map(doc => {
      const d = doc.data() as any;
      return {
        eventId: d.eventId,
        eventName: d.eventTitle,
        attendees: Number(d.totalAttendees) || 0,
        speakers: Number(d.totalSpeakers) || 0,
        volunteers: Number(d.totalVolunteers) || 0,
        location: d.location,
        year: Number(d.year)
      };
    });

    // EVENT–ALUMNI (with grad year)
    const alumniSnap = await getDocs(collection(this.firestore, 'event_alumni'));
    this.eventAlumni = alumniSnap.docs.map(doc => {
      const d = doc.data() as any;
      return {
        eventId: d.eventId,
        studentId: d.studentId,
        graduationYear: Number(d.graduationYear)
      };
    });
  }

  extractFilters() {
    this.availableYears = [...new Set(this.eventSummaries.map(e => e.year))].sort();
    this.availableLocations = [...new Set(this.eventSummaries.map(e => e.location))].sort();
    this.availableGradYears = [...new Set(this.eventAlumni.map(a => a.graduationYear))].sort();
  }

  onFiltersChanged() {
    this.updateKPIs();
    this.renderAllCharts();
  }

  getFilteredEvents() {
    return this.eventSummaries.filter(e => {
      const yearOk = this.filterYear === 'all' || e.year === this.filterYear;
      const locationOk = this.filterLocation === 'all' || e.location === this.filterLocation;

      let gradOk = true;
      if (this.filterGradYear !== 'all') {
        gradOk = this.eventAlumni.some(a =>
          a.eventId === e.eventId && a.graduationYear === this.filterGradYear
        );
      }

      return yearOk && locationOk && gradOk;
    });
  }

  updateKPIs() {
    const events = this.getFilteredEvents();
    this.kpiTotalEvents = events.length;
    this.kpiTotalAttendees = events.reduce((a, b) => a + (b.attendees || 0), 0);

    const eventIds = new Set(events.map(e => e.eventId));
    const alumniFiltered = this.eventAlumni.filter(a => eventIds.has(a.eventId));
    this.kpiUniqueAlumni = new Set(alumniFiltered.map(a => a.studentId)).size;

    if (events.length > 0) {
      const top = events.reduce((max, e) => e.attendees > max.attendees ? e : max, events[0]);
      this.kpiTopEvent = `${top.eventName} (${top.attendees})`;
    } else {
      this.kpiTopEvent = '-';
    }
  }

  // Helper to create / destroy charts
  private createChart(id: string, config: any) {
    const old = Chart.getChart(id as any);
    if (old) old.destroy();
    new Chart(id, config);
  }

  // =============== MAIN CHARTS ==================
  renderAllCharts() {
    setTimeout(() => {
      this.renderCharts();
      this.renderYearCharts();
    }, 200);
  }

  renderCharts() {
    const events = this.getFilteredEvents();

    // Unique alumni per event
    const uniqueCounts = events.map(e =>
      new Set(this.eventAlumni.filter(a => a.eventId === e.eventId).map(a => a.studentId)).size
    );

    this.createChart('chartUnique', {
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

    // Location distribution
    const locationCounts: any = {};
    events.forEach(e => {
      locationCounts[e.location] = (locationCounts[e.location] || 0) + 1;
    });

    this.createChart('chartLocations', {
      type: 'pie',
      data: {
        labels: Object.keys(locationCounts),
        datasets: [{
          data: Object.values(locationCounts),
          backgroundColor: ['#8E24AA', '#43A047', '#FB8C00', '#039BE5', '#e5dd03']
        }]
      }
    });

    // Overall participation
    this.createChart('chartParticipation', {
      type: 'pie',
      data: {
        labels: ['Attendees', 'Speakers', 'Volunteers'],
        datasets: [{
          data: [
            events.reduce((a, b) => a + b.attendees, 0),
            events.reduce((a, b) => a + b.speakers, 0),
            events.reduce((a, b) => a + b.volunteers, 0)
          ],
          backgroundColor: ['#6a1b9a', '#039BE5', '#43A047']
        }]
      }
    });
  }

  // =============== YEAR-BASED CHARTS ==================
  renderYearCharts() {
    const eventCountByYear: any = {};
    const attendeesByYear: any = {};
    const speakersByYear: any = {};
    const volunteersByYear: any = {};

    this.eventSummaries.forEach(e => {
      const y = e.year;
      eventCountByYear[y] = (eventCountByYear[y] || 0) + 1;
      attendeesByYear[y] = (attendeesByYear[y] || 0) + e.attendees;
      speakersByYear[y] = (speakersByYear[y] || 0) + e.speakers;
      volunteersByYear[y] = (volunteersByYear[y] || 0) + e.volunteers;
    });

    this.createChart('chartEventsPerYear', {
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

    this.createChart('chartAttendeesPerYear', {
      type: 'line',
      data: {
        labels: Object.keys(attendeesByYear),
        datasets: [{
          label: 'Total Attendees',
          data: Object.values(attendeesByYear),
          borderColor: '#039BE5',
          borderWidth: 3,
          fill: false
        }]
      }
    });

    this.createChart('chartSVPerYear', {
      type: 'bar',
      data: {
        labels: Object.keys(attendeesByYear),
        datasets: [
          { label: 'Speakers', data: Object.values(speakersByYear), backgroundColor: '#FB8C00' },
          { label: 'Volunteers', data: Object.values(volunteersByYear), backgroundColor: '#43A047' },
          { label: 'Attendees', data: Object.values(attendeesByYear), backgroundColor: '#1E88E5' }
        ]
      }
    });
  }

  // =============== 🔮 PREDICTIVE CHARTS ==================
  renderPredictionCharts(panel: string) {
    const forecastId = 'forecast' + panel;
    const trendId = 'trend' + panel;
    Chart.getChart(forecastId as any)?.destroy();
    Chart.getChart(trendId as any)?.destroy();

    const years = [...new Set(this.eventSummaries.map(e => e.year))].sort((a, b) => a - b);

    if (!years.length) {
      if (panel === 'p1') this.predictionTextP1 = 'Not enough data to generate location-based prediction.';
      if (panel === 'p2') this.predictionTextP2 = 'Not enough data to generate graduation batch prediction.';
      if (panel === 'p3') this.predictionTextP3 = 'Not enough data to generate overall participation forecast.';
      return;
    }

    if (panel === 'p1') {
      // Q1: Locations – line (forecast) + bar (next-year prediction by location)
      const locations = [...new Set(this.eventSummaries.map(e => e.location))];
      const colors = ['#6a1b9a', '#039BE5', '#43A047', '#FB8C00', '#8E24AA'];

      const seriesByLocation: Record<string, number[]> = {};
      locations.forEach(loc => {
        seriesByLocation[loc] = years.map(y =>
          this.eventSummaries
            .filter(e => e.location === loc && e.year === y)
            .reduce((a, b) => a + b.attendees, 0)
        );
      });

      const topLocations = [...locations].sort((a, b) => {
        const sumA = seriesByLocation[a].reduce((s, v) => s + v, 0);
        const sumB = seriesByLocation[b].reduce((s, v) => s + v, 0);
        return sumB - sumA;
      }).slice(0, 3);

      const yearsPlus = [...years, years[years.length - 1] + 1];
      const nextYearValues: number[] = [];

      const lineDatasets = topLocations.map((loc, idx) => {
        const base = seriesByLocation[loc];
        const last = base[base.length - 1] || 0;
        const prev = base[base.length - 2] ?? last;
        const growth = last - prev;
        const next = Math.max(0, last + growth);
        nextYearValues.push(next);

        return {
          label: loc,
          data: [...base, next],
          borderColor: colors[idx % colors.length],
          borderWidth: 3,
          tension: 0.3
        };
      });

      this.createChart(forecastId, {
        type: 'line',
        data: { labels: yearsPlus, datasets: lineDatasets }
      });

      this.createChart(trendId, {
        type: 'bar',
        data: {
          labels: topLocations,
          datasets: [{
            label: `Predicted Attendees in ${yearsPlus[yearsPlus.length - 1]}`,
            data: nextYearValues,
            backgroundColor: ['#6a1b9a', '#039BE5', '#43A047']
          }]
        }
      });

      // 🔍 Dynamic narrative for P1
      if (topLocations.length) {
        const primaryLoc = topLocations[0];
        const idx = 0;
        const base = seriesByLocation[primaryLoc];
        const last = base[base.length - 1] || 0;
        const next = nextYearValues[idx];
        const diff = next - last;
        const pct = last > 0 ? (diff / last) * 100 : 0;

        const secondLoc = topLocations[1];
        const secondInfo = secondLoc
          ? ` ${secondLoc} is also expected to perform well, with similar but slightly lower turnout.`
          : '';

        this.predictionTextP1 =
          `${primaryLoc} is projected to attract around ${Math.round(next)} attendees next year,` +
          ` up by ${Math.round(diff)} compared to the latest year (~${pct.toFixed(1)}% growth).` +
          secondInfo;
      } else {
        this.predictionTextP1 = 'Location-based participation is evenly distributed without a clear dominant city.';
      }

    } else if (panel === 'p2') {
      // Q2: Graduation batch – line + doughnut
      const gradYears = this.availableGradYears;
      if (!gradYears.length) {
        this.predictionTextP2 = 'Graduation year data is not available for prediction.';
        return;
      }

      const counts = gradYears.map(gy =>
        this.eventAlumni.filter(a => a.graduationYear === gy).length
      );

      const forecastCounts = counts.map((c, idx) => {
        const newest = Math.max(...gradYears);
        const boost = gradYears[idx] >= newest - 1 ? 1.25 : 1.08;
        return Math.round(c * boost);
      });

      this.createChart(forecastId, {
        type: 'line',
        data: {
          labels: gradYears,
          datasets: [{
            label: 'Alumni Participation by Graduation Year',
            data: counts,
            borderColor: '#6a1b9a',
            borderWidth: 3,
            tension: 0.3
          }]
        }
      });

      this.createChart(trendId, {
        type: 'doughnut',
        data: {
          labels: gradYears,
          datasets: [{
            label: 'Predicted Share Next Year',
            data: forecastCounts,
            backgroundColor: ['#6a1b9a', '#039BE5', '#43A047', '#FB8C00', '#8E24AA']
          }]
        }
      });

      // 🔍 Dynamic narrative for P2
      const maxIndex = forecastCounts.indexOf(Math.max(...forecastCounts));
      const topGradYear = gradYears[maxIndex];
      const topForecastVal = forecastCounts[maxIndex];
      const currentVal = counts[maxIndex] || 0;
      const diff = topForecastVal - currentVal;
      const pct = currentVal > 0 ? (diff / currentVal) * 100 : 0;

      this.predictionTextP2 =
        `Graduates from ${topGradYear} are projected to be the most active batch next year ` +
        `with roughly ${topForecastVal} expected participants, an increase of about ${diff} ` +
        `compared to current levels (~${pct.toFixed(1)}% growth).`;

    } else if (panel === 'p3') {
      // Q3: Overall growth – 3-year line forecast + polarArea for YoY growth
      const participation = years.map(y =>
        this.eventSummaries
          .filter(e => e.year === y)
          .reduce((a, b) => a + b.attendees, 0)
      );

      if (!participation.length) {
        this.predictionTextP3 = 'Not enough participation history to build a multi-year forecast.';
        return;
      }

      const changes = participation.slice(1).map((v, i) => v - participation[i]);
      const avgGrowth = changes.length
        ? changes.reduce((a, b) => a + b, 0) / changes.length
        : 0;

      const lastYear = years[years.length - 1];
      const forecastYears = [lastYear + 1, lastYear + 2, lastYear + 3];
      const forecastValues: number[] = [];
      let lastVal = participation[participation.length - 1];

      forecastYears.forEach(() => {
        lastVal = Math.max(0, lastVal + avgGrowth);
        forecastValues.push(lastVal);
      });

      this.createChart(forecastId, {
        type: 'line',
        data: {
          labels: [...years, ...forecastYears],
          datasets: [{
            label: 'Historical + Forecasted Attendees',
            data: [...participation, ...forecastValues],
            borderColor: '#039BE5',
            borderWidth: 3,
            tension: 0.3,
            fill: false
          }]
        }
      });

      this.createChart(trendId, {
        type: 'polarArea',
        data: {
          labels: years.slice(1),
          datasets: [{
            label: 'Year-on-Year Growth',
            data: changes.map(c => Math.max(c, 0)),
            backgroundColor: ['#6a1b9a', '#039BE5', '#43A047', '#FB8C00', '#8E24AA']
          }]
        }
      });

      // 🔍 Dynamic narrative for P3
      const nextYear = forecastYears[0];
      const current = participation[participation.length - 1];
      const nextVal = forecastValues[0];
      const diff = nextVal - current;
      const pct = current > 0 ? (diff / current) * 100 : 0;
      const avgPct = current > 0
        ? ((forecastValues[forecastValues.length - 1] - current) / current) * 100 / forecastYears.length
        : 0;

      this.predictionTextP3 =
        `Overall alumni participation is forecasted to reach about ${Math.round(nextVal)} attendees in ${nextYear}, ` +
        `which is roughly ${Math.round(diff)} more than the latest year (~${pct.toFixed(1)}% growth). ` +
        `Across the next three years, the projected average annual growth rate is around ${avgPct.toFixed(1)}%.`;
    }
  }

}
