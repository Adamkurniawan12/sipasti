"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/layout/DashboardShell";
import { formatRupiah, formatDateTimeIndo } from "@/lib/utils";
import {
  Coins,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  PlusCircle,
  ArrowUpRight,
  RefreshCw,
  Users,
  MapPin,
  Building2,
  Layers,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load dashboard data", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DISETUJUI":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Disetujui
          </span>
        );
      case "MENUNGGU":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Menunggu
          </span>
        );
      case "PERLU_PERBAIKAN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Revisi
          </span>
        );
      case "DITOLAK":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Ditolak
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <DashboardShell>
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#12345A] to-[#0B2545] text-white shadow-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold border border-blue-400/20">
            <Building2 className="w-3.5 h-3.5" />
            <span>Kementerian Pekerjaan Umum RI</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Ringkasan Pengelolaan Data Konstruksi (SIPASTI)
          </h2>
          <p className="text-xs text-slate-300">
            Monitoring harga satuan pokok wilayah, sebaran katalog konstruksi, dan status validasi terpusat di MySQL.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 btn-animate"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>
          <Link
            href="/hspw"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md btn-animate"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tambah HSPW</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          // Skeleton Shimmer for 4 KPI cards
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-24 h-3.5 rounded-md skeleton-shimmer"></div>
                <div className="w-10 h-10 rounded-lg skeleton-shimmer"></div>
              </div>
              <div className="w-16 h-8 rounded-md skeleton-shimmer mt-2"></div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="w-20 h-3 rounded-md skeleton-shimmer"></div>
                <div className="w-16 h-3 rounded-md skeleton-shimmer"></div>
              </div>
            </div>
          ))
        ) : (
          <>
            {/* Card 1 */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs card-hover">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Data HSPW
                </span>
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Coins className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {data?.counters?.totalHspw ?? 0}
                </span>
                <span className="text-xs text-slate-500 ml-1.5">item terdaftar</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Tahun Berjalan 2025</span>
                <Link href="/hspw" className="text-blue-600 hover:underline font-semibold flex items-center">
                  Lihat Semua &rarr;
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs card-hover">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Telah Divalidasi
                </span>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                  {data?.counters?.totalDisetujui ?? 0}
                </span>
                <span className="text-xs text-slate-500 ml-1.5">item disetujui</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Resmi Berlaku</span>
                <Link href="/validasi?status=DISETUJUI" className="text-emerald-700 hover:underline font-semibold flex items-center">
                  Arsip &rarr;
                </Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs card-hover">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Menunggu Validasi
                </span>
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-amber-600">
                  {data?.counters?.totalMenunggu ?? 0}
                </span>
                <span className="text-xs text-slate-500 ml-1.5">antrean usulan</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Perlu Ditinjau</span>
                <Link href="/validasi" className="text-amber-700 hover:underline font-semibold flex items-center">
                  Periksa &rarr;
                </Link>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs card-hover">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                  Perlu Perbaikan / Tolak
                </span>
                <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-rose-600">
                  {(data?.counters?.totalPerluPerbaikan ?? 0) + (data?.counters?.totalDitolak ?? 0)}
                </span>
                <span className="text-xs text-slate-500 ml-1.5">item bermasalah</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Butuh Revisi</span>
                <Link href="/validasi?status=PERLU_PERBAIKAN" className="text-rose-700 hover:underline font-semibold flex items-center">
                  Detail &rarr;
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart: Kategori Data */}
        <div className="lg:col-span-8 p-5 bg-white rounded-xl border border-slate-200 shadow-xs card-hover">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Distribusi Data HSPW per Kategori
              </h3>
              <p className="text-xs text-slate-500">
                Jumlah item terdaftar berdasarkan klasifikasi pekerjaan konstruksi
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              Katalog 2025
            </span>
          </div>

          <div className="h-72 w-full">
            {loading ? (
              <div className="w-full h-full flex flex-col justify-end gap-3 p-4">
                <div className="w-full flex items-end gap-4 h-52">
                  <div className="w-1/6 h-32 rounded-t-md skeleton-shimmer"></div>
                  <div className="w-1/6 h-44 rounded-t-md skeleton-shimmer"></div>
                  <div className="w-1/6 h-28 rounded-t-md skeleton-shimmer"></div>
                  <div className="w-1/6 h-48 rounded-t-md skeleton-shimmer"></div>
                  <div className="w-1/6 h-20 rounded-t-md skeleton-shimmer"></div>
                  <div className="w-1/6 h-36 rounded-t-md skeleton-shimmer"></div>
                </div>
                <div className="w-full h-3 rounded-md skeleton-shimmer"></div>
              </div>
            ) : data?.categoryStats && data.categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      color: "#FFFFFF",
                      borderRadius: "8px",
                      fontSize: "12px",
                      border: "none",
                    }}
                  />
                  <Bar dataKey="total" name="Jumlah Item" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Belum ada data kategori
              </div>
            )}
          </div>
        </div>

        {/* Donut Chart: Komposisi Status Validasi */}
        <div className="lg:col-span-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col card-hover">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Status Validasi Data
            </h3>
            <p className="text-xs text-slate-500">
              Proporsi data yang telah diproses verifikator
            </p>
          </div>

          <div className="h-56 w-full flex-1">
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <div className="w-32 h-32 rounded-full skeleton-shimmer"></div>
                <div className="w-40 h-3 rounded-md skeleton-shimmer"></div>
              </div>
            ) : data?.validationStats ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.validationStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {data.validationStats.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      color: "#FFFFFF",
                      borderRadius: "8px",
                      fontSize: "12px",
                      border: "none",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Items & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent HSPW */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden card-hover">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Usulan Data HSPW Terkini</h3>
              <p className="text-xs text-slate-500">Item harga satuan yang baru ditambahkan ke database</p>
            </div>
            <Link
              href="/hspw"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Kode &amp; Item</th>
                  <th className="py-2.5 px-4">Wilayah</th>
                  <th className="py-2.5 px-4 text-right">Harga Satuan</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="py-3 px-4">
                        <div className="w-36 h-3 rounded-md skeleton-shimmer mb-1"></div>
                        <div className="w-20 h-2 rounded-md skeleton-shimmer"></div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-24 h-3 rounded-md skeleton-shimmer"></div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-20 h-3 rounded-md skeleton-shimmer ml-auto"></div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="w-16 h-5 rounded-full skeleton-shimmer mx-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : data?.recentHspw && data.recentHspw.length > 0 ? (
                  data.recentHspw.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 line-clamp-1">{item.namaItem}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{item.kode} &bull; {item.satuan}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {item.wilayah?.nama || "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-blue-700 whitespace-nowrap">
                        {formatRupiah(item.hargaSatuan)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(item.statusValidasi)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Belum ada data HSPW yang tercatat
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col card-hover">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Jejak Aktivitas Sistem (Audit Log)</h3>
              <p className="text-xs text-slate-500">Pencatatan tindakan pengguna terbaru di MySQL</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div className="p-4 sm:p-5 flex-1 space-y-3.5">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full skeleton-shimmer shrink-0"></div>
                  <div className="flex-1 space-y-1.5">
                    <div className="w-full h-3 rounded-md skeleton-shimmer"></div>
                    <div className="w-2/3 h-2.5 rounded-md skeleton-shimmer"></div>
                  </div>
                </div>
              ))
            ) : data?.recentActivities && data.recentActivities.length > 0 ? (
              data.recentActivities.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 text-xs pb-3 border-b border-slate-100 last:border-b-0 last:pb-0">
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    {log.user?.name ? log.user.name.charAt(0).toUpperCase() : "S"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-medium leading-snug">
                      <span className="font-bold text-slate-900">{log.user?.name || "Sistem"}</span>: {log.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span className="font-semibold text-blue-600 uppercase tracking-wider">{log.module}</span>
                      <span>&bull;</span>
                      <span>{formatDateTimeIndo(log.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">Belum ada riwayat aktivitas</div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

