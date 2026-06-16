export type DocumentType = 'pdf' | 'word' | 'doc' | 'docx' | 'txt' | 'unknown';
export type DocumentSource =
  | 'upload'
  | 'app'
  | 'email'
  | 'web_app'
  | 'mobile_app'
  | 'phone_app';
export type ProcessingStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
}

export interface Document {
  id: number;
  filename: string;
  size: number;
  mime_type: string;
  doc_type: DocumentType;
  source: DocumentSource;
  uploaded_at: string;
  processing_progress: number;
  processing_status: ProcessingStatus;
  processing_result: string | null;
  candidate?: Candidate | null;
  uploaded_by: {
    id: number;
    name: string;
  };
  company: string;
}

export interface DocumentUploadRequest {
  filename: string;
  size: number;
  mime_type: string;
  doc_type: DocumentType;
  source: DocumentSource;
  uploaded_at: string;
  processing_progress: number;
  processing_status: ProcessingStatus;
  processing_result: string;
}

export interface DocumentListResponse {
  success: boolean;
  time: string;
  message: string;
  total_documents: number;
  offset: number;
  limit: number;
  documents: Document[];
}

export interface DocumentResponse {
  success: boolean;
  time: string;
  message: string;
  document: Document;
}
