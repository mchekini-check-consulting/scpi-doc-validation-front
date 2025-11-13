export type documentStatus =
  | 'PENDING_UPLOAD'
  | 'UPLOADED'
  | 'UNDER_REVIEW'
  | 'VALIDATED'
  | 'REJECTED';

export type documentType =
  | 'AVIS_IMPOSITION'
  | 'PIECE_IDENTITE'
  | 'JUSTIFICATIF_DOMICILE';

export interface UserDocument {
  id: string | null;
  userEmail: string;
  fullName: string;
  type: documentType;
  status: documentStatus;
  originalFileName: string;
  storedFileName: string;
  bucketName: string;
  uploadedAt: string;
  lastUpdatedAt: string;
}

export type StatusKey =
  | 'pending-upload'
  | 'uploaded'
  | 'under-review'
  | 'validated'
  | 'rejected';

export type DocumentTypeKey =
  | 'avis-imposition'
  | 'piece-identite'
  | 'justificatif-domicile';

export interface DocumentSubRow {
  typeKey: DocumentTypeKey;
  typeLabel: string;
  statusKey: StatusKey;
  statusLabel: string;
  fileName: string;
  uploadedAt: string;
  lastUpdatedAt: string;
}

export interface DossierRow {
  id: string;
  fullName: string;
  userEmail: string;
  statusKey: StatusKey;
  statusLabel: string;
  docsSummary: string;
  lastUpdatedAt: string;
  documents: DocumentSubRow[];
  selected?: boolean;
}
