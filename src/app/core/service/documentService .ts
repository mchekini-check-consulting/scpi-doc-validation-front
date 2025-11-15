import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDocument } from '../models/document.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private readonly API_URL = '/api/v1/documents';

  constructor(private http: HttpClient) {}

  getAllDocuments(page = 0, size = 20): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<any>(this.API_URL, { params });
  }

  getDocumentsByEmail(email: string): Observable<UserDocument[]> {
    const params = new HttpParams().set('email', email);
    return this.http.get<UserDocument[]>(`${this.API_URL}/by-email`, {
      params,
    });
  }

  getDocumentById(id: string): Observable<UserDocument> {
    return this.http.get<UserDocument>(`${this.API_URL}/${id}`);
  }

  getDownloadUrl(id: string, attachment = false): string {
    return `${this.API_URL}/${id}/download?attachment=${attachment}`;
  }

  updateStatuses(updates: { id: string; status: string }[]) {
    return this.http.patch<UserDocument[]>(`${this.API_URL}/status/update`, {
      documents: updates,
    });
  }

  getDocumentsByDossierId(id: string): Observable<UserDocument[]> {
    return this.http.get<UserDocument[]>(`${this.API_URL}/dossier/${id}`);
  }
}
