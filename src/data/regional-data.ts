export interface RegionalPrice {
  region: string;
  price: number;
  status: "CRITICAL" | "STABLE" | "SURPLUS";
}

export const regionalComparisonMaster: RegionalPrice[] = [
  { region: "Merauke", price: 16200, status: "CRITICAL" },
  { region: "Sorong", price: 15900, status: "CRITICAL" },
  { region: "Kupang", price: 15400, status: "CRITICAL" },
  { region: "Palu", price: 15100, status: "CRITICAL" },
  { region: "Balikpapan", price: 14800, status: "STABLE" },
  { region: "Padang", price: 14600, status: "STABLE" },
  { region: "Palembang", price: 14400, status: "STABLE" },
  { region: "Bandung", price: 14200, status: "STABLE" },
  { region: "Yogyakarta", price: 13900, status: "SURPLUS" },
  { region: "Semarang", price: 13800, status: "SURPLUS" },
  { region: "Surabaya", price: 13500, status: "SURPLUS" },
  { region: "Medan", price: 14950, status: "CRITICAL" },
  { region: "Makassar", price: 14100, status: "STABLE" },
  { region: "Banjarmasin", price: 15300, status: "CRITICAL" },
  { region: "Pontianak", price: 14750, status: "STABLE" },
];