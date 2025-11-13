import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserDocument {
  id: string | null;
  userEmail: string;
  fullName: string;
  type: 'AVIS_IMPOSITION' | 'PIECE_IDENTITE' | 'JUSTIFICATIF_DOMICILE';
  status: 'PENDING_UPLOAD' | 'UPLOADED' | 'UNDER_REVIEW' | 'VALIDATED' | 'REJECTED';
  originalFileName: string;
  storedFileName: string;
  bucketName: string;
  uploadedAt: string;     
  lastUpdatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

   private API_URL = '/api/v1/document';

  constructor(private http: HttpClient) {}

  getAllDocuments(): Observable<UserDocument[]> {
    return this.http.get<UserDocument[]>(this.API_URL);
  }
}
