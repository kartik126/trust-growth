import { AnalysisResult as AnalysisResultType } from '@/types/analysis';

interface AnalysisResultProps {
  result: AnalysisResultType;
  companyName: string;
}

export default function AnalysisResult({ result, companyName }: AnalysisResultProps) {
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900">Analysis Results for {companyName}</h3>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="bg-indigo-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-indigo-600 truncate">Trust Score</dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-900">{result.trustScore.score}</dd>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Justification</h4>
                <ul className="mt-2 text-sm text-gray-500 list-disc list-inside">
                  {result.trustScore.justification.map((item, index) => (
                    <li key={index}>{item.text}</li>
                  ))}
                </ul>
                {result.trustScore.limitations && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900">Limitations</h4>
                    <p className="mt-2 text-sm text-gray-500">{result.trustScore.limitations}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-green-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-green-600 truncate">Growth Score</dt>
              <dd className="mt-1 text-3xl font-semibold text-green-900">{result.growthScore.score}</dd>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Justification</h4>
                <ul className="mt-2 text-sm text-gray-500 list-disc list-inside">
                  {result.growthScore.justification.map((item, index) => (
                    <li key={index}>{item.text}</li>
                  ))}
                </ul>
                {result.growthScore.limitations && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900">Limitations</h4>
                    <p className="mt-2 text-sm text-gray-500">{result.growthScore.limitations}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h4 className="text-sm font-medium text-gray-900">Context</h4>
          <dl className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Industry</dt>
              <dd className="mt-1 text-sm text-gray-900">{result.context.industry}</dd>
            </div>
            <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Company Size</dt>
              <dd className="mt-1 text-sm text-gray-900">{result.context.companySize}</dd>
            </div>
            <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Region</dt>
              <dd className="mt-1 text-sm text-gray-900">{result.context.region}</dd>
            </div>
            <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Data Quality</dt>
              <dd className="mt-1 text-sm text-gray-900">{result.context.dataQuality}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-8">
          <h4 className="text-sm font-medium text-gray-900">Summary</h4>
          <p className="mt-2 text-sm text-gray-500">{result.summary}</p>
        </div>
      </div>
    </div>
  );
} 