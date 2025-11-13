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

  getAllDocuments(): Observable<UserDocument[]> {
    return this.http.get<UserDocument[]>(this.API_URL);
  }

  getDocumentsByEmail(email: string): Observable<UserDocument[]> {
    const params = new HttpParams().set('email', email);
    return this.http.get<UserDocument[]>(this.API_URL, { params });
  }

  getDownloadUrl(id: string, attachment = false): string {
    return `${this.API_URL}/${id}/download?attachment=${attachment}`;
  }
}
