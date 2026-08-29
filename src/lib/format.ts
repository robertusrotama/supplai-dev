export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value)
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
}

const BULAN_SINGKAT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
                       "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

/** Label kolom bulanan, mis. "Jun 25".
 *
 * Sebelumnya memakai hari+bulan ("01/06"). Setiap titik data bertanggal 1, jadi
 * seluruh kolom diawali "01" dan angka bulannya terbaca sebagai tahun — deretnya
 * jadi "01/06 01/07 ... 01/12 01/02" yang mustahil dibaca. Data ini bulanan,
 * maka labelnya pun bulan dan tahun. */
export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return `${BULAN_SINGKAT[d.getMonth()]} ${String(d.getFullYear() % 100).padStart(2, "0")}`
}
