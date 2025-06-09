import { AnalysisResult } from '@/types/analysis';

export class SummaryService {
    private static instance: SummaryService;
    private baseUrl: string;

    private constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    }

    public static getInstance(): SummaryService {
        if (!SummaryService.instance) {
            SummaryService.instance = new SummaryService();
        }
        return SummaryService.instance;
    }

    async getComparisonSummary(company1: AnalysisResult, company2: AnalysisResult): Promise<string> {
        try {
            const response = await fetch(`${this.baseUrl}/summary/compare`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    company1,
                    company2,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch summary');
            }

            const data = await response.json();
            return data.summary;
        } catch (error) {
            console.error('Error fetching summary:', error);
            throw error;
        }
    }
}
