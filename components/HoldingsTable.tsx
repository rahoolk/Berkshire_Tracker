
import React, { useState, useMemo } from 'react';
import type { ComparisonHolding } from '../types';
import { UpArrowIcon, DownArrowIcon, SortIcon, SortUpIcon, SortDownIcon } from './icons';

interface HoldingsTableProps {
  holdings: ComparisonHolding[];
  labels: { q1: string; q2: string };
}

type SortKey = keyof ComparisonHolding;
type SortDirection = 'asc' | 'desc';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value * 1000);
};

const StatusBadge: React.FC<{ status: ComparisonHolding['status'] }> = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    const statusMap = {
        'Increased': "bg-green-100 text-green-800",
        'Decreased': "bg-red-100 text-red-800",
        'Unchanged': "bg-slate-100 text-slate-800",
        'New': "bg-blue-100 text-blue-800",
        'Sold': "bg-yellow-100 text-yellow-800",
    };
    return <span className={`${baseClasses} ${statusMap[status]}`}>{status}</span>;
}

const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings, labels }) => {
  const [sortKey, setSortKey] = useState<SortKey>('value1');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedHoldings = useMemo(() => {
    return [...holdings].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });
  }, [holdings, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };
  
  const SortableHeader: React.FC<{ sortKey: SortKey, label: string, className?: string }> = ({ sortKey: key, label, className }) => {
    const isSorting = sortKey === key;
    const Icon = isSorting ? (sortDirection === 'desc' ? SortDownIcon : SortUpIcon) : SortIcon;
    return (
        <th className={`p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer ${className}`} onClick={() => handleSort(key)}>
            <div className="flex items-center gap-1">
                {label}
                <Icon className="h-4 w-4" />
            </div>
        </th>
    )
  }

  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6">
             <h3 className="text-lg font-bold text-slate-800">Holdings Details</h3>
        </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <SortableHeader sortKey="name" label="Company" className="min-w-[200px]" />
              <SortableHeader sortKey="value1" label={`Value (${labels.q1})`} />
              <SortableHeader sortKey="percent1" label={`% Port (${labels.q1})`} />
              <SortableHeader sortKey="valueChange" label="Value Change ($)" />
              <SortableHeader sortKey="percentChange" label="Port. Change (%)" />
              <SortableHeader sortKey="status" label="Status" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sortedHoldings.map((h) => (
              <tr key={h.cusip} className="hover:bg-slate-50">
                <td className="p-3 text-sm text-slate-900 whitespace-nowrap">
                    <div className="font-bold">{h.name}</div>
                    <div className="text-xs text-slate-500">{h.ticker}</div>
                </td>
                <td className="p-3 text-sm text-slate-600 font-medium whitespace-nowrap">{formatCurrency(h.value1)}</td>
                <td className="p-3 text-sm text-slate-600 whitespace-nowrap">{h.percent1.toFixed(2)}%</td>
                <td className={`p-3 text-sm whitespace-nowrap font-medium ${h.valueChange > 0 ? 'text-green-600' : h.valueChange < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                  <div className="flex items-center">
                     {h.valueChange !== 0 && (h.valueChange > 0 ? <UpArrowIcon className="h-4 w-4 mr-1"/> : <DownArrowIcon className="h-4 w-4 mr-1"/>) }
                     {formatCurrency(Math.abs(h.valueChange))}
                  </div>
                </td>
                <td className={`p-3 text-sm whitespace-nowrap font-medium ${h.percentChange > 0 ? 'text-green-600' : h.percentChange < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                    {h.percentChange.toFixed(2)}%
                </td>
                <td className="p-3 text-sm text-slate-600 whitespace-nowrap"><StatusBadge status={h.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default HoldingsTable;
