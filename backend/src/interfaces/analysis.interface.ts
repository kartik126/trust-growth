export interface AnalysisResult {
    trustScore: {
      score: number;
      justification: string;
      transparency: {
        score: number;
        justification: string;
        limitations: string;
      };
    };
    growthScore: {
      score: number;
      justification: string;
      differentiation: {
        score: number;
        justification: string;
        limitations: string;
      };
    };
    summary: string;
    context: {
      industry: string;
      companySize: string;
      dataQuality: string;
    };
    metadata: {
      companyName: string;
      analysisDate: string;
      dataSources: {
        type: string;
        name: string;
        url?: string;
        timestamp: string;
      }[];
    };
  }