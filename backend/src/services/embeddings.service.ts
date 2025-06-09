import OpenAI from 'openai';
import { config } from '../config/config';
import { chunk } from 'lodash';

const CHUNK_SIZE = 1000; // characters per chunk
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export class EmbeddingsService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  /**
   * Get embeddings from OpenAI with retry logic
   */
  private async getEmbeddings(text: string, retryCount = 0): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return this.getEmbeddings(text, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Process content in chunks to handle large documents
   */
  async processContentInChunks(content: string): Promise<number[]> {
    // Split content into chunks of characters
    const contentChunks = chunk(content.split(''), CHUNK_SIZE).map(chars => chars.join(''));
    const chunkEmbeddings = await Promise.all(
      contentChunks.map(chunk => this.getEmbeddings(chunk))
    );
    
    // Combine embeddings (simple average)
    return chunkEmbeddings[0].map((_, i) => 
      chunkEmbeddings.reduce((sum, embedding) => sum + embedding[i], 0) / chunkEmbeddings.length
    );
  }
} 