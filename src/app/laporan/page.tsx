"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Loader2,
  Coins,
} from "lucide-react";

export default function LaporanPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [tahun, setTahun] = useState("2025");
  const [wilayahId, setWilayahId] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [statusValidasi, setStatusValidasi] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        tahun,
        wilayahId,
        kategoriId,
        statusValidasi,
      });

      const res = await fetch(`/api/laporan?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load reports", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tahun, wilayahId, kategoriId, statusValidasi]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!data?.items || data.items.length === 0) return;

    const headers = [
      "No",
      "Kode HSPW",
      "Nama Item",
      "Spesifikasi",
      "Kategori",
      "Wilayah",
      "Satuan",
      "Harga Satuan (Rp)",
      "Tahun",
      "Status Validasi",
      "Diverifikasi Oleh",
    ];

    const rows = data.items.map((item: any, idx: number) => [
      idx + 1,
      `"${item.kode}"`,
      `"${item.namaItem.replace(/"/g, '""')}"`,
      `"${(item.spesifikasi || "").replace(/"/g, '""')}"`,
      `"${item.kategori.nama}"`,
      `"${item.wilayah.nama}"`,
      `"${item.satuan}"`,
      item.hargaSatuan,
      item.tahun,
      `"${item.statusValidasi}"`,
      `"${item.verifiedBy?.name || "-"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e: any[]) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_HSPW_SIPASTI_${tahun}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardShell>
      {/* Official Government Print Header (Only visible when printing) */}
      <div className="hidden print:block pb-6 mb-6 border-b-2 border-slate-900 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-[#12345A] text-white flex items-center justify-center font-bold">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-base font-bold uppercase tracking-wider text-slate-900">
              Kementerian Pekerjaan Umum dan Perumahan Rakyat
            </h1>
            <h2 className="text-sm font-semibold text-slate-700">
              Direktorat Jenderal Bina Konstruksi &bull; Portal SIPASTI
            </h2>
          </div>
        </div>
        <p className="text-xs text-slate-600">
          Laporan Resmi Rekapitulasi Harga Satuan Pokok Wilayah (HSPW) Tahun Anggaran {tahun}
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          Dicetak pada: {new Date().toLocaleString("id-ID")} &bull; Terverifikasi Sah Sistem
        </p>
      </div>

      {/* Screen Controls Header (Hidden when printing) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Laporan &amp; Rekapitulasi Data Konstruksi
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekap agregat, cetak berkas dinas resmi, dan ekspor data harga satuan per wilayah &amp; kategori.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 btn-animate cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#12345A] hover:bg-[#0B2545] text-white text-xs font-bold shadow-md btn-animate cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Dokumen Resmi</span>
          </button>
        </div>
      </div>

      {/* Screen Filter (Hidden when printing) */}
      <div className="no-print p-4 bg-white rounded-xl border border-slate-200 shadow-xs card-hover">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-bold mb-1">Tahun Anggaran</label>
            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">Wilayah Acuan</label>
            <select
              value={wilayahId}
              onChange={(e) => setWilayahId(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Semua Wilayah</option>
              {data?.filters?.wilayahList?.map((w: any) => (
                <option key={w.id} value={w.id}>
                  {w.kode} - {w.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">Kategori Konstruksi</label>
            <select
              value={kategoriId}
              onChange={(e) => setKategoriId(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Semua Kategori</option>
              {data?.filters?.kategoriList?.map((k: any) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">Status Validasi</label>
            <select
              value={statusValidasi}
              onChange={(e) => setStatusValidasi(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Semua Status</option>
              <option value="DISETUJUI">Hanya yang Telah Disetujui</option>
              <option value="MENUNGGU">Menunggu Validasi</option>
              <option value="PERLU_PERBAIKAN">Perlu Perbaikan</option>
              <option value="DITOLAK">Ditolak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <span className="text-slate-500 font-bold block uppercase text-[10px]">Total Terfilter</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {loading ? "..." : data?.summary?.totalData ?? 0}
          </span>
          <span className="text-[10px] text-slate-400">item data</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <span className="text-emerald-700 font-bold block uppercase text-[10px]">Telah Disetujui</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">
            {loading ? "..." : data?.summary?.approvedCount ?? 0}
          </span>
          <span className="text-[10px] text-emerald-600">sah berlaku</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <span className="text-amber-700 font-bold block uppercase text-[10px]">Menunggu Review</span>
          <span className="text-xl font-black text-amber-600 mt-1 block">
            {loading ? "..." : data?.summary?.pendingCount ?? 0}
          </span>
          <span className="text-[10px] text-amber-600">proses validasi</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <span className="text-rose-700 font-bold block uppercase text-[10px]">Revisi / Tolak</span>
          <span className="text-xl font-black text-rose-600 mt-1 block">
            {loading
              ? "..."
              : (data?.summary?.rejectedCount ?? 0) + (data?.summary?.revisionCount ?? 0)}
          </span>
          <span className="text-[10px] text-rose-600">catatan evaluasi</span>
        </div>
      </div>

      {/* Rekapitulasi Rata-rata Harga per Kategori */}
      {data?.rekapKategori && data.rekapKategori.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
            Rekapitulasi Agregat Harga Rata-rata per Kategori
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.rekapKategori.map((k: any) => (
              <div key={k.nama} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="text-slate-600 font-bold line-clamp-1">{k.nama}</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-extrabold text-blue-700">
                    {formatRupiah(k.avgHarga)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {k.total} item
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Report Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Rincian Berkas Harga Satuan Pokok Wilayah (HSPW)
          </h3>
          <span className="text-xs text-slate-500">
            Total {data?.items?.length || 0} Baris
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#12345A] text-white font-bold text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 text-center">No</th>
                <th className="py-2.5 px-3">Kode Item</th>
                <th className="py-2.5 px-3">Uraian / Nama Item</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">Wilayah</th>
                <th className="py-2.5 px-3 text-center">Satuan</th>
                <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                <th className="py-2.5 px-3 text-center">Tahun</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-3 px-3 text-center">
                      <div className="w-4 h-3 rounded-sm skeleton-shimmer mx-auto"></div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="w-24 h-3.5 rounded-md skeleton-shimmer font-mono"></div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="w-40 h-3.5 rounded-md skeleton-shimmer"></div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="w-28 h-3 rounded-md skeleton-shimmer"></div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="w-24 h-3 rounded-md skeleton-shimmer"></div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="w-10 h-3 rounded-md skeleton-shimmer mx-auto"></div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="w-20 h-3.5 rounded-md skeleton-shimmer ml-auto"></div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="w-10 h-3 rounded-md skeleton-shimmer mx-auto"></div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="w-16 h-4 rounded-full skeleton-shimmer mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : data?.items && data.items.length > 0 ? (
                data.items.map((item: any, idx: number) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                      {item.kode}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {item.namaItem}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {item.kategori.nama}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                      {item.wilayah.nama}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600 font-medium whitespace-nowrap">
                      {item.satuan}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-700 whitespace-nowrap">
                      {formatRupiah(item.hargaSatuan)}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600 whitespace-nowrap">
                      {item.tahun}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap font-bold text-[10px]">
                      {item.statusValidasi}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada data yang sesuai dengan filter laporan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Signatures Section (Visible in Print Mode) */}
      <div className="hidden print:grid grid-cols-2 gap-8 pt-12 text-center text-xs text-slate-800">
        <div>
          <p className="font-semibold">Mengetahui,</p>
          <p className="font-bold text-slate-900 mt-1">Kepala Balai Jasa Konstruksi Wilayah</p>
          <div className="h-18"></div>
          <p className="font-bold underline">Ir. Hendra Wijaya, M.T.</p>
          <p className="text-[10px] text-slate-500">NIP. 197905102005011003</p>
        </div>

        <div>
          <p className="font-semibold">Jakarta, {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date())}</p>
          <p className="font-bold text-slate-900 mt-1">Petugas Pengelola Data HSPW</p>
          <div className="h-18"></div>
          <p className="font-bold underline">Budi Santoso, S.T.</p>
          <p className="text-[10px] text-slate-500">NIP. 198802152012021002</p>
        </div>
      </div>
    </DashboardShell>
  );
}

