"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { formatDateIndo } from "@/lib/utils";
import {
  Users,
  Search,
  Plus,
  Shield,
  Edit2,
  Trash2,
  KeyRound,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  Building,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [wilayahList, setWilayahList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    nip: "",
    jabatan: "",
    instansi: "",
    phone: "",
    roleName: "USER",
    wilayahId: "",
    status: "ACTIVE",
  });

  const [newPassword, setNewPassword] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        role: roleFilter,
        status: statusFilter,
      });

      const res = await fetch(`/api/users?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data);
        setRoles(json.roles);
        setWilayahList(json.wilayahList);
      }
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const openAddModal = () => {
    setModalMode("ADD");
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "password123",
      nip: "",
      jabatan: "",
      instansi: "",
      phone: "",
      roleName: "USER",
      wilayahId: "",
      status: "ACTIVE",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setModalMode("EDIT");
    setSelectedUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      password: "",
      nip: user.nip || "",
      jabatan: user.jabatan || "",
      instansi: user.instansi || "",
      phone: user.phone || "",
      roleName: user.role?.name || "USER",
      wilayahId: user.wilayah?.id || "",
      status: user.status,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (modalMode === "ADD") {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const json = await res.json();
        if (res.ok) {
          showToast("success", json.message);
          setIsModalOpen(false);
          fetchUsers();
        } else {
          showToast("error", json.message || "Gagal menambahkan pengguna");
        }
      } else {
        const res = await fetch(`/api/users/${selectedUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            nip: formData.nip,
            jabatan: formData.jabatan,
            instansi: formData.instansi,
            phone: formData.phone,
            roleName: formData.roleName,
            wilayahId: formData.wilayahId || null,
            status: formData.status,
          }),
        });

        const json = await res.json();
        if (res.ok) {
          showToast("success", json.message);
          setIsModalOpen(false);
          fetchUsers();
        } else {
          showToast("error", json.message || "Gagal memperbarui pengguna");
        }
      }
    } catch {
      showToast("error", "Terjadi kesalahan koneksi");
    } finally {
      setModalLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast("error", "Password minimal 6 karakter");
      return;
    }

    setModalLoading(true);
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const json = await res.json();
      if (res.ok) {
        showToast("success", "Password berhasil direset");
        setIsResetPassModalOpen(false);
        setNewPassword("");
      } else {
        showToast("error", json.message || "Gagal mereset password");
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    setModalLoading(true);
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok) {
        showToast("success", json.message);
        setIsDeleteModalOpen(false);
        fetchUsers();
      } else {
        showToast("error", json.message || "Gagal menghapus pengguna");
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan");
    } finally {
      setModalLoading(false);
    }
  };

  const getRoleBadge = (roleName: string) => {
    switch (roleName) {
      case "ADMIN":
      case "SUPER_ADMIN":
      case "VERIFIKATOR":
        return <span className="px-2 py-0.5 rounded-sm bg-blue-100 text-blue-800 text-[10px] font-bold">Administrator</span>;
      default:
        return <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 text-[10px] font-bold">User Pengguna</span>;
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
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Manajemen Pengguna &amp; Hak Akses
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan akun ASN dinas, verifikator teknis, dan pengaturan role-based access control (RBAC).
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm btn-animate self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengguna</span>
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
              placeholder="Cari nama, NIP, instansi..."
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

        <div className="sm:w-44">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Semua Role</option>
            <option value="ADMIN">Administrator</option>
            <option value="USER">User Pengguna</option>
          </select>
        </div>

        <div className="sm:w-36">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Nonaktif</option>
            <option value="SUSPENDED">Ditangguhkan</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#12345A] text-white font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Nama Lengkap &amp; NIP</th>
                <th className="py-3 px-4">Username &amp; Email</th>
                <th className="py-3 px-4">Instansi &amp; Jabatan</th>
                <th className="py-3 px-4">Role Akses</th>
                <th className="py-3 px-4">Wilayah</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-3 px-4">
                      <div className="w-36 h-3.5 rounded-md skeleton-shimmer mb-1"></div>
                      <div className="w-24 h-2.5 rounded-md skeleton-shimmer"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-24 h-3 rounded-md skeleton-shimmer mb-1"></div>
                      <div className="w-32 h-2.5 rounded-md skeleton-shimmer"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-40 h-3 rounded-md skeleton-shimmer mb-1"></div>
                      <div className="w-28 h-2.5 rounded-md skeleton-shimmer"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-20 h-4 rounded-sm skeleton-shimmer"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-24 h-3 rounded-md skeleton-shimmer"></div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="w-14 h-4 rounded-full skeleton-shimmer mx-auto"></div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="w-20 h-5 rounded-md skeleton-shimmer mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {user.nip ? `NIP. ${user.nip}` : "Non-ASN"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700">{user.username}</div>
                      <div className="text-[10px] text-slate-400">{user.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 line-clamp-1">{user.instansi || "-"}</div>
                      <div className="text-[10px] text-slate-400">{user.jabatan || "-"}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getRoleBadge(user.role?.name)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {user.wilayah?.nama || "Pusat / Seluruh"}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {user.status === "ACTIVE" ? (
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
                          onClick={() => {
                            setSelectedUser(user);
                            setIsResetPassModalOpen(true);
                          }}
                          className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                          title="Edit Pengguna"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                          title="Hapus Pengguna"
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
                    Tidak ditemukan data pengguna
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {modalMode === "ADD" ? "Tambah Akun Pengguna Baru" : "Perbarui Akun Pengguna"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Lengkap &amp; Gelar</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso, S.T., M.T."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Username</label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === "EDIT"}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Dinas</label>
                  <input
                    type="email"
                    required
                    disabled={modalMode === "EDIT"}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 disabled:opacity-60"
                  />
                </div>
              </div>

              {modalMode === "ADD" && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Password Awal</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">NIP (Nomor Induk Pegawai)</label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="1985xxxx..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jabatan Fungsional</label>
                  <input
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    placeholder="Pembina Jasa Konstruksi"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Instansi / Satuan Kerja</label>
                <input
                  type="text"
                  value={formData.instansi}
                  onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                  placeholder="Dinas PU Bina Marga Provinsi..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Role Akses</label>
                  <select
                    value={formData.roleName}
                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="USER">User Pengguna</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Wilayah Kerja</label>
                  <select
                    value={formData.wilayahId}
                    onChange={(e) => setFormData({ ...formData, wilayahId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Pusat / Nasional</option>
                    {wilayahList.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status Akun</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="ACTIVE">Aktif</option>
                    <option value="INACTIVE">Nonaktif</option>
                    <option value="SUSPENDED">Ditangguhkan</option>
                  </select>
                </div>
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
                  <span>{modalMode === "ADD" ? "Daftarkan Pengguna" : "Simpan Perubahan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {isResetPassModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <KeyRound className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Reset Password Pengguna</h3>
            </div>

            <p className="text-xs text-slate-500">
              Ubah kata sandi untuk akun <span className="font-bold text-slate-800">{selectedUser.name}</span> ({selectedUser.username})
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Password Baru (Min. 6 Karakter)</label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan kata sandi baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsResetPassModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {modalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Reset Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Pengguna */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-slate-900">Hapus Akun Pengguna</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun{" "}
                <span className="font-bold text-slate-800">{selectedUser.name}</span> ({selectedUser.username}) secara permanen?
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

