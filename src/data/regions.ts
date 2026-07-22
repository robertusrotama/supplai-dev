import type { Region } from "@/lib/types"

export const regions: Region[] = [
  // Jawa
  { id: "jakarta", name: "Jakarta", province: "DKI Jakarta", lat: -6.2, lng: 106.85 },
  { id: "bandung", name: "Bandung", province: "Jawa Barat", lat: -6.91, lng: 107.61 },
  { id: "surabaya", name: "Surabaya", province: "Jawa Timur", lat: -7.25, lng: 112.75 },
  { id: "semarang", name: "Semarang", province: "Jawa Tengah", lat: -6.97, lng: 110.42 },
  { id: "yogyakarta", name: "Yogyakarta", province: "DI Yogyakarta", lat: -7.8, lng: 110.36 },
  // Sumatera
  { id: "medan", name: "Medan", province: "Sumatera Utara", lat: 3.59, lng: 98.67 },
  { id: "palembang", name: "Palembang", province: "Sumatera Selatan", lat: -2.99, lng: 104.76 },
  { id: "padang", name: "Padang", province: "Sumatera Barat", lat: -0.95, lng: 100.35 },
  // Sulawesi
  { id: "makassar", name: "Makassar", province: "Sulawesi Selatan", lat: -5.14, lng: 119.43 },
  { id: "manado", name: "Manado", province: "Sulawesi Utara", lat: 1.47, lng: 124.84 },
  { id: "palu", name: "Palu", province: "Sulawesi Tengah", lat: -0.9, lng: 119.87 },
  // Kalimantan
  { id: "balikpapan", name: "Balikpapan", province: "Kalimantan Timur", lat: -1.27, lng: 116.83 },
  { id: "pontianak", name: "Pontianak", province: "Kalimantan Barat", lat: -0.03, lng: 109.34 },
  // NTT
  { id: "kupang", name: "Kupang", province: "NTT", lat: -10.17, lng: 123.61 },
  // Maluku
  { id: "ambon", name: "Ambon", province: "Maluku", lat: -3.7, lng: 128.18 },
  // Bali
  { id: "denpasar", name: "Denpasar", province: "Bali", lat: -8.65, lng: 115.22 },
  // Papua
  { id: "jayapura", name: "Jayapura", province: "Papua", lat: -2.53, lng: 140.72 },
  { id: "merauke", name: "Merauke", province: "Papua Selatan", lat: -8.47, lng: 140.4 },
  { id: "sorong", name: "Sorong", province: "Papua Barat Daya", lat: -0.88, lng: 131.25 },
  { id: "manokwari", name: "Manokwari", province: "Papua Barat", lat: -0.86, lng: 134.08 },
]

export function getRegionById(id: string): Region | undefined {
  return regions.find((r) => r.id === id)
}
