import generated from "./generated/timeseries.json"

export interface TimeSeriesPoint {
  date: string;
  displayDate: string;
  price: number;
  isFuture: boolean;
  isToday: boolean;
  region: string;
}

// Real monthly series per commodity per province: ~15 months of actuals
// (last one flagged isToday) followed by the 3 forecast months (isFuture).
// Regenerate with `npm run export:data`.
export const generatedTimeSeriesMaster =
  generated as Record<string, Record<string, TimeSeriesPoint[]>>
