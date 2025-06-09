import { Router, Request, Response, RequestHandler } from 'express';
import { ScraperService } from '../services/scraper.service';

const router = Router();
const scraperService = new ScraperService();

/**
 * @route POST /api/scrape
 * @desc Scrape content from a single URL
 * @access Public
 */
router.post('/', (async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body;

    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    const result = await scraperService.crawlContent(url);
    res.json(result);
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({
      error: 'Failed to scrape content',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}) as RequestHandler);

export default router; 