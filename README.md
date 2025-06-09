# Trust & Growth Analysis System

A comprehensive system for analyzing and comparing companies based on their trust and growth metrics, with a focus on Swedish publicly traded companies.

## Features

- Company analysis using annual reports and web data
- Trust and Growth scoring system
- Detailed metrics and justifications
- Company comparison dashboard
- PDF and web content processing
- Caching system for improved performance
- Real-time analysis updates

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key
- Firecrawl API key

## Environment Variables

### Backend (.env)
```
PORT=8000
OPENAI_API_KEY=your_openai_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## Installation

### Backend
```bash
cd backend
npm install
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Analysis
- `POST /api/analysis` - Analyze a company
  - Body: `{ content: string, metadata: { companyName: string, dataSources: Array } }`

### Summary
- `POST /api/summary/compare` - Compare two company analyses
  - Body: `{ company1: AnalysisResult, company2: AnalysisResult }`

## Technologies Used

### Frontend
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- OpenAI API

### Backend
- Node.js
- Express
- TypeScript
- OpenAI API
- Firecrawl API
- Node Cache

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```