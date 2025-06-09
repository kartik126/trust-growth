import express from 'express';
import { SummaryService } from '../services/summary.service';
import { AnalysisResult } from '../types/analysis.types';

const router = express.Router();
const summaryService = new SummaryService();

router.post('/compare', async (req, res) => {
  try {
    const { company1, company2 } = req.body;

    if (!company1 || !company2) {
      return res.status(400).json({ error: 'Both company analyses are required' });
    }

    const summary = await summaryService.generateComparisonSummary(company1, company2);
    res.json({ summary });
  } catch (error) {
    console.error('Error in summary comparison:', error);
    res.status(500).json({ error: 'Failed to generate comparison summary' });
  }
});

export default router; 