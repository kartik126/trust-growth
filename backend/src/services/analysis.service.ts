import { AnalysisResult } from "../interfaces/analysis.interface";
import { config } from '../config/config';
import NodeCache from 'node-cache';
import OpenAI from 'openai';
import { EmbeddingsService } from './embeddings.service';

// Cache configuration
const CACHE_TTL = 3600; // 1 hour

export class AnalysisService {
  private readonly openai: OpenAI;
  private readonly embeddingsService: EmbeddingsService;
  private cache: NodeCache;
  private processingQueue: Map<string, Promise<AnalysisResult>>;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    this.embeddingsService = new EmbeddingsService();
    this.cache = new NodeCache({ stdTTL: CACHE_TTL });
    this.processingQueue = new Map();
  }

  /**
   * Generate cache key for analysis
   */
  private generateCacheKey(content: string, metadata: any): string {
    const timestamp = new Date().getTime();
    return `analysis:${metadata.companyName}:${Buffer.from(content).toString('base64').slice(0, 32)}:${timestamp}`;
  }

  /**
   * Analyze company content for Trust & Growth metrics
   */
  async analyzeCompany(content: string, metadata: {
    companyName: string;
    dataSources: Array<{
      type: 'pdf' | 'web';
      name: string;
      url?: string;
    }>;
  }): Promise<AnalysisResult> {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(content, metadata);
      const cachedResult = this.cache.get<AnalysisResult>(cacheKey);
      if (cachedResult) {
        console.log('Returning cached result for:', metadata.companyName);
        return cachedResult;
      }

      // Check if analysis is already in progress
      if (this.processingQueue.has(cacheKey)) {
        console.log('Analysis already in progress for:', metadata.companyName);
        return this.processingQueue.get(cacheKey)!;
      }

      // Create new analysis promise
      const analysisPromise = (async () => {
        try {
          // Process content in chunks using embeddings service
          const embeddings = await this.embeddingsService.processContentInChunks(content);
          
          const prompt: string = `
            You are a JSON-only response generator. Analyze the following company content and provide scores (0-100) and justifications for Trust and Growth metrics.
            IMPORTANT: Respond ONLY with valid JSON. Do not include any code, explanations, or other text.

            Company Information:
            Name: ${metadata.companyName}
            Data Sources: ${JSON.stringify(metadata.dataSources)}

            Content to Analyze:
            ${content}

            Important scoring rules:
            1. All scores must be whole numbers between 0 and 100
            2. No decimal points allowed
            3. Higher scores indicate better performance
            4. You MUST use specific numbers and metrics from the content in your justifications
            5. Each score must be broken down into specific components with:
               - A specific text description
               - A numerical value
               - Reference to exact content from the text
            6. Context must be exact and specific:
               - Use the exact industry from the content
               - Use the exact region from the content
               - Use the exact company size from the content
            7. Score consistency rules:
               - Overall scores must be within 10 points of their component averages
               - Component scores must be justified by specific metrics
               - Each component must reference exact numbers or quotes
               - Component scores within the same category should not differ by more than 20 points
            8. Reference requirements:
               - MUST include actual numbers, percentages, or exact quotes from the content
               - If a number is not available, state "No specific numbers available" and adjust score accordingly
               - Never make up or assume numbers
            9. Limitations must be specific:
               - List exact metrics or information that is missing
               - Provide specific examples of what would be needed for a higher score
               - Include industry benchmarks for comparison
            10. Future Strategy:
                - Consider future plans and strategies mentioned in the content
                - Include these in growth potential assessment
                - Weight them appropriately in the scoring

            Required JSON structure:
            {
              "trustScore": {
                "score": number,
                "justification": [
                  {
                    "text": string,
                    "value": number,
                    "reference": string
                  }
                ],
                "transparency": {
                  "score": number,
                  "justification": [
                    {
                      "text": string,
                      "value": number,
                      "reference": string
                    }
                  ],
                  "limitations": string
                }
              },
              "growthScore": {
                "score": number,
                "justification": [
                  {
                    "text": string,
                    "value": number,
                    "reference": string
                  }
                ],
                "differentiation": {
                  "score": number,
                  "justification": [
                    {
                      "text": string,
                      "value": number,
                      "reference": string
                    }
                  ],
                  "limitations": string
                }
              },
              "summary": string,
              "context": {
                "industry": string,
                "companySize": string,
                "region": string,
                "dataQuality": string
              },
              "metadata": {
                "companyName": string,
                "dataSources": [
                  {
                    "type": "pdf" | "web",
                    "name": string,
                    "url": string,
                    "timestamp": string
                  }
                ],
                "analysisDate": string
              }
            }

            Remember: 
            1. Respond ONLY with the JSON object above
            2. Use exact numbers and metrics from the content
            3. Match the region and industry exactly as stated in the content
            4. Consider future strategy in growth assessment
            5. Never make up or assume numbers
          `;

          const response = await this.openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
              {
                role: "system",
                content: "You provide detailed, structured analysis focusing on trust and growth metrics. Always respond with valid JSON, maintaining strict scoring consistency and providing specific references to source material. Use exact numbers from the content and never make assumptions."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 4096,
            response_format: { type: "json_object" }
          });

          const responseContent = response.choices[0]?.message?.content;

          if (!responseContent) {
            throw new Error('No content received from OpenAI');
          }

          try {
            const result = JSON.parse(responseContent) as AnalysisResult;
            
            // Validate and fix metadata
            result.metadata = {
              ...metadata,
              analysisDate: new Date().toISOString(),
              dataSources: metadata.dataSources.map(source => ({
                ...source,
                timestamp: new Date().toISOString()
              }))
            };

            // Validate context matches content
            const contentLines = content.split('\n');
            const industryLine = contentLines.find(line => line.startsWith('Industry:'));
            const regionLine = contentLines.find(line => line.startsWith('Region:'));
            const sizeLine = contentLines.find(line => line.startsWith('Size:'));

            if (industryLine) {
              result.context.industry = industryLine.split('Industry:')[1].trim();
            }
            if (regionLine) {
              result.context.region = regionLine.split('Region:')[1].trim();
            }
            if (sizeLine) {
              result.context.companySize = sizeLine.split('Size:')[1].trim();
            }
            
            // Cache the result
            this.cache.set(cacheKey, result);
            
            return result;
          } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Problematic JSON:', responseContent);
            throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
          }
        } finally {
          // Remove from processing queue
          this.processingQueue.delete(cacheKey);
        }
      })();

      // Add to processing queue
      this.processingQueue.set(cacheKey, analysisPromise);
      
      return analysisPromise;
    } catch (error) {
      console.error('Analysis error:', error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 