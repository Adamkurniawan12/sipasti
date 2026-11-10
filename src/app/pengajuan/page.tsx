"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { formatDateIndo } from "@/lib/utils";
import { useSession } from "next-auth/react";
import {
  FileText,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  Calendar,
  X,
  Loader2,
  Send,
  Eye,
  Check,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";

export default function PengajuanPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "VERIFIKATOR";

  const [items, setItems] = useState<any[]>([]);
  const [wilayahList, setWilayahList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tahunFilter, setTahunFilter] = useState("2025");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Admin Action Modal States
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedPengajuan, setSelectedPengajuan] = useState<any>(null);
  const [actionStatus, setActionStatus] = useState<"APPROVED" | "IN_REVIEW" | "REJECTED">("APPROVED");
  const [adminCatatan, setAdminCatatan] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    tahun: 2025,
    wilayahId: "",
    catatan: "",
  });

  const fetchPengajuan = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        tahun: tahunFilter,
      });

      const res = await fetch(`/api/pengajuan?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setItems(json.data || []);
        setWilayahList(json.wilayahList || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengajuan();
  }, [statusFilter, tahunFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPengajuan();
  };

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 6000);
  };

  const openAddModal = () => {
    setFormData({
      judul: "",
      deskripsi: "",
      tahun: parseInt(tahunFilter) || 2025,
      wilayahId: wilayahList[0]?.id || "",
      catatan: "",
    });
    setIsModalOpen(true);
  };

  const openActionModal = (item: any, status: "APPROVED" | "IN_REVIEW" | "REJECTED") => {
    setSelectedPengajuan(item);
    setActionStatus(status);
    if (status === "APPROVED") {
      setAdminCatatan("Berkas usulan lengkap, wajar, dan disetujui (ACC) oleh Administrator.");
    } else if (status === "IN_REVIEW") {
      setAdminCatatan("Mohon lengkapi lampiran teknis dan rincian harga survei pasar.");
    } else {
      setAdminCatatan("Usulan tidak memenuhi kriteria pedoman acuan harga wilayah.");
    }
    setIsActionModalOpen(true);
  };

  const submitAdminAction = async (statusVal: "APPROVED" | "IN_REVIEW" | "REJECTED", catatanVal: string) => {
    if (!selectedPengajuan) return;
    if (!catatanVal.trim()) {
      showToast("error", "Catatan administrator wajib diisi.");
      return;
    }
    setActionLoading(true);

    try {
      const res = await fetch("/api/pengajuan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPengajuan.id,
          status: statusVal,
          catatan: catatanVal.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok) {
        showToast("success", json.message);
        setIsActionModalOpen(false);
        fetchPengajuan();
      } else {
        showToast("error", json.message || "Gagal memproses tindakan.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminAction = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitAdminAction(actionStatus, adminCatatan);
  };

  const handleDeletePengajuan = async (item: any) => {
    if (!confirm(`Apakah Anda yakin ingin membatalkan/menghapus usulan "${item.judul}"?`)) return;
    try {
      const res = await fetch(`/api/pengajuan?id=${item.id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok) {
        showToast("success", json.message);
        fetchPengajuan();
      } else {
        showToast("error", json.message || "Gagal menghapus berkas usulan.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan koneksi.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      const res = await fetch("/api/pengajuan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: formData.judul.trim(),
          deskripsi: formData.deskripsi.trim() || undefined,
          tahun: parseInt(formData.tahun.toString()),
          wilayahId: formData.wilayahId,
          catatan: formData.catatan.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        showToast("success", json.message);
        setIsModalOpen(false);
        fetchPengajuan();
      } else {
        showToast("error", json.message || "Gagal membuat pengajuan.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Disetujui
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            Diajukan
          </span>
        );
      case "IN_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Sedang Ditelaah
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            Draft
          </span>
        );
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Pengajuan Usulan Berkas Data Konstruksi
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Paket berkas usulan penetapan atau pembaruan Harga Satuan Pokok Wilayah dari dinas / penyedia.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm btn-animate self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Usulan Baru</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 card-hover">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor pengajuan atau judul berkas..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#12345A] hover:bg-[#0B2545] text-white text-xs font-semibold btn-animate cursor-pointer"
          >
            Cari
          </button>
        </form>

        <div className="sm:w-44">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Semua Status</option>
            <option value="SUBMITTED">Diajukan</option>
            <option value="IN_REVIEW">Sedang Ditelaah</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>

        <div className="sm:w-32">
          <select
            value={tahunFilter}
            onChange={(e) => setTahunFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="2025">TA 2025</option>
            <option value="2024">TA 2024</option>
            <option value="2023">TA 2023</option>
          </select>
        </div>
      </div>

      {/* List Cards */}
      <div className="space-y-3.5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-28 h-4 rounded-md skeleton-shimmer"></div>
                <div className="w-20 h-5 rounded-full skeleton-shimmer"></div>
              </div>
              <div className="w-64 h-5 rounded-md skeleton-shimmer"></div>
              <div className="w-full h-8 rounded-md skeleton-shimmer"></div>
            </div>
          ))
        ) : items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-sm">
                    {item.nomorPengajuan}
                  </span>
                  <span className="text-xs text-slate-500">
                    &bull; Wilayah: <span className="font-semibold text-slate-700">{item.wilayah?.nama}</span>
                  </span>
                  {getStatusBadge(item.status)}
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                  {item.judul}
                </h3>

                {item.deskripsi && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.deskripsi}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>Oleh: <strong className="text-slate-700">{item.submittedBy?.name}</strong> ({item.submittedBy?.instansi})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Diajukan: {formatDateIndo(item.createdAt)}</span>
                  </div>
                </div>

                {item.catatan && (
                  <div className="mt-2 text-xs p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                    <span className="font-bold">Catatan Pengusul: </span>
                    <span>{item.catatan}</span>
                  </div>
                )}
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row items-end sm:items-center gap-2">
                <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-semibold">
                  TA {item.tahun}
                </span>

                {isAdmin && (
                  <div className="flex items-center gap-1.5 pt-1 sm:pt-0">
                    <button
                      onClick={() => openActionModal(item, "APPROVED")}
                      title="Setujui (ACC) Usulan"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold btn-animate cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>ACC</span>
                    </button>
                    <button
                      onClick={() => openActionModal(item, "IN_REVIEW")}
                      title="Minta Revisi / Telaah Teknis"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold btn-animate cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Revisi</span>
                    </button>
                    <button
                      onClick={() => openActionModal(item, "REJECTED")}
                      title="Tolak Usulan"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold btn-animate cursor-pointer shadow-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>
                  </div>
                )}

                {(isAdmin || (item.submittedById === session?.user?.id && item.status !== "APPROVED")) && (
                  <button
                    onClick={() => handleDeletePengajuan(item)}
                    title="Batalkan / Hapus Usulan"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
            <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">Belum ada berkas pengajuan usulan data</p>
            <p className="text-xs text-slate-400 mt-1">
              Klik tombol &quot;Buat Usulan Baru&quot; untuk mengajukan usulan harga satuan wilayah Anda.
            </p>
          </div>
        )}
      </div>

      {/* Modal Add Pengajuan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Buat Berkas Usulan Data Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Judul Berkas Pengajuan Usulan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Usulan HSPW Bidang Bina Marga TA 2025"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tahun Anggaran</label>
                  <input
                    type="number"
                    required
                    value={formData.tahun}
                    onChange={(e) => setFormData({ ...formData, tahun: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Wilayah Usulan</label>
                  <select
                    value={formData.wilayahId}
                    onChange={(e) => setFormData({ ...formData, wilayahId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                  >
                    {wilayahList.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Deskripsi / Latar Belakang</label>
                <textarea
                  rows={3}
                  placeholder="Penjelasan latar belakang survei harga pasar setempat..."
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Catatan Tambahan untuk Verifikator</label>
                <input
                  type="text"
                  placeholder="Nomor SK / Surat Pengantar / Sumber Data..."
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 btn-animate disabled:opacity-50 cursor-pointer"
                >
                  {modalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Kirim Berkas Pengajuan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tindak Lanjut Admin (ACC / Revisi / Tolak) */}
      {isActionModalOpen && selectedPengajuan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Tindak Lanjut Berkas Usulan oleh Administrator
                </h3>
              </div>
              <button onClick={() => setIsActionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="font-mono font-bold text-slate-700">{selectedPengajuan.nomorPengajuan}</div>
              <div className="font-semibold text-slate-900">{selectedPengajuan.judul}</div>
              <div className="text-slate-500">
                Diajukan oleh: <span className="font-medium text-slate-700">{selectedPengajuan.submittedBy?.name}</span> ({selectedPengajuan.submittedBy?.instansi})
              </div>
            </div>

            <form onSubmit={handleAdminAction} className="space-y-4 text-xs">
              {/* Catatan dulu sebelum pilih aksi */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Catatan Resmi Administrator untuk Pemohon <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan catatan telaah atau arahan perbaikan..."
                  value={adminCatatan}
                  onChange={(e) => setAdminCatatan(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 text-xs"
                ></textarea>
              </div>

              {/* Tombol aksi langsung submit */}
              <div>
                <label className="block text-slate-700 font-bold mb-2">Pilih Keputusan &amp; Simpan</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => { setActionStatus("APPROVED"); submitAdminAction("APPROVED", adminCatatan); }}
                    className="py-2.5 px-3 rounded-lg border-2 border-emerald-600 bg-emerald-600 hover:bg-emerald-700 hover:border-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {actionLoading && actionStatus === "APPROVED" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>✓ ACC</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => { setActionStatus("IN_REVIEW"); submitAdminAction("IN_REVIEW", adminCatatan); }}
                    className="py-2.5 px-3 rounded-lg border-2 border-amber-500 bg-amber-500 hover:bg-amber-600 hover:border-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {actionLoading && actionStatus === "IN_REVIEW" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                    <span>Revisi</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => { setActionStatus("REJECTED"); submitAdminAction("REJECTED", adminCatatan); }}
                    className="py-2.5 px-3 rounded-lg border-2 border-rose-600 bg-rose-600 hover:bg-rose-700 hover:border-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {actionLoading && actionStatus === "REJECTED" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                    <span>Tolak</span>
                  </button>
                </div>
                <p className="text-slate-400 text-[11px] mt-1.5">Klik salah satu tombol di atas untuk langsung menyimpan keputusan.</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsActionModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

