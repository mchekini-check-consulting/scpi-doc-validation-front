import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

import {
  UserDocument,
  StatusKey,
  documentStatus,
  documentType,
} from '../../../core/models/document.model';

import { DocumentStatusStoreService } from '../../../core/store/document-status-store.service';
import { DocumentService } from '../../../core/service/documentService ';

interface TraitementDocument {
  id: string;
  typeLabel: string;
  fileName: string;
  statusKey: StatusKey;
  statusLabel: string;
  url: string;
  safeUrl: SafeResourceUrl;
}

@Component({
  selector: 'app-traitement-dossier',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './traitement-dossier.component.html',
  styleUrls: ['./traitement-dossier.component.scss'],
})
export class TraitementDossierComponent implements OnInit {
  dossierEmail = '';
  documents: TraitementDocument[] = [];

  currentDocument: TraitementDocument | null = null;
  currentIndex = 0;

  readonlyMode = false;
  isViewerLoading = true;
  showFullScreen = false;

  showValidationAnim = false;
  showRejectAnim = false;

  saveLocked = false;

  constructor(
    private router: Router,
    private documentService: DocumentService,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private statusStore: DocumentStatusStoreService
  ) {}

  ngOnInit(): void {
    this.readonlyMode = history.state['readonly'] ?? false;

    const email = history.state['email'];

    if (!email) {
      this.toastr.error('Dossier introuvable.');
      this.router.navigate(['/demand-history']);
      return;
    }

    this.dossierEmail = email;
    this.loadDocs();
  }

  private loadDocs(): void {
    this.documentService.getDocumentsByEmail(this.dossierEmail).subscribe({
      next: (docs) => {
        let mapped = docs.map((d) => this.mapToViewModel(d));

        const overrides = this.statusStore.getOverrides(this.dossierEmail);

        mapped = mapped.map((doc) => {
          const o = overrides[doc.id];
          return o
            ? { ...doc, statusKey: o.statusKey, statusLabel: o.statusLabel }
            : doc;
        });

        this.documents = mapped;
        this.currentIndex = 0;
        this.setCurrentDocumentSmoothly(mapped[0] ?? null);
      },
      error: () => this.toastr.error('Erreur lors du chargement.'),
    });
  }

  private mapToViewModel(doc: UserDocument): TraitementDocument {
    const url = this.documentService.getDownloadUrl(doc.id!, false);
    const { typeLabel } = this.mapType(doc.type);
    const { statusKey, statusLabel } = this.mapStatus(doc.status);

    return {
      id: doc.id!,
      typeLabel,
      fileName: doc.originalFileName,
      statusKey,
      statusLabel,
      url,
      safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url),
    };
  }

  private mapType(type: documentType) {
    switch (type) {
      case 'PIECE_IDENTITE':
        return { typeLabel: "Pièce d'identité" };
      case 'AVIS_IMPOSITION':
        return { typeLabel: 'Avis d’imposition' };
      default:
        return { typeLabel: 'Justificatif de domicile' };
    }
  }

  private mapStatus(status: documentStatus): {
    statusKey: StatusKey;
    statusLabel: string;
  } {
    switch (status) {
      case 'UPLOADED':
        return { statusKey: 'uploaded', statusLabel: 'Téléversé' };
      case 'UNDER_REVIEW':
        return { statusKey: 'under-review', statusLabel: 'En revue' };
      case 'VALIDATED':
        return { statusKey: 'validated', statusLabel: 'Validé' };
      case 'REJECTED':
        return { statusKey: 'rejected', statusLabel: 'Rejeté' };
      default:
        return { statusKey: 'pending-upload', statusLabel: 'En attente' };
    }
  }

  private setCurrentDocumentSmoothly(doc: TraitementDocument | null) {
    this.isViewerLoading = true;
    this.currentDocument = null;
    setTimeout(() => (this.currentDocument = doc), 80);
  }

  onViewerLoaded() {
    this.isViewerLoading = false;
  }

  isPdf(file?: string): boolean {
    return !!file && /\.pdf$/i.test(file);
  }

  isImage(file?: string): boolean {
    return !!file && /\.(jpg|jpeg|png)$/i.test(file);
  }

  prevDocument() {
    if (this.currentIndex === 0) return;
    this.currentIndex--;
    this.setCurrentDocumentSmoothly(this.documents[this.currentIndex]);
  }

  nextDocument() {
    if (this.currentIndex >= this.documents.length - 1) return;
    this.currentIndex++;
    this.setCurrentDocumentSmoothly(this.documents[this.currentIndex]);
  }

  openFullScreen(doc: TraitementDocument) {
    this.currentDocument = doc;
    this.showFullScreen = true;
  }

  closeFullScreen() {
    this.showFullScreen = false;
  }

  downloadDocument(doc: TraitementDocument) {
    const a = document.createElement('a');
    a.href = this.documentService.getDownloadUrl(doc.id, true);
    a.download = doc.fileName;
    a.click();
  }

  printDocument(doc: TraitementDocument) {
    const w = window.open(doc.url, '_blank');
    if (!w) return;

    const interval = setInterval(() => {
      try {
        w.print();
        clearInterval(interval);
      } catch {}
    }, 500);
  }

  openInNewTab(doc: TraitementDocument) {
    window.open(doc.url, '_blank');
  }

  validateDocument() {
    if (this.readonlyMode || !this.currentDocument) return;

    this.updateLocalStatus('validated', 'Validé');
    this.showValidationAnim = true;
    setTimeout(() => (this.showValidationAnim = false), 650);
  }

  rejectDocument() {
    if (this.readonlyMode || !this.currentDocument) return;

    this.updateLocalStatus('rejected', 'Rejeté');
    this.showRejectAnim = true;
    setTimeout(() => (this.showRejectAnim = false), 650);
  }

  private updateLocalStatus(statusKey: StatusKey, label: string) {
    if (!this.currentDocument) return;

    this.currentDocument.statusKey = statusKey;
    this.currentDocument.statusLabel = label;

    const idx = this.documents.findIndex((d) => d.id === this.currentDocument!.id);
    if (idx !== -1) {
      this.documents[idx].statusKey = statusKey;
      this.documents[idx].statusLabel = label;
    }

    this.statusStore.setStatus(this.dossierEmail, this.currentDocument.id, statusKey, label);
  }

  saveProgress() {
    if (this.readonlyMode || !this.allDocsTreated) return;

    const payload = {
      documents: this.documents.map((d) => ({
        id: d.id,
        status: d.statusKey.toUpperCase(),
      })),
    };

    this.documentService.updateStatuses(payload.documents).subscribe({
      next: () => {
        this.statusStore.clearEmail(this.dossierEmail);
        this.toastr.success('Modifications enregistrées.');
        this.readonlyMode = true;
      },
      error: () => this.toastr.error("Erreur lors de l'enregistrement"),
    });
  }

  get allDocsTreated(): boolean {
    return this.documents.every(
      (d) => d.statusKey === 'validated' || d.statusKey === 'rejected'
    );
  }

  goBack() {
    this.router.navigate(['/demand-history']);
  }
}
