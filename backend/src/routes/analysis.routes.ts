import { Router } from 'express';
import { AnalysisController } from '../controllers/analysis.controller';

const router = Router();
const analysisController = new AnalysisController();

/**
 * @route POST /api/analysis
 * @desc Analyze a single company's content
 * @access Public
 */
router.post('/', (req, res) => analysisController.analyzeCompany(req, res));

export default router; 