import { AnalysisResult } from '@/types/analysis';

type DataSource = {
  type: 'pdf' | 'web';
  name: string;
  url?: string;
};

export class AnalyzeService {
  private readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  /**
   * Analyze a company using PDF or web content
   */
  async analyzeCompany(
    content: string,
    companyName: string,
    dataSources: DataSource[]
  ): Promise<AnalysisResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

      const response = await fetch(`${this.API_BASE_URL}/analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          companyName,
          dataSources,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * Upload and process a PDF file
   */
  async processPDF(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch(`${this.API_BASE_URL}/pdf/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'PDF processing failed');
      }

      const data = await response.json();
      if (!data || !data.text) {
        throw new Error('Invalid PDF response format');
      }

      return data.text;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to process PDF file');
    }
  }

  /**
   * Scrape content from a website URL
   */
  async scrapeWebsite(url: string): Promise<string> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Web scraping failed');
      }

      const data = await response.json();
      if (!data || !data.content) {
        throw new Error('Invalid scraping response format');
      }

      return data.content;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to scrape website');
    }
  }

  /**
   * Store analysis results in localStorage
   */
  storeAnalysis(companyName: string, result: AnalysisResult): void {
    const storedAnalyses = JSON.parse(localStorage.getItem('analyses') || '[]');
    if (storedAnalyses.length >= 2) {
      storedAnalyses.shift();
    }
    storedAnalyses.push({ companyName, result });
    localStorage.setItem('analyses', JSON.stringify(storedAnalyses));
  }

  /**
   * Get stored analyses from localStorage
   */
  getStoredAnalyses(): Array<{ companyName: string; result: AnalysisResult }> {
    return JSON.parse(localStorage.getItem('analyses') || '[]');
  }

  /**
   * Clear stored analyses from localStorage
   */
  clearStoredAnalyses(): void {
    localStorage.removeItem('analyses');
  }
}
