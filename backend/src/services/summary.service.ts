import OpenAI from 'openai';
import { config } from '../config/config';
import { AnalysisResult } from '../types/analysis.types';

export class SummaryService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async generateComparisonSummary(company1: AnalysisResult, company2: AnalysisResult): Promise<string> {
    // Validate input data
    if (!company1 || !company2) {
      throw new Error('Both company analyses are required');
    }

    const prompt = `Compare these two Swedish companies based on their Trust & Growth analysis:

Company 1: ${company1.metadata.companyName}
Trust Score: ${company1.trustScore.score}
Growth Score: ${company1.growthScore.score}
Summary: ${company1.summary}
Industry: ${company1.context.industry}
Data Quality: ${company1.context.dataQuality}

Company 2: ${company2.metadata.companyName}
Trust Score: ${company2.trustScore.score}
Growth Score: ${company2.growthScore.score}
Summary: ${company2.summary}
Industry: ${company2.context.industry}
Data Quality: ${company2.context.dataQuality}

Please provide a detailed comparison focusing on:
1. Overall performance comparison
2. Trust vs Growth balance
3. Key differentiators
4. Potential areas for improvement
5. Strategic recommendations

Format the response in clear sections with bullet points where appropriate.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert business analyst specializing in Swedish companies. Provide clear, actionable insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      return response.choices[0].message.content || 'No comparison generated';
    } catch (error) {
      console.error('Error generating comparison summary:', error);
      throw new Error('Failed to generate comparison summary');
    }
  }
}
