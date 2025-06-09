import PDFParser from 'pdf2json';
import { Readable } from 'stream';
import { PDFContent, PDFMetadata, PDFProcessingOptions, PDFSection } from '../interfaces/pdf.interface';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class PDFService {
  /**
   * Process a PDF file using pdf2json
   */
  async processPDF(buffer: Buffer): Promise<PDFContent> {
    try {
      // Create a temporary file
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `temp-${Date.now()}.pdf`);
      
      // Write buffer to temporary file
      await fs.promises.writeFile(tempFilePath, buffer);

      // Parse the PDF using pdf2json
      const parsedText = await this.parsePDF(tempFilePath);

      // Clean up temporary file
      await fs.promises.unlink(tempFilePath);

      // Create basic metadata
      const metadata: PDFMetadata = {
        title: 'Document',
        pageCount: this.countPages(parsedText),
        fileSize: buffer.length
      };

      return {
        text: parsedText,
        metadata,
        sections: this.extractSections(parsedText)
      };
    } catch (error) {
      throw new Error(`PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process a PDF from a stream
   */
  async processPDFFromStream(stream: Readable): Promise<PDFContent> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);
    return this.processPDF(buffer);
  }

  private parsePDF(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const pdfParser = new (PDFParser as any)(null, 1);

      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(errData.parserError);
      });

      pdfParser.on('pdfParser_dataReady', () => {
        resolve((pdfParser as any).getRawTextContent());
      });

      pdfParser.loadPDF(filePath);
    });
  }

  private extractSections(text: string): PDFSection[] {
    const sections: PDFSection[] = [];
    const lines = text.split('\n');
    let currentSection: PDFSection | null = null;
    let pageNumber = 1;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Simple section detection: lines ending with colon
      if (trimmedLine.endsWith(':')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmedLine,
          content: '',
          pageNumber
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }

      // Page number detection
      if (line.includes('Page') && line.includes('of')) {
        pageNumber++;
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  private countPages(text: string): number {
    const pageMatches = text.match(/Page\s+\d+\s+of\s+\d+/g);
    return pageMatches ? pageMatches.length : 1;
  }
} 