import FirecrawlApp from '@mendable/firecrawl-js';
import { config } from '../config/config';

const MAX_RETRIES = 4;
const RETRY_DELAY = 5000; // 5 seconds

interface FirecrawlResponse {
  success: boolean;
  status: string;
  completed: number;
  total: number;
  creditsUsed: number;
  expiresAt: string;
  data: Array<{
    markdown?: string;
    html?: string;
  }>;
  error?: string;
}

interface ScrapeResponse {
  success: boolean;
  content: string;
  error?: string;
}

type FirecrawlFormat = 'markdown' | 'html' | 'rawHtml' | 'content' | 'links' | 'screenshot' | 'screenshot@fullPage' | 'extract' | 'json' | 'changeTracking';

export class ScraperService {
  private readonly app: FirecrawlApp;

  constructor() {
    const apiKey = config.firecrawl.apiKey;
    if (!apiKey) {
      throw new Error('Firecrawl API key is not configured');
    }
    this.app = new FirecrawlApp({ apiKey });
  }

  /**
   * Crawl content from a URL using Firecrawl SDK with retry logic
   */
  async crawlContent(url: string, retryCount = 0): Promise<ScrapeResponse> {
    try {
      const params = {
        limit: 1, // Limit to single page since we're using it for single URL
        scrapeOptions: {
          formats: ['markdown' as FirecrawlFormat],
          onlyMainContent: true
        }
      };

      console.log(`Attempting to crawl URL: ${url} (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
      console.log('Using params:', JSON.stringify(params, null, 2));
      
      const result = await this.app.crawlUrl(url, params) as FirecrawlResponse;
      console.log('Raw Firecrawl response:', JSON.stringify(result, null, 2));

      if (!result.success) {
        throw new Error(`Failed to crawl: ${result.error}`);
      }

      // Extract content from the first item in data array
      const firstPage = result.data[0];
      if (!firstPage) {
        throw new Error('No data received from crawling');
      }

      const markdownContent = firstPage.markdown;
      const htmlContent = firstPage.html;

      console.log('Available content types:', {
        hasMarkdown: !!markdownContent,
        hasHtml: !!htmlContent,
        markdownLength: markdownContent?.length || 0,
        htmlLength: htmlContent?.length || 0
      });

      // Try different content types in order of preference
      const finalContent = markdownContent || htmlContent;
      
      if (!finalContent) {
        console.error('No content found in any format:', result);
        throw new Error('No content received from crawling');
      }

      // Validate content length
      if (finalContent.length < 100) {
        console.warn('Crawled content is very short, might be incomplete');
        if (retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAY * Math.pow(2, retryCount);
          console.log(`Content too short, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.crawlContent(url, retryCount + 1);
        }
      }

      console.log(`Successfully crawled URL: ${url}, content length: ${finalContent.length}`);
      
      // Return the expected format
      return {
        success: true,
        content: finalContent,
        error: undefined
      };
    } catch (error) {
      console.error(`Crawling error (Attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error);

      // Check if we should retry
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Retrying in ${delay}ms... (Total wait time: ${delay/1000}s)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.crawlContent(url, retryCount + 1);
      }

      // If we've exhausted retries, throw a more detailed error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const statusCode = (error as any)?.statusCode || 500;
      throw new Error(`Crawling failed after ${MAX_RETRIES + 1} attempts. Status: ${statusCode}. Error: ${errorMessage}`);
    }
  }

  /**
   * Validate URL before crawling
   */
  private validateUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      // Check if URL has a valid protocol
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        console.error('Invalid URL protocol:', parsedUrl.protocol);
        return false;
      }
      // Check if URL has a hostname
      if (!parsedUrl.hostname) {
        console.error('URL missing hostname');
        return false;
      }
      return true;
    } catch (error) {
      console.error('URL validation error:', error);
      return false;
    }
  }

  /**
   * Crawl content with URL validation
   */
  async scrapeUrl(url: string): Promise<ScrapeResponse> {
    if (!this.validateUrl(url)) {
      throw new Error('Invalid URL format. Please provide a valid HTTP/HTTPS URL with a hostname.');
    }

    return this.crawlContent(url);
  }
} 