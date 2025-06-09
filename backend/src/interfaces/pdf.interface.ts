export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creationDate?: Date;
  modificationDate?: Date;
  pageCount: number;
  fileSize: number;
}

export interface PDFContent {
  text: string;
  metadata: PDFMetadata;
  sections: PDFSection[];
}

export interface PDFSection {
  title: string;
  content: string;
  pageNumber: number;
}

export interface PDFProcessingOptions {
  extractMetadata?: boolean;
  extractSections?: boolean;
  maxPages?: number;
  password?: string;
  cacheResults?: boolean;
} 