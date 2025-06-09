import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import pdfRoutes from './routes/pdf.routes';
import scraperRoutes from './routes/scraper.routes';
import analysisRoutes from './routes/analysis.routes';
import summaryRoutes from './routes/summary.routes';

dotenv.config();

const app = express();

// Middleware
app.use(cors());

// Increase payload size limit to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api', routes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/scrape', scraperRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/summary', summaryRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 