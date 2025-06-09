import { Router, Request, Response, RequestHandler } from 'express';
import multer from 'multer';
import { PDFService } from '../services/pdf.service';

const router = Router();
const pdfService = new PDFService();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
});

/**
 * @route POST /api/pdf/upload
 * @desc Upload and process a PDF file
 * @access Public
 */
router.post('/upload', upload.single('pdf'), (async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No PDF file uploaded' });
      return;
    }

    const result = await pdfService.processPDF(req.file.buffer);
    res.json(result);
  } catch (error) {
    console.error('PDF processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process PDF',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}) as RequestHandler);

/**
 * @route POST /api/pdf/stream
 * @desc Process a PDF from a stream
 * @access Public
 */
router.post('/stream', (async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.is('application/pdf')) {
      res.status(400).json({ error: 'Content-Type must be application/pdf' });
      return;
    }

    const result = await pdfService.processPDFFromStream(req);
    res.json(result);
  } catch (error) {
    console.error('PDF stream processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process PDF stream',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}) as RequestHandler);

export default router; 