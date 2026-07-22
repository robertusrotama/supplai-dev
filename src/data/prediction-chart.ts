import { commodities } from "./commodities";
import { regionalComparisonMaster } from "./regional-data";

export interface TimeSeriesPoint {
  date: string;
  displayDate: string;
  price: number;
  isFuture: boolean;
  isToday: boolean;
  region: string;
}

const COMMODITY_BEHAVIOR: Record<string, { volatilitas: number; mape: number }> = {
  "beras": { volatilitas: 0.02, mape: 1.8 },
  "cabai-rawit": { volatilitas: 0.18, mape: 5.4 },
  "bawang-merah": { volatilitas: 0.14, mape: 4.2 },
  "bawang-putih": { volatilitas: 0.05, mape: 2.8 },
  "gula-pasir": { volatilitas: 0.03, mape: 2.1 },
  "daging-sapi": { volatilitas: 0.015, mape: 1.2 },
  "daging-ayam": { volatilitas: 0.04, mape: 2.5 },
  "telur-ayam": { volatilitas: 0.035, mape: 2.2 },
  "tomat": { volatilitas: 0.15, mape: 4.9 },
  "wortel": { volatilitas: 0.08, mape: 3.6 },
  "kentang": { volatilitas: 0.06, mape: 3.1 },
};

function generateComprehensiveDataset(): Record<string, Record<string, TimeSeriesPoint[]>> {
  const masterDataset: Record<string, Record<string, TimeSeriesPoint[]>> = {};
  const today = new Date("2026-07-20");

  commodities.forEach((commodity) => {
    masterDataset[commodity.id] = {};

    regionalComparisonMaster.forEach((location) => {
      const points: TimeSeriesPoint[] = [];
      const behavior = COMMODITY_BEHAVIOR[commodity.id] || { volatilitas: 0.06, mape: 3.5 };
      
      // Khusus Daging Sapi & Ayam kita kalibrasi harganya agar tidak jomplang (dikalikan pengali logis)
      let basePrice = location.price; 
      if (commodity.id === "daging-sapi") basePrice = location.price * 9;
      if (commodity.id === "daging-ayam") basePrice = location.price * 2.5;
      if (commodity.id === "telur-ayam") basePrice = location.price * 2;

      for (let i = -180; i <= 14; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);
        const dateStr = currentDate.toISOString().split("T")[0];

        const seasonalWave = Math.sin((currentDate.getMonth() / 12) * Math.PI * 2) * (basePrice * behavior.volatilitas * 1.6);
        const dailyNoise = (Math.random() - 0.49) * (basePrice * behavior.volatilitas * 0.35);
        
        let dynamicPrice = basePrice + seasonalWave + dailyNoise;

        if (commodity.id === "bawang-merah" && i > -10 && i <= 0) {
          dynamicPrice += (i + 11) * (basePrice * 0.012); 
        }
        if (commodity.id === "bawang-merah" && i > 0) {
          dynamicPrice += (basePrice * 0.12) + Math.sin(i * 1.5) * 250;
        }

        points.push({
          date: dateStr,
          displayDate: currentDate.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
          price: Math.round(dynamicPrice),
          isFuture: i > 0,
          isToday: i === 0,
          region: location.region,
        });
      }

      masterDataset[commodity.id][location.region] = points;
    });
  });

  return masterDataset;
}

export const generatedTimeSeriesMaster = generateComprehensiveDataset();