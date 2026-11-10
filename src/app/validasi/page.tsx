"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { formatRupiah, formatDateTimeIndo } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  FileCheck2,
  Check,
  X,
  RotateCcw,
  Search,
  Loader2,
  Building2,
  User,
} from "lucide-react";

export default function ValidasiPage() {
  const [items, setItems] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({ pending: 0, approved: 0, rejected: 0, revision: 0 });
  const [loading, setLoading] = useState(true);

  // Filter States
  const [statusTab, setStatusTab] = useState("MENUNGGU");
  const [search, setSearch] = useState("");

  // Modal Action State
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"DISETUJUI" | "PERLU_PERBAIKAN" | "DITOLAK">("DISETUJUI");
  const [catatan, setCatatan] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusTab,
        search,
      });

      const res = await fetch(`/api/validasi?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setItems(json.data);
        setCounts(json.counts);
      }
    } catch (e) {
      console.error("Failed to load validation items", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const openActionModal = (item: any, type: "DISETUJUI" | "PERLU_PERBAIKAN" | "DITOLAK") => {
    setSelectedItem(item);
    setActionType(type);
    if (type === "DISETUJUI") {
      setCatatan("Telah diverifikasi sesuai standar acuan harga pasar dan ketentuan yang berlaku.");
    } else if (type === "PERLU_PERBAIKAN") {
      setCatatan("Mohon lengkapi dokumen faktur survei harga dari distributor resmi.");
    } else {
      setCatatan("Harga yang diajukan tidak wajar / melebihi batas batas indeks kewajaran.");
    }
    setIsActionModalOpen(true);
  };

  const handleSubmitValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (!catatan.trim()) {
      showToast("error", "Catatan pemeriksaan wajib diisi.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/validasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hspwId: selectedItem.id,
          status: actionType,
          catatan: catatan.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok) {
        showToast("success", json.message);
        setIsActionModalOpen(false);
        fetchData();
      } else {
        showToast("error", json.message || "Gagal memproses validasi");
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DISETUJUI":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Disetujui
          </span>
        );
      case "MENUNGGU":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Menunggu
          </span>
        );
      case "PERLU_PERBAIKAN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <AlertTriangle className="w-3 h-3 text-blue-600" />
            Revisi
          </span>
        );
      case "DITOLAK":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Ditolak
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <DashboardShell>
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold text-white transition-all ${
            notification.type === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          {notification.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Modul Validasi &amp; Verifikasi Data Konstruksi
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Penelaahan teknis dan validasi usulan harga satuan pokok wilayah (ACC, Revisi, Tolak) oleh Administrator.
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setStatusTab("MENUNGGU")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            statusTab === "MENUNGGU"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Menunggu Validasi</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
            {counts.pending}
          </span>
        </button>

        <button
          onClick={() => setStatusTab("DISETUJUI")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            statusTab === "DISETUJUI"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Telah Disetujui</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
            {counts.approved}
          </span>
        </button>

        <button
          onClick={() => setStatusTab("PERLU_PERBAIKAN")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            statusTab === "PERLU_PERBAIKAN"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Perlu Perbaikan (Revisi)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
            {counts.revision}
          </span>
        </button>

        <button
          onClick={() => setStatusTab("DITOLAK")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            statusTab === "DITOLAK"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Ditolak</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
            {counts.rejected}
          </span>
        </button>

        <button
          onClick={() => setStatusTab("ALL")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            statusTab === "ALL"
              ? "bg-[#12345A] text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <span>Semua Status</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode atau nama item..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#12345A] hover:bg-[#0B2545] text-white text-xs font-semibold"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Items Card List / Table */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-24 h-4 rounded-md skeleton-shimmer"></div>
                <div className="w-32 h-4 rounded-md skeleton-shimmer"></div>
                <div className="w-20 h-5 rounded-full skeleton-shimmer"></div>
              </div>
              <div className="w-72 h-5 rounded-md skeleton-shimmer"></div>
              <div className="w-full h-10 rounded-md skeleton-shimmer"></div>
              <div className="flex items-center gap-4 pt-1">
                <div className="w-36 h-4 rounded-md skeleton-shimmer"></div>
                <div className="w-24 h-4 rounded-md skeleton-shimmer"></div>
              </div>
            </div>
          ))
        ) : items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs card-hover flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-sm">
                    {item.kode}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    &bull; {item.kategori?.nama} &bull; Wilayah: {item.wilayah?.nama}
                  </span>
                  {getStatusBadge(item.statusValidasi)}
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {item.namaItem}
                </h3>

                {item.spesifikasi && (
                  <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-md border border-slate-100">
                    <span className="font-semibold text-slate-700">Spesifikasi: </span>
                    {item.spesifikasi}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <div>
                    Usulan Harga:{" "}
                    <span className="font-extrabold text-blue-700 text-sm">
                      {formatRupiah(item.hargaSatuan)}
                    </span>{" "}
                    / {item.satuan}
                  </div>
                  <div>Tahun: <span className="font-semibold text-slate-700">{item.tahun}</span></div>
                  <div>Pengusul: <span className="font-semibold text-slate-700">{item.createdBy?.name || "-"}</span></div>
                </div>

                {item.catatanValidasi && (
                  <div className="mt-2 text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-700">Catatan Pemeriksa: </span>
                    <span className="text-slate-600">{item.catatanValidasi}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap lg:flex-col items-center gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-5">
                <button
                  onClick={() => openActionModal(item, "DISETUJUI")}
                  className="flex-1 lg:w-36 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs btn-animate cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Setujui Usulan</span>
                </button>

                <button
                  onClick={() => openActionModal(item, "PERLU_PERBAIKAN")}
                  className="flex-1 lg:w-36 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 btn-animate cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Minta Revisi</span>
                </button>

                <button
                  onClick={() => openActionModal(item, "DITOLAK")}
                  className="flex-1 lg:w-36 py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 btn-animate cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Tolak Usulan</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              Tidak ada antrean data dengan status {statusTab}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Seluruh berkas pada kategori ini telah selesai ditinjau
            </p>
          </div>
        )}
      </div>

      {/* Modal Dialog Validasi */}
      {isActionModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
                    actionType === "DISETUJUI"
                      ? "bg-emerald-600"
                      : actionType === "PERLU_PERBAIKAN"
                      ? "bg-blue-600"
                      : "bg-rose-600"
                  }`}
                >
                  {actionType === "DISETUJUI" ? (
                    <Check className="w-4 h-4" />
                  ) : actionType === "PERLU_PERBAIKAN" ? (
                    <RotateCcw className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Proses Validasi Data: {actionType}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">{selectedItem.kode}</span>
                </div>
              </div>
              <button onClick={() => setIsActionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{selectedItem.namaItem}</div>
              <div className="text-slate-600">
                Wilayah: <span className="font-semibold">{selectedItem.wilayah?.nama}</span> &bull; Usulan:{" "}
                <span className="font-bold text-blue-700">{formatRupiah(selectedItem.hargaSatuan)}</span> / {selectedItem.satuan}
              </div>
            </div>

            <form onSubmit={handleSubmitValidation} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Catatan Resmi Pemeriksa (Tercatat di Audit Log)
                </label>
                <textarea
                  rows={4}
                  required
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Tuliskan catatan pertimbangan teknis, acuan SNI, atau alasan penolakan/revisi..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 leading-relaxed"
                ></textarea>
                <p className="text-[10px] text-slate-400 mt-1">
                  Catatan ini akan dikirimkan sebagai notifikasi kepada pembuat usulan data.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsActionModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`px-5 py-2 rounded-lg text-white font-bold flex items-center gap-1.5 disabled:opacity-50 ${
                    actionType === "DISETUJUI"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : actionType === "PERLU_PERBAIKAN"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Keputusan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

