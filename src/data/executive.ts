export interface TopMetric {
  title: string;
  value: string;
  statusText: string;
  statusType: "positive" | "stable" | "neutral" | "surplus";
  subtext?: string;
  chartType: "line-red" | "line-green" | "dots" | "bars";
}

export const topMetricsData: TopMetric[] = [
  {
    title: "MONTHLY INFLATION",
    value: "4.76%",
    statusText: "+0.2%",
    statusType: "positive",
    subtext: "/ Target 4.50%",
    chartType: "line-red",
  },
  {
    title: "PREDICTION ACCURACY",
    value: "94.2%",
    statusText: "STABLE",
    statusType: "stable",
    chartType: "line-green",
  },
  {
    title: "ACTIVE TPIDs",
    value: "542",
    statusText: "98% SYNC",
    statusType: "neutral",
    subtext: "Units",
    chartType: "dots",
  },
  {
    title: "DISTRIBUTION VOL.",
    value: "1.2M",
    statusText: "SURPLUS",
    statusType: "surplus",
    subtext: "Tons",
    chartType: "bars",
  },
];

export const shortcutCardsData = [
  { title: "Predict", id: "PRICE TRENDS", value: "89%", label: "CONFIDENCE", type: "predict", color: "emerald" },
  { title: "Heatmap", id: "VARIATION COEFF.", value: "0.12", label: "VARIATION", type: "heatmap", color: "blue" },
  { title: "Match", id: "ACTIVE RECS", value: "142", label: "MATCHES", type: "match", color: "rose" },
  { title: "Alert Center", id: "UNRESOLVED", value: "08", label: "CRITICAL", type: "alerts", color: "amber" },
];