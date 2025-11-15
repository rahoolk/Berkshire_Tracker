
import React, { useState, useEffect, useCallback } from 'react';
import type { ProcessedData, GroundingSource } from './types';
import { fetchFilingsData } from './services/geminiService';
import { processGeminiResponse } from './utils/dataProcessor';
import Header from './components/Header';
import Summary from './components/Summary';
import ComparisonCharts from './components/ComparisonCharts';
import HoldingsTable from './components/HoldingsTable';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';

export default function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProcessedData | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: rawData, groundingChunks } = await fetchFilingsData();
      const processed = processGeminiResponse(rawData);
      setData(processed);
      setSources(groundingChunks);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred.');
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Header onRefresh={loadData} isLoading={loading} />
        
        {loading && <LoadingSpinner />}
        {error && <ErrorDisplay message={error} onRetry={loadData} />}

        {data && !loading && !error && (
          <main className="space-y-8">
            <Summary summary={data.summary} />
            <ComparisonCharts
              barChartData={data.barChartData}
              pieChartData1={data.pieChartData1}
              pieChartData2={data.pieChartData2}
              labels={data.summary.labels}
            />
            <HoldingsTable 
              holdings={data.comparisonHoldings}
              labels={data.summary.labels}
            />
             {sources.length > 0 && (
              <div className="mt-8 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Data Sources</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {sources.map((source, index) => (
                    <li key={index}>
                      <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                        {source.web.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}
