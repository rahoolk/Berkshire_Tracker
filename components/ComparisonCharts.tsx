
import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { BarChartData, PieChartData } from '../types';

interface ComparisonChartsProps {
  barChartData: BarChartData[];
  pieChartData1: PieChartData[];
  pieChartData2: PieChartData[];
  labels: { q1: string; q2: string };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const q1Value = payload.find((p: any) => p.dataKey === label.q1)?.value;
    const q2Value = payload.find((p: any) => p.dataKey === label.q2)?.value;

    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-md text-sm">
        <p className="font-bold text-slate-800">{`${data.name} (${data.ticker})`}</p>
        {q1Value !== undefined && <p className="text-blue-600">{`${label.q1}: ${q1Value.toFixed(2)}%`}</p>}
        {q2Value !== undefined && <p className="text-sky-600">{`${label.q2}: ${q2Value.toFixed(2)}%`}</p>}
      </div>
    );
  }
  return null;
};

const PieCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-slate-200 rounded-lg shadow-md text-sm">
          <p>{`${payload[0].name}: ${payload[0].value.toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };

const ComparisonCharts: React.FC<ComparisonChartsProps> = ({ barChartData, pieChartData1, pieChartData2, labels }) => {
  return (
    <section className="space-y-8">
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Top Holdings Weight Comparison</h3>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={barChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="ticker" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(tick) => `${tick}%`} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip label={labels}/>} />
              <Legend />
              <Bar dataKey={labels.q1} fill="#3B82F6" name={labels.q1} />
              <Bar dataKey={labels.q2} fill="#60A5FA" name={labels.q2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Portfolio Composition ({labels.q1})</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie data={pieChartData1} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieChartData1.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip content={<PieCustomTooltip />} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Portfolio Composition ({labels.q2})</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie data={pieChartData2} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieChartData2.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip content={<PieCustomTooltip />} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonCharts;
