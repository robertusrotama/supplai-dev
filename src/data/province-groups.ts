// The 34 provinces the model covers, grouped by island for the heatmap filter.
// Names must match the `region` values in the API responses exactly.
export const PROVINCE_GROUPS: Record<string, string[]> = {
  "Sumatera": [
    "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau",
    "Jambi", "Bengkulu", "Sumatera Selatan", "Kepulauan Bangka Belitung", "Lampung",
  ],
  "Jawa": [
    "DKI Jakarta", "Banten", "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur",
  ],
  "Bali & Nusa Tenggara": [
    "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
  ],
  "Kalimantan": [
    "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan",
    "Kalimantan Timur", "Kalimantan Utara",
  ],
  "Sulawesi": [
    "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat",
    "Sulawesi Selatan", "Sulawesi Tenggara",
  ],
  "Maluku & Papua": [
    "Maluku", "Maluku Utara", "Papua Barat", "Papua",
  ],
};

export const ALL_PROVINCES: string[] = Object.values(PROVINCE_GROUPS).flat();
