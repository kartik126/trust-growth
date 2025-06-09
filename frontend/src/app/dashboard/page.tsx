'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnalysisResult from '@/components/AnalysisResult';
import { AnalysisResult as AnalysisResultType } from '@/types/analysis';

interface StoredAnalysis {
    companyName: string;
    result: AnalysisResultType;
}

export default function Dashboard() {
    const router = useRouter();
    const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);

    useEffect(() => {
        // Load analyses from localStorage on component mount
        const storedAnalyses = localStorage.getItem('analyses');
        if (storedAnalyses) {
            setAnalyses(JSON.parse(storedAnalyses));
        }
    }, []);

    const handleNewAnalysis = () => {
        // Clear stored analyses
        localStorage.removeItem('analyses');
        setAnalyses([]);
        // Navigate to analysis page
        router.push('/');
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Company Comparison</h1>
                <button
                    onClick={handleNewAnalysis}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    New Analysis
                </button>
            </div>

            {analyses.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">No analyses available. Start by analyzing companies.</p>
                </div>
            ) : (
                <>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {analyses.map((analysis, index) => (
                        <AnalysisResult
                            key={index}
                            result={analysis.result}
                            companyName={analysis.companyName}
                        />
                    ))}
                </div>
                  <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Summary Comparison</h1>
              </div>
              </>
            )}
        </div>
    );
} 