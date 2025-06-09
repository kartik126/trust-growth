'use client';

import { useState, useEffect } from 'react';
import { useAnalysisStore } from '@/store/analysisStore';
import { useRouter } from 'next/navigation';
import { AnalyzeService } from '@/services/analyze.service';

type DataSource = {
  type: 'pdf' | 'web';
  name: string;
  url?: string;
};

type Toast = {
  id: number;
  message: string;
  type: 'success' | 'error';
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingState, setLoadingState] = useState<'idle' | 'scraping' | 'analyzing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const addCompany = useAnalysisStore((state) => state.addCompany);
  const router = useRouter();
  const analyzeService = new AnalyzeService();

  // Load current step from localStorage on component mount
  useEffect(() => {
    const storedAnalyses = analyzeService.getStoredAnalyses();
    if (storedAnalyses.length === 1) {
      setCurrentStep(2);
      addToast('Please analyze the second company', 'success');
    }
  }, []);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const analyzeCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!file && !websiteUrl) || !companyName) return;

    setLoading(true);
    setError(null);

    try {
      let content = '';
      let dataSources: DataSource[] = [];

      // Handle PDF upload if file exists
      if (file) {
        setLoadingState('analyzing');
        content = await analyzeService.processPDF(file);
        dataSources = [{ type: 'pdf', name: file.name }];
      }

      // Handle web scraping if URL exists
      if (websiteUrl) {
        setLoadingState('scraping');
        content = await analyzeService.scrapeWebsite(websiteUrl);
        dataSources = [{ type: 'web', name: websiteUrl, url: websiteUrl }];
      }

      // Ensure we have content before proceeding
      if (!content) {
        throw new Error('No content available for analysis');
      }

      setLoadingState('analyzing');
      const result = await analyzeService.analyzeCompany(content, companyName, dataSources);
      addCompany(result);
      analyzeService.storeAnalysis(companyName, result);

      // Show success toast
      addToast(`Successfully analyzed ${companyName}`, 'success');

      // Clear form
      setFile(null);
      setCompanyName('');
      setWebsiteUrl('');

      if (currentStep === 1) {
        // Move to step 2
        setCurrentStep(2);
        addToast('Please analyze the second company', 'success');
      } else {
        // Both companies analyzed, redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      if (error instanceof Error) {
        setError(error.message);
        addToast(error.message, 'error');
      } else {
        setError('An unexpected error occurred');
        addToast('An unexpected error occurred', 'error');
      }
    } finally {
      setLoading(false);
      setLoadingState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast Container */}
        <div className="fixed top-4 right-4 z-50 space-y-4">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`${
                toast.type === 'success' ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
              } border-l-4 p-4 rounded shadow-lg transition-all duration-300 ease-in-out`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  {toast.type === 'success' ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${toast.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                    {toast.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Company Comparison Analysis</h2>
              <p className="mt-2 text-sm text-gray-500">
                Analyze two companies to compare their trust and growth scores
              </p>
            </div>

            {/* Step Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-center">
                <div className="flex items-center">
                  <div className="flex items-center relative">
                    <div className={`rounded-full h-8 w-8 py-1 px-3 ${
                      currentStep === 1 ? 'bg-indigo-600' : 'bg-gray-300'
                    } text-white font-medium`}>
                      1
                    </div>
                  </div>
                  <div className="flex-auto border-t-2 transition duration-500 ease-in-out border-indigo-600"></div>
                </div>
                <div className="flex items-center">
                  <div className={`rounded-full h-8 w-8 py-1 px-3 ${
                    currentStep === 2 ? 'bg-indigo-600' : 'bg-gray-300'
                  } text-white font-medium`}>
                    2
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={analyzeCompany} className="space-y-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="py-2 px-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter company name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-sm text-gray-500">OR</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="relative">
                    <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Report (PDF)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file"
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                setFile(e.target.files?.[0] || null);
                                if (e.target.files?.[0]) {
                                  setWebsiteUrl('');
                                }
                              }}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF up to 10MB</p>
                      </div>
                    </div>
                    {file && (
                      <div className="mt-2 text-sm text-gray-500">
                        Selected file: {file.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL
                    </label>
                    <div className="mt-1">
                      <input
                        type="url"
                        id="websiteUrl"
                        value={websiteUrl}
                        onChange={(e) => {
                          setWebsiteUrl(e.target.value);
                          if (e.target.value) {
                            setFile(null);
                          }
                        }}
                        placeholder="https://example.com"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      {currentStep === 1 
                        ? "You'll need to analyze two companies to see the comparison. After analyzing the first company, you'll be prompted to analyze the second one."
                        : "This is the second company. After analyzing this company, you'll be redirected to see the comparison."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading || (!file && !websiteUrl)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {loadingState === 'scraping' ? 'Scraping website...' : 
                       loadingState === 'analyzing' ? 'Analyzing content...' : 
                       'Processing...'}
                    </>
                  ) : (
                    `Analyze ${currentStep === 1 ? 'First' : 'Second'} Company`
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
