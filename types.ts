
export interface Holding {
  name: string;
  cusip: string;
  ticker: string;
  value: number; // in thousands
  shares: number;
  percentage?: number;
}

export interface QuarterData {
  label: string;
  filingDate: string;
  totalValue: number; // in thousands
  holdings: Holding[];
}

export interface GeminiResponse {
  quarter1: QuarterData; // Most recent
  quarter2: QuarterData; // Previous
}

export interface ComparisonHolding {
  name: string;
  ticker: string;
  cusip: string;
  value1: number;
  shares1: number;
  percent1: number;
  value2: number;
  shares2: number;
  percent2: number;
  valueChange: number;
  percentChange: number;
  status: 'New' | 'Sold' | 'Increased' | 'Decreased' | 'Unchanged';
}

export interface BarChartData {
  name: string;
  ticker: string;
  [key: string]: string | number; // For quarter labels e.g., Q3 2025: value
}

export interface PieChartData {
  name: string;
  value: number;
  fill: string;
}

export interface SummaryData {
  labels: {
    q1: string;
    q2: string;
  };
  totalValue1: number;
  totalValue2: number;
  topMovers: {
    name: string;
    ticker: string;
    valueChange: number;
  }[];
}

export interface ProcessedData {
  summary: SummaryData;
  comparisonHoldings: ComparisonHolding[];
  barChartData: BarChartData[];
  pieChartData1: PieChartData[];
  pieChartData2: PieChartData[];
}

export interface GroundingSource {
  web: {
    uri: string;
    title: string;
  };
}
