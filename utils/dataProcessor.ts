
import type { GeminiResponse, QuarterData, ComparisonHolding, ProcessedData, BarChartData, PieChartData, SummaryData } from '../types';

const PIE_CHART_COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#1D4ED8', '#1E40AF', '#1E3A8A'];
const TOP_N_BAR_CHART = 15;
const TOP_N_PIE_CHART = 6;

export function processGeminiResponse(rawData: GeminiResponse): ProcessedData {
    const calculatePercentages = (quarter: QuarterData): QuarterData => {
        quarter.holdings.forEach(h => {
            h.percentage = (h.value / quarter.totalValue) * 100;
        });
        quarter.holdings.sort((a, b) => b.value - a.value);
        return quarter;
    };

    const q1 = calculatePercentages(rawData.quarter1);
    const q2 = calculatePercentages(rawData.quarter2);

    const allHoldings = new Map<string, Partial<ComparisonHolding>>();

    q1.holdings.forEach(h => {
        allHoldings.set(h.cusip, {
            name: h.name,
            ticker: h.ticker || 'N/A',
            cusip: h.cusip,
            value1: h.value,
            shares1: h.shares,
            percent1: h.percentage,
        });
    });

    q2.holdings.forEach(h => {
        const existing = allHoldings.get(h.cusip);
        if (existing) {
            allHoldings.set(h.cusip, {
                ...existing,
                value2: h.value,
                shares2: h.shares,
                percent2: h.percentage,
            });
        } else {
            allHoldings.set(h.cusip, {
                name: h.name,
                ticker: h.ticker || 'N/A',
                cusip: h.cusip,
                value2: h.value,
                shares2: h.shares,
                percent2: h.percentage,
            });
        }
    });

    const comparisonHoldings: ComparisonHolding[] = Array.from(allHoldings.values()).map(h => {
        const v1 = h.value1 ?? 0;
        const v2 = h.value2 ?? 0;
        const p1 = h.percent1 ?? 0;
        
        let status: 'New' | 'Sold' | 'Increased' | 'Decreased' | 'Unchanged' = 'Unchanged';
        if (v1 > 0 && v2 === 0) status = 'New';
        else if (v1 === 0 && v2 > 0) status = 'Sold';
        else if (v1 > v2) status = 'Increased';
        else if (v1 < v2) status = 'Decreased';

        return {
            name: h.name!,
            ticker: h.ticker!,
            cusip: h.cusip!,
            value1: v1,
            shares1: h.shares1 ?? 0,
            percent1: p1,
            value2: v2,
            shares2: h.shares2 ?? 0,
            percent2: h.percent2 ?? 0,
            valueChange: v1 - v2,
            percentChange: p1 - (h.percent2 ?? 0),
            status: status,
        };
    }).sort((a, b) => b.value1 - a.value1);

    const topMovers = [...comparisonHoldings]
        .sort((a, b) => Math.abs(b.valueChange) - Math.abs(a.valueChange))
        .slice(0, 5);

    const summary: SummaryData = {
        labels: { q1: q1.label, q2: q2.label },
        totalValue1: q1.totalValue,
        totalValue2: q2.totalValue,
        topMovers,
    };

    const topHoldingsForBarChart = comparisonHoldings.slice(0, TOP_N_BAR_CHART);
    const barChartData: BarChartData[] = topHoldingsForBarChart.map(h => ({
        name: h.name,
        ticker: h.ticker,
        [q1.label]: h.percent1,
        [q2.label]: h.percent2,
    }));

    const createPieData = (holdings: ComparisonHolding[], quarterKey: 'percent1' | 'percent2'): PieChartData[] => {
        const top = holdings.slice(0, TOP_N_PIE_CHART);
        const otherValue = holdings.slice(TOP_N_PIE_CHART).reduce((acc, curr) => acc + (curr[quarterKey] || 0), 0);
        
        const pieData = top.map((h, index) => ({
            name: h.ticker,
            value: h[quarterKey],
            fill: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
        }));

        if (otherValue > 0) {
            pieData.push({
                name: 'Other',
                value: otherValue,
                fill: '#94A3B8', // slate-400
            });
        }
        return pieData;
    };

    const pieChartData1 = createPieData(comparisonHoldings.filter(h => h.percent1 > 0).sort((a,b) => b.percent1 - a.percent1), 'percent1');
    const pieChartData2 = createPieData(comparisonHoldings.filter(h => h.percent2 > 0).sort((a,b) => b.percent2 - a.percent2), 'percent2');

    return {
        summary,
        comparisonHoldings,
        barChartData,
        pieChartData1,
        pieChartData2,
    };
}
