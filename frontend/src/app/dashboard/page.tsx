'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnalysisResult from '@/components/AnalysisResult';
import { AnalysisResult as AnalysisResultType } from '@/types/analysis';
import { SummaryService } from '@/services/summary.service';

interface StoredAnalysis {
    companyName: string;
    result: AnalysisResultType;
}

export default function Dashboard() {
    const router = useRouter();
    const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);
    const [summary, setSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Load analyses from localStorage on component mount
        const storedAnalyses = localStorage.getItem('analyses');
        if (storedAnalyses) {
            setAnalyses(JSON.parse(storedAnalyses));
        }
    }, []);

    const handleGenerateSummary = async () => {
        if (analyses.length === 2) {
            setIsLoading(true);
            try {
                console.log('Sending data:', {
                    company1: analyses[0].result,
                    company2: analyses[1].result
                });
                const summaryService = SummaryService.getInstance();
                const summaryText = await summaryService.getComparisonSummary(
                    analyses[0].result,
                    analyses[1].result
                );
                setSummary(summaryText);
            } catch (error) {
                console.error('Error fetching summary:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleNewAnalysis = () => {
        localStorage.removeItem('analyses');
        setAnalyses([]);
        setSummary('');
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
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Summary Comparison</h2>
                            {analyses.length === 2 && !summary && !isLoading && (
                                <button
                                    onClick={handleGenerateSummary}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Generate Summary
                                </button>
                            )}
                        </div>
                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                <span className="ml-2">Generating summary...</span>
                            </div>
                        ) : summary ? (
                            <div className="bg-white shadow rounded-lg p-6">
                                <div className="prose max-w-none">
                                    {summary.split('\n').map((line, index) => {
                                        if (line.startsWith('###')) {
                                            return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{line.replace('###', '').trim()}</h3>;
                                        } else if (line.startsWith('-')) {
                                            const content = line.replace('-', '').trim();
                                            return (
                                                <li key={index} className="ml-4">
                                                    {content.split('**').map((part, i) => 
                                                        i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                                                    )}
                                                </li>
                                            );
                                        } else if (line.trim() === '') {
                                            return <div key={index} className="h-2" />;
                                        } else {
                                            const content = line.trim();
                                            return (
                                                <p key={index}>
                                                    {content.split('**').map((part, i) => 
                                                        i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                                                    )}
                                                </p>
                                            );
                                        }
                                    })}
                                </div>
                            </div>
                        ) : analyses.length === 1 ? (
                            <p className="text-gray-500">Analyze the second company to see the comparison summary.</p>
                        ) : null}
                    </div>
                </>
            )}
        </div>
    );
} 