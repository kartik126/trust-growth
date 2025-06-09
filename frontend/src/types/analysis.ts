export interface JustificationItem {
  text: string;
  value: number;
  reference: string;
}

export interface ScoreComponent {
  score: number;
  justification: JustificationItem[];
  limitations?: string;
}

export interface AnalysisResult {
  trustScore: ScoreComponent;
  growthScore: ScoreComponent;
  summary: string;
  context: {
    industry: string;
    companySize: string;
    region: string;
    dataQuality: string;
  };
  metadata: {
    companyName: string;
    ticker: string;
    analysisDate: string;
    dataSources: Array<{
      type: 'pdf' | 'web';
      name: string;
      url?: string;
      timestamp: string;
    }>;
  };
} 