import type { Alert, AlertResponse } from "@/lib/types"

// Reference date: 2026-03-18
function daysAgo(n: number): string {
  const d = new Date("2026-03-18T00:00:00Z")
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString()
}

function hoursAgo(h: number): string {
  const d = new Date("2026-03-18T10:00:00Z")
  d.setUTCHours(d.getUTCHours() - h)
  return d.toISOString()
}

export const alertsData: Alert[] = [
  // ─── KRITIS (5) ───────────────────────────────────────────────────────────
  {
    id: "ALT-001",
    severity: "kritis",
    title: "Lonjakan Cabai Rawit di Kab. Jayapura naik >30%",
    region: "Jayapura",
    commodity: "cabai-rawit",
    timestamp: hoursAgo(3),
    status: "aktif",
    confidence: 92,
    detail: {
      recommendation:
        "Koordinasi distribusi darurat dari Makassar dan Surabaya. Aktifkan cadangan pangan daerah segera.",
      history: [
        { status: "Terdeteksi", timestamp: hoursAgo(6) },
        { status: "Diverifikasi", timestamp: hoursAgo(3) },
      ],
    },
  },
  {
    id: "ALT-002",
    severity: "kritis",
    title: "Stok Beras Merauke di bawah ambang batas kritis",
    region: "Merauke",
    commodity: "beras",
    timestamp: hoursAgo(8),
    status: "aktif",
    confidence: 95,
    detail: {
      recommendation:
        "Pengiriman darurat beras dari Jawa Timur via jalur udara. Target pengisian stok dalam 72 jam.",
      history: [
        { status: "Terdeteksi", timestamp: hoursAgo(12) },
        { status: "Diverifikasi", timestamp: hoursAgo(8) },
      ],
    },
  },
  {
    id: "ALT-003",
    severity: "kritis",
    title: "Harga Bawang Merah Sorong melonjak 45% dalam 7 hari",
    region: "Sorong",
    commodity: "bawang-merah",
    timestamp: daysAgo(1),
    status: "ditangani",
    confidence: 89,
    detail: {
      recommendation:
        "Operasi pasar murah dijadwalkan 3 hari berturut-turut. Koordinasi dengan Bulog Papua Barat.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(2) },
        { status: "Diverifikasi", timestamp: daysAgo(1) },
        { status: "Tim Diturunkan", timestamp: hoursAgo(18) },
      ],
    },
  },
  {
    id: "ALT-004",
    severity: "kritis",
    title: "Kelangkaan Gula Pasir di Manokwari menjelang Ramadan",
    region: "Manokwari",
    commodity: "gula-pasir",
    timestamp: daysAgo(2),
    status: "aktif",
    confidence: 91,
    detail: {
      recommendation:
        "Percepat pengiriman 200 ton gula dari Makassar. Koordinasi dengan distributor lokal untuk antrian pembelian.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(3) },
        { status: "Diverifikasi", timestamp: daysAgo(2) },
      ],
    },
  },
  {
    id: "ALT-005",
    severity: "kritis",
    title: "Harga Bawang Putih Ambon melampaui Rp80.000/kg",
    region: "Ambon",
    commodity: "bawang-putih",
    timestamp: daysAgo(1),
    status: "aktif",
    confidence: 88,
    detail: {
      recommendation:
        "Import darurat dari Surabaya. Pengawasan harga di pasar tradisional dengan sanksi bagi penimbun.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(2) },
        { status: "Diverifikasi", timestamp: daysAgo(1) },
      ],
    },
  },

  // ─── TINGGI (8) ───────────────────────────────────────────────────────────
  {
    id: "ALT-006",
    severity: "tinggi",
    title: "Cabai Rawit Kupang naik 22% minggu ini",
    region: "Kupang",
    commodity: "cabai-rawit",
    timestamp: daysAgo(3),
    status: "aktif",
    confidence: 84,
    detail: {
      recommendation:
        "Pantau ketersediaan di pasar Inpres. Siapkan distribusi dari Surabaya jika harga terus naik.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(4) },
        { status: "Diverifikasi", timestamp: daysAgo(3) },
      ],
    },
  },
  {
    id: "ALT-007",
    severity: "tinggi",
    title: "Beras Manado kekurangan pasokan akibat cuaca buruk",
    region: "Manado",
    commodity: "beras",
    timestamp: daysAgo(4),
    status: "ditangani",
    confidence: 81,
    detail: {
      recommendation:
        "Alihkan pasokan dari Makassar. Percepat pengiriman lewat jalur laut Pelabuhan Bitung.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(5) },
        { status: "Diverifikasi", timestamp: daysAgo(4) },
        { status: "Solusi Diterapkan", timestamp: daysAgo(2) },
      ],
    },
  },
  {
    id: "ALT-008",
    severity: "tinggi",
    title: "Harga Bawang Merah Palu melonjak jelang Ramadan",
    region: "Palu",
    commodity: "bawang-merah",
    timestamp: daysAgo(5),
    status: "aktif",
    confidence: 78,
    detail: {
      recommendation:
        "Operasi pasar di 5 titik utama Kota Palu. Koordinasi dengan pedagang grosir untuk stabilisasi harga.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(6) },
        { status: "Diverifikasi", timestamp: daysAgo(5) },
      ],
    },
  },
  {
    id: "ALT-009",
    severity: "tinggi",
    title: "Gula Pasir Balikpapan langka di minimarket",
    region: "Balikpapan",
    commodity: "gula-pasir",
    timestamp: daysAgo(5),
    status: "aktif",
    confidence: 76,
    detail: {
      recommendation:
        "Cek rantai distribusi dari Surabaya. Lakukan inspeksi gudang distributor besar.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(6) },
        { status: "Diverifikasi", timestamp: daysAgo(5) },
      ],
    },
  },
  {
    id: "ALT-010",
    severity: "tinggi",
    title: "Bawang Putih Pontianak kenaikan 18% dalam 10 hari",
    region: "Pontianak",
    commodity: "bawang-putih",
    timestamp: daysAgo(6),
    status: "ditangani",
    confidence: 80,
    detail: {
      recommendation:
        "Koordinasi dengan importir di Kuching untuk tambahan pasokan. Perbarui harga acuan HET.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(7) },
        { status: "Diverifikasi", timestamp: daysAgo(6) },
        { status: "Tim Diturunkan", timestamp: daysAgo(4) },
      ],
    },
  },
  {
    id: "ALT-011",
    severity: "tinggi",
    title: "Cabai Rawit Medan stok menipis di pasar induk",
    region: "Medan",
    commodity: "cabai-rawit",
    timestamp: daysAgo(7),
    status: "aktif",
    confidence: 77,
    detail: {
      recommendation:
        "Percepat pasokan dari Sumatera Barat dan Aceh. Monitor distributor yang menahan stok.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(8) },
        { status: "Diverifikasi", timestamp: daysAgo(7) },
      ],
    },
  },
  {
    id: "ALT-012",
    severity: "tinggi",
    title: "Beras Palembang harga naik melampaui HET",
    region: "Palembang",
    commodity: "beras",
    timestamp: daysAgo(8),
    status: "selesai",
    confidence: 83,
    detail: {
      recommendation:
        "Operasi pasar murah telah dilaksanakan. Harga kembali normal setelah 3 hari intervensi.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(10) },
        { status: "Diverifikasi", timestamp: daysAgo(8) },
        { status: "Operasi Pasar Dilaksanakan", timestamp: daysAgo(5) },
        { status: "Selesai", timestamp: daysAgo(2) },
      ],
    },
  },
  {
    id: "ALT-013",
    severity: "tinggi",
    title: "Harga Bawang Merah Makassar melonjak 20% pasca banjir",
    region: "Makassar",
    commodity: "bawang-merah",
    timestamp: daysAgo(9),
    status: "ditangani",
    confidence: 85,
    detail: {
      recommendation:
        "Alokasikan pasokan dari Jawa Timur 150 ton. Jalin komunikasi dengan petani Enrekang untuk percepatan panen.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(10) },
        { status: "Diverifikasi", timestamp: daysAgo(9) },
        { status: "Koordinasi Aktif", timestamp: daysAgo(6) },
      ],
    },
  },

  // ─── SEDANG (10) ──────────────────────────────────────────────────────────
  {
    id: "ALT-014",
    severity: "sedang",
    title: "Cabai Rawit Yogyakarta berfluktuasi tinggi",
    region: "Yogyakarta",
    commodity: "cabai-rawit",
    timestamp: daysAgo(10),
    status: "aktif",
    confidence: 72,
    detail: {
      recommendation:
        "Pantau harga harian. Siapkan stok cadangan di gudang Bulog DIY.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(11) },
        { status: "Dipantau", timestamp: daysAgo(10) },
      ],
    },
  },
  {
    id: "ALT-015",
    severity: "sedang",
    title: "Bawang Putih Semarang naik 12% dalam 2 minggu",
    region: "Semarang",
    commodity: "bawang-putih",
    timestamp: daysAgo(10),
    status: "aktif",
    confidence: 70,
    detail: {
      recommendation:
        "Monitor distribusi dari importir Pelabuhan Tanjung Emas. Lakukan inspeksi gudang.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(11) },
        { status: "Dipantau", timestamp: daysAgo(10) },
      ],
    },
  },
  {
    id: "ALT-016",
    severity: "sedang",
    title: "Gula Pasir Bandung naik 8% menjelang Ramadan",
    region: "Bandung",
    commodity: "gula-pasir",
    timestamp: daysAgo(11),
    status: "ditangani",
    confidence: 73,
    detail: {
      recommendation:
        "Koordinasi dengan PTPN untuk percepatan distribusi. Pastikan stok gula HET tersedia di pasar modern.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(12) },
        { status: "Ditangani", timestamp: daysAgo(11) },
      ],
    },
  },
  {
    id: "ALT-017",
    severity: "sedang",
    title: "Beras Padang kenaikan harga 9% akibat curah hujan tinggi",
    region: "Padang",
    commodity: "beras",
    timestamp: daysAgo(12),
    status: "aktif",
    confidence: 68,
    detail: {
      recommendation:
        "Pastikan jalur distribusi dari Bukittinggi tidak terganggu banjir. Pantau Gudang Bulog Padang.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(13) },
        { status: "Dipantau", timestamp: daysAgo(12) },
      ],
    },
  },
  {
    id: "ALT-018",
    severity: "sedang",
    title: "Bawang Merah Denpasar mulai naik jelang musim wisata",
    region: "Denpasar",
    commodity: "bawang-merah",
    timestamp: daysAgo(12),
    status: "aktif",
    confidence: 69,
    detail: {
      recommendation:
        "Perkuat pasokan dari petani Jembrana dan Karangasem. Koordinasi dengan dinas pertanian Bali.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(14) },
        { status: "Dipantau", timestamp: daysAgo(12) },
      ],
    },
  },
  {
    id: "ALT-019",
    severity: "sedang",
    title: "Cabai Rawit Surabaya volatilitas tinggi pasca hujan",
    region: "Surabaya",
    commodity: "cabai-rawit",
    timestamp: daysAgo(14),
    status: "selesai",
    confidence: 74,
    detail: {
      recommendation:
        "Harga telah stabil setelah operasi pasar. Lanjutkan pemantauan mingguan.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(16) },
        { status: "Dipantau", timestamp: daysAgo(14) },
        { status: "Selesai", timestamp: daysAgo(5) },
      ],
    },
  },
  {
    id: "ALT-020",
    severity: "sedang",
    title: "Harga Bawang Putih Makassar naik moderat 11%",
    region: "Makassar",
    commodity: "bawang-putih",
    timestamp: daysAgo(15),
    status: "aktif",
    confidence: 66,
    detail: {
      recommendation:
        "Pantau impor melalui Pelabuhan Makassar. Koordinasi dengan asosiasi importir.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(16) },
        { status: "Dipantau", timestamp: daysAgo(15) },
      ],
    },
  },
  {
    id: "ALT-021",
    severity: "sedang",
    title: "Gula Pasir Kupang pasokan terbatas dari Jawa",
    region: "Kupang",
    commodity: "gula-pasir",
    timestamp: daysAgo(16),
    status: "ditangani",
    confidence: 71,
    detail: {
      recommendation:
        "Koordinasi dengan BULOG NTT untuk penyaluran cadangan gula. Jadwalkan pengiriman dari Surabaya.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(17) },
        { status: "Ditangani", timestamp: daysAgo(16) },
      ],
    },
  },
  {
    id: "ALT-022",
    severity: "sedang",
    title: "Beras Jakarta harga sedikit melampaui HET",
    region: "Jakarta",
    commodity: "beras",
    timestamp: daysAgo(18),
    status: "selesai",
    confidence: 75,
    detail: {
      recommendation:
        "Inspeksi distributor besar telah dilakukan. Harga kembali ke level HET setelah operasi pasar.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(20) },
        { status: "Diselidiki", timestamp: daysAgo(18) },
        { status: "Selesai", timestamp: daysAgo(8) },
      ],
    },
  },
  {
    id: "ALT-023",
    severity: "sedang",
    title: "Bawang Merah Manokwari naik 15% dalam sebulan",
    region: "Manokwari",
    commodity: "bawang-merah",
    timestamp: daysAgo(19),
    status: "aktif",
    confidence: 67,
    detail: {
      recommendation:
        "Tambah frekuensi kapal barang dari Makassar. Koordinasi dengan BULOG Papua Barat.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(20) },
        { status: "Dipantau", timestamp: daysAgo(19) },
      ],
    },
  },

  // ─── RENDAH (7) ───────────────────────────────────────────────────────────
  {
    id: "ALT-024",
    severity: "rendah",
    title: "Gula Pasir Semarang sedikit di atas rata-rata",
    region: "Semarang",
    commodity: "gula-pasir",
    timestamp: daysAgo(20),
    status: "selesai",
    confidence: 62,
    detail: {
      recommendation:
        "Fluktuasi masih dalam batas normal. Pantau perkembangan harga mingguan.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(21) },
        { status: "Selesai", timestamp: daysAgo(10) },
      ],
    },
  },
  {
    id: "ALT-025",
    severity: "rendah",
    title: "Bawang Putih Yogyakarta naik tipis 5%",
    region: "Yogyakarta",
    commodity: "bawang-putih",
    timestamp: daysAgo(21),
    status: "selesai",
    confidence: 60,
    detail: {
      recommendation:
        "Situasi normal. Pantau tren harga dari pedagang grosir Beringharjo.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(22) },
        { status: "Selesai", timestamp: daysAgo(12) },
      ],
    },
  },
  {
    id: "ALT-026",
    severity: "rendah",
    title: "Cabai Rawit Bandung volatilitas normal pasca panen",
    region: "Bandung",
    commodity: "cabai-rawit",
    timestamp: daysAgo(22),
    status: "selesai",
    confidence: 63,
    detail: {
      recommendation:
        "Stok aman. Pantau cuaca untuk potensi gangguan panen selanjutnya.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(24) },
        { status: "Selesai", timestamp: daysAgo(14) },
      ],
    },
  },
  {
    id: "ALT-027",
    severity: "rendah",
    title: "Beras Medan kenaikan 4% tapi masih di bawah HET",
    region: "Medan",
    commodity: "beras",
    timestamp: daysAgo(23),
    status: "aktif",
    confidence: 61,
    detail: {
      recommendation:
        "Pantau harian. Siapkan intervensi jika mendekati HET.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(24) },
        { status: "Dipantau", timestamp: daysAgo(23) },
      ],
    },
  },
  {
    id: "ALT-028",
    severity: "rendah",
    title: "Bawang Merah Palembang stabil dengan kenaikan minor",
    region: "Palembang",
    commodity: "bawang-merah",
    timestamp: daysAgo(25),
    status: "aktif",
    confidence: 64,
    detail: {
      recommendation:
        "Tidak diperlukan intervensi saat ini. Lanjutkan pemantauan rutin.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(26) },
        { status: "Dipantau", timestamp: daysAgo(25) },
      ],
    },
  },
  {
    id: "ALT-029",
    severity: "rendah",
    title: "Gula Pasir Balikpapan fluktuasi minor dalam sepekan",
    region: "Balikpapan",
    commodity: "gula-pasir",
    timestamp: daysAgo(26),
    status: "selesai",
    confidence: 60,
    detail: {
      recommendation:
        "Kondisi stabil. Tidak diperlukan tindakan khusus.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(27) },
        { status: "Selesai", timestamp: daysAgo(15) },
      ],
    },
  },
  {
    id: "ALT-030",
    severity: "rendah",
    title: "Bawang Putih Denpasar kenaikan kecil menjelang Nyepi",
    region: "Denpasar",
    commodity: "bawang-putih",
    timestamp: daysAgo(27),
    status: "aktif",
    confidence: 65,
    detail: {
      recommendation:
        "Waspadai kenaikan permintaan menjelang hari raya. Pantau stok di pasar tradisional.",
      history: [
        { status: "Terdeteksi", timestamp: daysAgo(28) },
        { status: "Dipantau", timestamp: daysAgo(27) },
      ],
    },
  },
]

// ---------------------------------------------------------------------------
// Public API: getAlerts
// ---------------------------------------------------------------------------
export function getAlerts(filters?: {
  severity?: string
  status?: string
  commodity?: string
  region?: string
}): AlertResponse {
  let filtered = [...alertsData]

  if (filters?.severity && filters.severity !== "all") {
    filtered = filtered.filter((a) => a.severity === filters.severity)
  }
  if (filters?.status && filters.status !== "all") {
    filtered = filtered.filter((a) => a.status === filters.status)
  }
  if (filters?.commodity && filters.commodity !== "all") {
    filtered = filtered.filter((a) => a.commodity === filters.commodity)
  }
  if (filters?.region && filters.region !== "all") {
    filtered = filtered.filter((a) =>
      a.region.toLowerCase().includes(filters.region!.toLowerCase())
    )
  }

  const active = alertsData.filter((a) => a.status === "aktif").length
  const resolved = alertsData.filter((a) => a.status === "selesai").length

  return {
    summary: {
      active,
      thisMonth: alertsData.length,
      avgResponseTime: 2.3,
      resolved,
    },
    alerts: filtered,
  }
}
