"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import {
  MapPin,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  Building,
  Layers,
} from "lucide-react";

export default function WilayahPage() {
  const [items, setItems] = useState<any[]>([]);
  const [provinsiList, setProvinsiList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");

  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    level: "PROVINSI",
    parentId: "",
    status: true,
  });

  const [modalLoading, setModalLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        level: levelFilter,
      });

      const res = await fetch(`/api/wilayah?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setItems(json.data);
        setProvinsiList(json.provinsiList);
      }
    } catch (e) {
      console.error("Failed to load wilayah", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [levelFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const openAddModal = () => {
    setModalMode("ADD");
    setFormData({
      kode: "",
      nama: "",
      level: "PROVINSI",
      parentId: "",
      status: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setModalMode("EDIT");
    setSelectedItem(item);
    setFormData({
      kode: item.kode,
      nama: item.nama,
      level: item.level,
      parentId: item.parentId || "",
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (modalMode === "ADD") {
        const res = await fetch("/api/wilayah", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kode: formData.kode.trim(),
            nama: formData.nama.trim(),
            level: formData.level,
            parentId: formData.level === "KABUPATEN_KOTA" ? formData.parentId : null,
            status: formData.status,
          }),
        });

        const json = await res.json();
        if (res.ok) {
          showToast("success", json.message);
          setIsModalOpen(false);
          fetchData();
        } else {
          showToast("error", json.message || "Gagal menambahkan wilayah");
        }
      } else {
        const res = await fetch(`/api/wilayah/${selectedItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama: formData.nama.trim(),
            level: formData.level,
            parentId: formData.level === "KABUPATEN_KOTA" ? formData.parentId : null,
            status: formData.status,
          }),
        });

        const json = await res.json();
        if (res.ok) {
          showToast("success", json.message);
          setIsModalOpen(false);
          fetchData();
        } else {
          showToast("error", json.message || "Gagal memperbarui wilayah");
        }
      }
    } catch {
      showToast("error", "Terjadi kesalahan koneksi");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedItem) return;
    setModalLoading(true);
    try {
      const res = await fetch(`/api/wilayah/${selectedItem.id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok) {
        showToast("success", json.message);
        setIsDeleteModalOpen(false);
        fetchData();
      } else {
        showToast("error", json.message || "Gagal menghapus wilayah");
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan");
    } finally {
      setModalLoading(false);
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
          {notification.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Pengelolaan Data Wilayah Administrasi
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data zonasi provinsi dan kabupaten/kota yang menjadi acuan penetapan Harga Satuan Pokok Wilayah (HSPW).
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm btn-animate self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Wilayah</span>
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
              placeholder="Cari kode atau nama wilayah..."
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

        <div className="sm:w-48">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Semua Tingkatan</option>
            <option value="PROVINSI">Provinsi</option>
            <option value="KABUPATEN_KOTA">Kabupaten / Kota</option>
          </select>
        </div>
      </div>

      {/* Table Wilayah */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#12345A] text-white font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Nama Wilayah</th>
                <th className="py-3 px-4">Tingkatan (Level)</th>
                <th className="py-3 px-4">Induk (Provinsi)</th>
                <th className="py-3 px-4 text-center">Data HSPW</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-3 px-4">
                      <div className="w-16 h-3.5 rounded-md skeleton-shimmer font-mono"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-40 h-3.5 rounded-md skeleton-shimmer"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-20 h-4 rounded-sm skeleton-shimmer"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-28 h-3 rounded-md skeleton-shimmer"></div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="w-12 h-3 rounded-md skeleton-shimmer mx-auto"></div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="w-14 h-4 rounded-full skeleton-shimmer mx-auto"></div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="w-16 h-5 rounded-md skeleton-shimmer mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                      {item.kode}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.nama}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                          item.level === "PROVINSI"
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {item.level === "PROVINSI" ? "Provinsi" : "Kab / Kota"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {item.parent ? `${item.parent.kode} - ${item.parent.nama}` : "-"}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700 whitespace-nowrap">
                      {item._count?.hspwItems || 0} item
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {item.status ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                          title="Edit Wilayah"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                          title="Hapus Wilayah"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data wilayah
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {modalMode === "ADD" ? "Tambah Data Wilayah Baru" : "Perbarui Data Wilayah"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Kode Wilayah Resmi</label>
                <input
                  type="text"
                  required
                  disabled={modalMode === "EDIT"}
                  placeholder="Contoh: 31 atau 31.71"
                  value={formData.kode}
                  onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Wilayah</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kota Semarang"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Tingkatan (Level)</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                >
                  <option value="PROVINSI">Provinsi</option>
                  <option value="KABUPATEN_KOTA">Kabupaten / Kota</option>
                </select>
              </div>

              {formData.level === "KABUPATEN_KOTA" && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Provinsi Induk</label>
                  <select
                    required
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Pilih Provinsi Induk</option>
                    {provinsiList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.kode} - {p.nama}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="statusWilayah"
                  checked={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                  className="w-4 h-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="statusWilayah" className="text-slate-700 font-medium">
                  Status Wilayah Aktif untuk HSPW
                </label>
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
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {modalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{modalMode === "ADD" ? "Simpan Wilayah" : "Perbarui"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Wilayah */}
      {isDeleteModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-slate-900">Hapus Data Wilayah</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus data wilayah{" "}
                <span className="font-bold text-slate-800">{selectedItem.nama}</span> ({selectedItem.kode})?
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

