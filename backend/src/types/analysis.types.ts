export interface AnalysisResult {
  trustScore: {
    score: number;
    justification: any[];
    transparency: {
      score: number;
      justification: any[];
      limitations: string;
    };
  };
  growthScore: {
    score: number;
    justification: any[];
    differentiation: {
      score: number;
      justification: any[];
      limitations: string;
    };
  };
  summary: string;
  context: {
    industry: string;
    companySize: string;
    region: string;
    dataQuality: string;
  };
  metadata: {
    companyName: string;
    dataSources: any[];
    analysisDate: string;
  };
} 