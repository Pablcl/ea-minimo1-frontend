import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Consulta, RespuestaConsulta } from '../models/consulta.model';

@Injectable({
  providedIn: 'root'
})
export class ConsultaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/api/consultas';

  getConsultas(): Observable<Consulta[]> {
    return this.http.get<Consulta[]>(this.apiUrl);
  }

  getConsulta(id: string): Observable<Consulta> {
    return this.http.get<Consulta>(`${this.apiUrl}/${id}`);
  }

  createConsulta(data: Omit<Consulta, '_id'>): Observable<Consulta> {
    return this.http.post<Consulta>(this.apiUrl, data);
  }

  updateConsulta(id: string, data: Partial<Consulta>): Observable<Consulta> {
    return this.http.put<Consulta>(`${this.apiUrl}/${id}`, data);
  }

  deleteConsulta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addRespuestaConsulta(id: string, data: Omit<RespuestaConsulta, 'createdAt'>): Observable<Consulta> {
    return this.http.patch<Consulta>(`${this.apiUrl}/${id}/respuestas`, data);
  }
}
