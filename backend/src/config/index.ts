import dotenv from 'dotenv';

dotenv.config();

export const config = {
  firecrawl: {
    apiKey: process.env.FIRECRAWL_API_KEY || '',
  },
  server: {
    port: process.env.PORT || 3000,
  }
}; 