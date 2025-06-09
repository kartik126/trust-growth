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
Create a `.env` file in the `backend` directory with:
```
PORT=8000
OPENAI_API_KEY=your_openai_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
NODE_ENV=development
```

### Frontend (.env.local)
Create a `.env.local` file in the `frontend` directory with:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## Local Development Setup

### Step 1: Clone and Install Dependencies
```bash
# Clone the repository (if you haven't already)
git clone https://github.com/kartik126/trust-growth.git

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Start the Backend Server
```bash
# Navigate to backend directory
cd backend

# Build the TypeScript code
npm run build

# Start the development server
npm run dev
```
The backend server should now be running at http://localhost:8000

### Step 3: Start the Frontend Development Server
```bash
# Open a new terminal
# Navigate to frontend directory
cd frontend

# Start the Next.js development server
npm run dev
```
The frontend application should now be running at http://localhost:3000

### Step 4: Verify the Setup
1. Open http://localhost:3000 in your browser
2. You should see the Trust & Growth Analysis dashboard
3. The backend API should be accessible at http://localhost:8000/api

## Troubleshooting

### Common Issues
1. **Port Conflicts**
   - If port 8000 is in use, change the PORT in backend/.env
   - If port 3000 is in use, Next.js will automatically use the next available port

2. **API Connection Issues**
   - Verify both servers are running
   - Check that NEXT_PUBLIC_API_BASE_URL in frontend/.env.local matches your backend URL
   - Ensure your API keys are correctly set in backend/.env

3. **Build Errors**
   - Clear node_modules and reinstall:
     ```bash
     rm -rf node_modules
     npm install
     ```
   - Check TypeScript compilation:
     ```bash
     npm run build
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
