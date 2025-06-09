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
    return `analysis:${metadata.companyName}:${Buffer.from(content).toString('base64').slice(0, 32)}`;
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
            You are a JSON-only response generator. Analyze the following company content embeddings and provide scores (0-100) and justifications for Trust and Growth metrics.
            The embeddings represent the semantic meaning of the content.
            IMPORTANT: Respond ONLY with valid JSON. Do not include any code, explanations, or other text.

            Company Information:
            Name: ${metadata.companyName}
            Data Sources: ${JSON.stringify(metadata.dataSources)}

            Embeddings: ${JSON.stringify(embeddings)}

            Important scoring rules:
            1. All scores must be whole numbers between 0 and 100
            2. No decimal points allowed
            3. Higher scores indicate better performance
            4. Consider the following factors when scoring:
               - Industry standards and norms
               - Company size and maturity
               - Type and format of available information
               - Regional/cultural context (Swedish market)
               - Sustainability and ESG factors
               - Corporate governance practices
            5. Each score must be broken down into specific components with:
               - A specific text description
               - A numerical value
               - Reference to exact content from the text
            6. Context must be exact and specific
            7. Score consistency rules:
               - Overall scores must be within 10 points of their component averages
               - Component scores must be justified by specific metrics
               - Each component must reference exact numbers or quotes
               - Component scores within the same category should not differ by more than 20 points
            8. Reference requirements:
               - NO placeholders like [list of specific risks] or [Exact market share numbers]
               - MUST include actual numbers, percentages, or exact quotes
               - If a number is not available, state "No specific numbers available" and adjust score accordingly
            9. Limitations must be specific:
               - List exact metrics or information that is missing
               - Provide specific examples of what would be needed for a higher score
               - Include industry benchmarks for comparison
            10. Swedish context:
                - Consider Swedish corporate governance standards
                - Account for Swedish sustainability practices
                - Reference Swedish market conditions
                - Consider Swedish regulatory environment

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
                "ticker": string,
                "analysisDate": string,
                "dataSources": [
                  {
                    "type": "pdf" | "web",
                    "name": string,
                    "url": string,
                    "timestamp": string
                  }
                ]
              }
            }

            Remember: Respond ONLY with the JSON object above. No other text, code, or explanations.
          `;

          const response = await this.openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
              {
                role: "system",
                content: "You are a financial analysis expert specializing in Swedish companies. You provide detailed, structured analysis focusing on trust and growth metrics. Always respond with valid JSON, maintaining strict scoring consistency and providing specific references to source material. Consider Swedish corporate governance, sustainability practices, and market conditions in your analysis."
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
            
            // Adding metadata to the result
            result.metadata = {
              ...metadata,
              analysisDate: new Date().toISOString(),
              dataSources: metadata.dataSources.map(source => ({
                ...source,
                timestamp: new Date().toISOString()
              }))
            };
            
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