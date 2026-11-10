"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import {
  Coins,
  Search,
  Filter,
  Plus,
  Download,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";

export default function HspwPage() {
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [filtersData, setFiltersData] = useState<any>({ kategoriList: [], wilayahList: [] });
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [wilayahId, setWilayahId] = useState("");
  const [statusValidasi, setStatusValidasi] = useState("");
  const [tahun, setTahun] = useState("2025");
  const [page, setPage] = useState(1);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    kode: "",
    namaItem: "",
    spesifikasi: "",
    satuan: "",
    hargaSatuan: "",
    tahun: 2025,
    wilayahId: "",
    kategoriId: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        kategoriId,
        wilayahId,
        statusValidasi,
        tahun,
      });

      const res = await fetch(`/api/hspw?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setItems(json.data);
        setMeta(json.meta);
        setFiltersData(json.filters);
      }
    } catch (e) {
      console.error("Failed to load HSPW items", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, kategoriId, wilayahId, statusValidasi, tahun]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleResetFilter = () => {
    setSearch("");
    setKategoriId("");
    setWilayahId("");
    setStatusValidasi("");
    setTahun("2025");
    setPage(1);
  };

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Open Add Modal
  const openAddModal = () => {
    const randomCode = `HSPW-${tahun}-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({
      kode: randomCode,
      namaItem: "",
      spesifikasi: "",
      satuan: "M3",
      hargaSatuan: "",
      tahun: parseInt(tahun) || 2025,
      wilayahId: filtersData.wilayahList[0]?.id || "",
      kategoriId: filtersData.kategoriList[0]?.id || "",
    });
    setIsAddModalOpen(true);
  };

  // Submit Add
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const res = await fetch("/api/hspw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          hargaSatuan: parseFloat(formData.hargaSatuan),
          tahun: parseInt(formData.tahun.toString()),
        }),
      });

      const json = await res.json();
      if (res.ok) {
        showToast("success", json.message);
        setIsAddModalOpen(false);
        fetchData();
      } else {
        showToast("error", json.message || "Gagal menambahkan data");
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan");
    } finally {
      setModalLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setFormData({
      kode: item.kode,
      namaItem: item.namaItem,
      spesifikasi: item.spesifikasi || "",
      satuan: item.satuan,
      hargaSatuan: item.hargaSatuan.toString(),
      tahun: item.tahun,
      wilayahId: item.wilayahId,
      kategoriId: item.kategoriId,
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setModalLoading(true);
    try {
      const res = await fetch(`/api/hspw/${selectedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaItem: formData.namaItem,
          spesifikasi: formData.spesifikasi,
          satuan: formData.satuan,
          hargaSatuan: parseFloat(formData.hargaSatuan),
          tahun: parseInt(formData.tahun.toString()),
          wilayahId: formData.wilayahId,
          kategoriId: formData.kategoriId,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        showToast("success", json.message);
        setIsEditModalOpen(false);
        fetchData();
      } else {
        showToast("error", json.message || "Gagal memperbarui data");
      }
    } catch {
      showToast("error", "Terjadi kesalahan koneksi");
    } finally {
      setModalLoading(false);
    }
  };

  // Delete Action
  const handleDeleteSubmit = async () => {
    if (!selectedItem) return;
    setModalLoading(true);
    try {
      const res = await fetch(`/api/hspw/${selectedItem.id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok) {
        showToast("success", json.message);
        setIsDeleteModalOpen(false);
        fetchData();
      } else {
        showToast("error", json.message || "Gagal menghapus data");
      }
    } catch {
      showToast("error", "Terjadi kesalahan koneksi");
    } finally {
      setModalLoading(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (items.length === 0) {
      showToast("error", "Tidak ada data untuk diekspor");
      return;
    }

    const headers = ["Kode", "Nama Item", "Spesifikasi", "Satuan", "Harga Satuan", "Tahun", "Wilayah", "Kategori", "Status Validasi"];
    const rows = items.map((i) => [
      `"${i.kode}"`,
      `"${i.namaItem.replace(/"/g, '""')}"`,
      `"${(i.spesifikasi || "").replace(/"/g, '""')}"`,
      `"${i.satuan}"`,
      i.hargaSatuan,
      i.tahun,
      `"${i.wilayah?.nama || ""}"`,
      `"${i.kategori?.nama || ""}"`,
      `"${i.statusValidasi}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HSPW_SIPASTI_${tahun}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("success", "File CSV berhasil diunduh.");
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
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Coins className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Katalog Harga Satuan Pokok Wilayah (HSPW)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar harga satuan resmi upah tenaga kerja, material bahan, dan sewa alat berat terintegrasi MySQL.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 btn-animate"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm btn-animate"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data HSPW</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3 card-hover">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode atau nama item..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          {/* Kategori Select */}
          <div className="lg:col-span-2">
            <select
              value={kategoriId}
              onChange={(e) => {
                setKategoriId(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Semua Kategori</option>
              {filtersData.kategoriList.map((k: any) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Wilayah Select */}
          <div className="lg:col-span-2">
            <select
              value={wilayahId}
              onChange={(e) => {
                setWilayahId(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Semua Wilayah</option>
              {filtersData.wilayahList.map((w: any) => (
                <option key={w.id} value={w.id}>
                  {w.kode} - {w.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Status Validasi */}
          <div className="lg:col-span-2">
            <select
              value={statusValidasi}
              onChange={(e) => {
                setStatusValidasi(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Semua Status</option>
              <option value="DISETUJUI">Disetujui</option>
              <option value="MENUNGGU">Menunggu</option>
              <option value="PERLU_PERBAIKAN">Perlu Perbaikan</option>
              <option value="DITOLAK">Ditolak</option>
            </select>
          </div>

          {/* Tahun */}
          <div className="lg:col-span-1">
            <select
              value={tahun}
              onChange={(e) => {
                setTahun(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          {/* Submit Search & Reset */}
          <div className="lg:col-span-1 flex items-center gap-1.5">
            <button
              type="submit"
              className="w-full py-2 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center transition-colors"
              title="Cari"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetFilter}
              className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold border border-slate-300 transition-colors"
              title="Reset Filter"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#12345A] text-white font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Kode HSPW</th>
                <th className="py-3 px-4">Nama Item &amp; Spesifikasi</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Wilayah</th>
                <th className="py-3 px-4 text-center">Satuan</th>
                <th className="py-3 px-4 text-right">Harga Satuan</th>
                <th className="py-3 px-4 text-center">Tahun</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-3.5 px-4">
                      <div className="w-5 h-3 rounded-sm skeleton-shimmer"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-24 h-3.5 rounded-md skeleton-shimmer font-mono"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-48 h-3.5 rounded-md skeleton-shimmer mb-1"></div>
                      <div className="w-32 h-2.5 rounded-md skeleton-shimmer"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-28 h-4 rounded-sm skeleton-shimmer"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-24 h-3 rounded-md skeleton-shimmer"></div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="w-10 h-3 rounded-md skeleton-shimmer mx-auto"></div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="w-20 h-4 rounded-md skeleton-shimmer ml-auto"></div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="w-8 h-3 rounded-md skeleton-shimmer mx-auto"></div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="w-16 h-5 rounded-full skeleton-shimmer mx-auto"></div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="w-16 h-6 rounded-md skeleton-shimmer mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-medium">
                      {(meta.page - 1) * meta.limit + index + 1}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                      {item.kode}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">{item.namaItem}</div>
                      {item.spesifikasi && (
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {item.spesifikasi}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                        {item.kategori?.nama || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {item.wilayah?.nama || "-"}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600 font-semibold whitespace-nowrap">
                      {item.satuan}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-blue-700 whitespace-nowrap">
                      {formatRupiah(item.hargaSatuan)}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600 whitespace-nowrap font-semibold">
                      {item.tahun}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(item.statusValidasi)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit Data"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Data"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-600">Tidak ada data HSPW yang sesuai kriteria pencarian</p>
                    <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci atau reset filter pencarian Anda</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Menampilkan <span className="font-bold text-slate-800">{items.length}</span> dari{" "}
            <span className="font-bold text-slate-800">{meta.total}</span> total item HSPW
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>
            <span className="px-2 font-semibold text-slate-700">
              Hal {meta.page} dari {meta.totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={meta.page >= meta.totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      {isDetailModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Detail Harga Satuan Pokok Wilayah</h3>
                  <span className="text-[10px] font-mono text-slate-500">{selectedItem.kode}</span>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">Nama Item</span>
                <span className="text-sm font-bold text-slate-900">{selectedItem.namaItem}</span>
              </div>

              <div>
                <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">Spesifikasi Teknis</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                  {selectedItem.spesifikasi || "Tidak ada spesifikasi khusus."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">Kategori</span>
                  <span className="font-semibold text-slate-800">{selectedItem.kategori?.nama || "-"}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">Wilayah</span>
                  <span className="font-semibold text-slate-800">{selectedItem.wilayah?.nama || "-"}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">Harga Satuan</span>
                  <span className="text-base font-extrabold text-blue-700">{formatRupiah(selectedItem.hargaSatuan)}</span>
                  <span className="text-slate-500 ml-1">/ {selectedItem.satuan}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">Status Validasi</span>
                  <div className="mt-1">{getStatusBadge(selectedItem.statusValidasi)}</div>
                </div>
              </div>

              {selectedItem.catatanValidasi && (
                <div className="pt-2">
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">Catatan Tim Pemeriksa</span>
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                    {selectedItem.catatanValidasi}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
                <div>Diusulkan oleh: <span className="font-medium text-slate-700">{selectedItem.createdBy?.name || "-"}</span></div>
                {selectedItem.verifiedBy && (
                  <div>Diverifikasi oleh: <span className="font-medium text-slate-700">{selectedItem.verifiedBy.name}</span></div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Tambah Usulan Data HSPW Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kode HSPW</label>
                  <input
                    type="text"
                    required
                    value={formData.kode}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tahun Anggaran</label>
                  <input
                    type="number"
                    required
                    value={formData.tahun}
                    onChange={(e) => setFormData({ ...formData, tahun: parseInt(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Item HSPW</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Semen Portland PCC 50kg"
                  value={formData.namaItem}
                  onChange={(e) => setFormData({ ...formData, namaItem: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Spesifikasi Teknis / Standar SNI</label>
                <textarea
                  rows={2}
                  placeholder="SNI / Merk / Syarat mutu..."
                  value={formData.spesifikasi}
                  onChange={(e) => setFormData({ ...formData, spesifikasi: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kategori</label>
                  <select
                    value={formData.kategoriId}
                    onChange={(e) => setFormData({ ...formData, kategoriId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                  >
                    {filtersData.kategoriList.map((k: any) => (
                      <option key={k.id} value={k.id}>
                        {k.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Wilayah Berlaku</label>
                  <select
                    value={formData.wilayahId}
                    onChange={(e) => setFormData({ ...formData, wilayahId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                  >
                    {filtersData.wilayahList.map((w: any) => (
                      <option key={w.id} value={w.id}>
                        {w.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Satuan Ukur</label>
                  <input
                    type="text"
                    required
                    placeholder="M3 / Zak / OH / Jam"
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Contoh: 75000"
                    value={formData.hargaSatuan}
                    onChange={(e) => setFormData({ ...formData, hargaSatuan: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {modalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Perbarui Data HSPW</h3>
                <span className="text-[10px] font-mono text-slate-500">{formData.kode}</span>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Item HSPW</label>
                <input
                  type="text"
                  required
                  value={formData.namaItem}
                  onChange={(e) => setFormData({ ...formData, namaItem: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Spesifikasi Teknis</label>
                <textarea
                  rows={2}
                  value={formData.spesifikasi}
                  onChange={(e) => setFormData({ ...formData, spesifikasi: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kategori</label>
                  <select
                    value={formData.kategoriId}
                    onChange={(e) => setFormData({ ...formData, kategoriId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                  >
                    {filtersData.kategoriList.map((k: any) => (
                      <option key={k.id} value={k.id}>
                        {k.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Wilayah</label>
                  <select
                    value={formData.wilayahId}
                    onChange={(e) => setFormData({ ...formData, wilayahId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                  >
                    {filtersData.wilayahList.map((w: any) => (
                      <option key={w.id} value={w.id}>
                        {w.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Satuan Ukur</label>
                  <input
                    type="text"
                    required
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.hargaSatuan}
                    onChange={(e) => setFormData({ ...formData, hargaSatuan: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {modalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Perbarui Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {isDeleteModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Data</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus data item{" "}
                <span className="font-bold text-slate-800">{selectedItem.namaItem}</span> ({selectedItem.kode}) dari database?
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-1/2 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={modalLoading}
                className="w-1/2 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {modalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

