
import React from 'react';
import { RefreshIcon } from './icons';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center">
      <RefreshIcon className="h-12 w-12 text-blue-600 animate-spin" />
      <p className="mt-4 text-lg font-semibold text-slate-700">Fetching latest filings...</p>
      <p className="text-sm text-slate-500">Gemini is analyzing the data, please wait.</p>
    </div>
  );
};

export default LoadingSpinner;
