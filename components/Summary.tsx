
import React from 'react';
import type { SummaryData } from '../types';
import { UpArrowIcon, DownArrowIcon } from './icons';

interface SummaryProps {
  summary: SummaryData;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value * 1000); // value is in thousands
};

const formatCurrencyShorthand = (value: number) => {
    const fullValue = value * 1000;
    if (fullValue >= 1_000_000_000) {
        return `${(fullValue / 1_000_000_000).toFixed(2)}B`;
    }
    if (fullValue >= 1_000_000) {
        return `${(fullValue / 1_000_000).toFixed(2)}M`;
    }
    return formatCurrency(value);
};

const SummaryCard: React.FC<{ title: string; value: number; change?: number }> = ({ title, value, change }) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200 flex-1">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-semibold text-slate-800">{formatCurrency(value)}</p>
        {change !== undefined && (
            <p className={`flex items-center text-sm font-medium mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? <UpArrowIcon className="h-4 w-4 mr-1" /> : <DownArrowIcon className="h-4 w-4 mr-1" />}
                {formatCurrency(change)}
            </p>
        )}
    </div>
);


const Summary: React.FC<SummaryProps> = ({ summary }) => {
  const valueChange = summary.totalValue1 - summary.totalValue2;

  return (
    <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Quarterly Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard title={`Total Holdings (${summary.labels.q1})`} value={summary.totalValue1} change={valueChange} />
        <SummaryCard title={`Total Holdings (${summary.labels.q2})`} value={summary.totalValue2} />
         <div className="bg-white p-4 rounded-lg border border-slate-200 flex-1 md:col-span-1">
            <p className="text-sm text-slate-500 font-medium">Top 5 Movers by Value</p>
             <ul className="mt-2 space-y-1">
                {summary.topMovers.map(mover => (
                    <li key={mover.cusip} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-slate-700">{mover.ticker}</span>
                         <span className={`font-semibold ${mover.valueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {mover.valueChange >= 0 ? '+' : ''}{formatCurrencyShorthand(mover.valueChange)}
                        </span>
                    </li>
                ))}
             </ul>
        </div>
      </div>
       <p className="text-sm text-slate-500">
          The total portfolio value changed by <span className={`font-bold ${valueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(valueChange)}</span> from {summary.labels.q2} to {summary.labels.q1}.
      </p>
    </section>
  );
};

export default Summary;
