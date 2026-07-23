import generated from "./generated/executive.json"

export interface TopMetric {
  title: string;
  value: string;
  statusText: string;
  statusType: "positive" | "stable" | "neutral" | "surplus";
  subtext?: string;
  chartType: "line-red" | "line-green" | "dots" | "bars";
}

export const topMetricsData: TopMetric[] = generated.topMetrics as TopMetric[]
export const shortcutCardsData = generated.shortcutCards
