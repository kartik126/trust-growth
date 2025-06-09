import { Router } from 'express';
import pdfRoutes from './pdf.routes';
import scraperRoutes from './scraper.routes';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// PDF routes
router.use('/pdf', pdfRoutes);

// Scraper routes
router.use('/scrape', scraperRoutes);

export default router; 