import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://127.0.0.1:8000/api'; // localhost

  constructor(private http: HttpClient) {}

  // ─────────── ALUMNI ───────────
  getAlumni(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/alumni/`);
  }

  getAlumniById(studentId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/alumni/${studentId}/`);
  }

  addAlumni(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/alumni/`, data);
  }

  deleteAlumni(studentId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/alumni/${studentId}/`);
  }

  // ─────────── ADMIN ───────────
  getAdminById(uid: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/${uid}`);
  }

  updateAdmin(uid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/${uid}/`, data);
  }

  // ─────────── EVENTS ───────────
  getEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/events/`);
  }

  getEventAlumni(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/event-alumni/`);
  }

  // ─────────── FORM REQUESTS ───────────
  getAlumniFormRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/alumni-form-requests/`);
  }

  // ─────────── FILE UPLOAD LOGS ───────────
  getFileUploadLogs(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/file-upload-logs/${id}/`);
  }
}
