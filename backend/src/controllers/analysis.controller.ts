import { Request, Response } from 'express';
import { AnalysisService } from '../services/analysis.service';

export class AnalysisController {
  private analysisService: AnalysisService;

  constructor() {
    this.analysisService = new AnalysisService();
  }

  /**
   * Analyze a single company's content
   */
  async analyzeCompany(req: Request, res: Response): Promise<void> {
    try {
      const { content, companyName, dataSources } = req.body;

      if (!content) {
        res.status(400).json({ error: 'Content is required' });
        return;
      }

      if (!companyName ) {
        res.status(400).json({ error: 'Company name and ticker are required' });
        return;
      }

      if (!dataSources || !Array.isArray(dataSources)) {
        res.status(400).json({ error: 'Data sources must be an array' });
        return;
      }

      const result = await this.analysisService.analyzeCompany(content, {
        companyName,
        dataSources
      });
      res.json(result);
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({
        error: 'Failed to analyze company',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

} 