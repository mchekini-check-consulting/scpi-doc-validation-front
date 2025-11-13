import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  UserDocument,
  documentStatus,
  documentType,
  StatusKey,
} from '../../../core/models/document.model';
import { DocumentService } from '../../../core/service/documentService ';


interface TraitementDocument {
  id: string;
  typeLabel: string;
  fileName: string;
  statusKey: StatusKey;
  statusLabel: string;
}

@Component({
  selector: 'app-traitement-dossier',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './traitement-dossier.component.html',
  styleUrls: ['./traitement-dossier.component.scss'],
})
export class TraitementDossierComponent implements OnInit {
  dossierEmail!: string;

  documents: TraitementDocument[] = [];
  currentIndex = 0;
  currentDocument: TraitementDocument | null = null;

  showValidationAnim = false;
  showRejectAnim = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.dossierEmail = decodeURIComponent(
      this.route.snapshot.paramMap.get('email') || ''
    );

    if (this.dossierEmail) {
      this.loadDocumentsFromBackend(this.dossierEmail);
    }
  }

  /** 🔵 CHARGEMENT DES DOCUMENTS BACKEND */
  private loadDocumentsFromBackend(email: string): void {
    this.documentService.getDocumentsByEmail(email).subscribe({
      next: (docs) => {
        this.documents = docs.map((d) => this.mapToViewModel(d));
        this.currentIndex = 0;
        this.currentDocument = this.documents[0] ?? null;
      },
      error: (err) => {
        console.error('Erreur chargement documents pour', email, err);
      },
    });
  }

  /** 🔵 MAPPING BACKEND → DOCUMENT FRONT */
  private mapToViewModel(doc: UserDocument): TraitementDocument {
    const { typeLabel } = this.mapType(doc.type);
    const { statusKey, statusLabel } = this.mapStatus(doc.status);

    return {
      id: doc.id || '',
      typeLabel,
      fileName: doc.originalFileName,
      statusKey,
      statusLabel,
    };
  }

  /** 🔵 Mapping type backend → libellé FR */
  private mapType(type: documentType): { typeLabel: string } {
    switch (type) {
      case 'PIECE_IDENTITE':
        return { typeLabel: "Pièce d'identité" };
      case 'AVIS_IMPOSITION':
        return { typeLabel: "Avis d'imposition" };
      case 'JUSTIFICATIF_DOMICILE':
      default:
        return { typeLabel: 'Justificatif de domicile' };
    }
  }

  /** 🔵 Mapping statut backend → UI */
  private mapStatus(
    status: documentStatus
  ): { statusKey: StatusKey; statusLabel: string } {
    switch (status) {
      case 'PENDING_UPLOAD':
        return { statusKey: 'pending-upload', statusLabel: 'En attente' };
      case 'UPLOADED':
        return { statusKey: 'uploaded', statusLabel: 'Téléversé' };
      case 'UNDER_REVIEW':
        return { statusKey: 'under-review', statusLabel: 'En revue' };
      case 'VALIDATED':
        return { statusKey: 'validated', statusLabel: 'Validé' };
      case 'REJECTED':
      default:
        return { statusKey: 'rejected', statusLabel: 'Rejeté' };
    }
  }

  /** 🔵 NAVIGATION ENTRE DOCUMENTS */
  prevDocument(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.currentDocument = this.documents[this.currentIndex];
    }
  }

  nextDocument(): void {
    if (this.currentIndex < this.documents.length - 1) {
      this.currentIndex++;
      this.currentDocument = this.documents[this.currentIndex];
    }
  }

  /** 🔵 VALIDATION / REJET */
  validateDocument(): void {
    if (!this.currentDocument) return;
    this.triggerSuccessAnimation();
    this.currentDocument.statusKey = 'validated';
    this.currentDocument.statusLabel = 'Validé';
    // FUTUR: appel backend
  }

  rejectDocument(): void {
    if (!this.currentDocument) return;
    this.triggerRejectAnimation();
    this.currentDocument.statusKey = 'rejected';
    this.currentDocument.statusLabel = 'Rejeté';
    // FUTUR: appel backend
  }

  private triggerSuccessAnimation(): void {
    this.showValidationAnim = true;
    setTimeout(() => (this.showValidationAnim = false), 900);
  }

  private triggerRejectAnimation(): void {
    this.showRejectAnim = true;
    setTimeout(() => (this.showRejectAnim = false), 900);
  }

  /** 🔵 TYPE FICHIER */
  isImage(file?: string): boolean {
    if (!file) return false;
    return /\.(jpg|jpeg|png)$/i.test(file);
  }

  isPdf(file?: string): boolean {
    if (!file) return false;
    return /\.pdf$/i.test(file);
  }

  /** 🔵 URL de téléchargement depuis MinIO */
  docUrl(doc: TraitementDocument): string {
    return this.documentService.getDownloadUrl(doc.id, false);
  }

  goBack(): void {
    this.router.navigate(['/demand-history']);
  }
}
