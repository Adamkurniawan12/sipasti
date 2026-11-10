"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { formatDateIndo } from "@/lib/utils";
import {
  User,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  Briefcase,
  MapPin,
  Calendar,
} from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    nip: "",
    jabatan: "",
    instansi: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const json = await res.json();
        setProfile(json);
        setFormData({
          name: json.name || "",
          nip: json.nip || "",
          jabatan: json.jabatan || "",
          instansi: json.instansi || "",
          phone: json.phone || "",
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmNewPassword) {
        showToast("error", "Konfirmasi password baru tidak cocok.");
        return;
      }
      if (!formData.currentPassword) {
        showToast("error", "Kata sandi lama wajib diisi untuk mengganti kata sandi.");
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          nip: formData.nip,
          jabatan: formData.jabatan,
          instansi: formData.instansi,
          phone: formData.phone,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        showToast("success", json.message);
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        }));
        fetchProfile();
      } else {
        showToast("error", json.message || "Gagal memperbarui profil.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan koneksi.");
    } finally {
      setSaving(false);
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
          {notification.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Profil Pengguna &amp; Keamanan Akun
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data diri ASN/Penyedia, kontak dinas, dan perbarui kata sandi akun Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Info Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 text-center card-hover">
            {loading ? (
              <div className="space-y-3">
                <div className="w-20 h-20 rounded-full skeleton-shimmer mx-auto"></div>
                <div className="w-36 h-4 rounded-md skeleton-shimmer mx-auto"></div>
                <div className="w-24 h-3 rounded-md skeleton-shimmer mx-auto"></div>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-[#12345A] text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-md">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900">{profile?.name}</h3>
                <p className="text-xs text-slate-500 font-mono">@{profile?.username}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{profile?.role}</span>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 text-left space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{profile?.email}</span>
                  </div>
                  {profile?.nip && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-mono">NIP. {profile.nip}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{profile?.instansi}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{profile?.wilayah}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Terdaftar: {formatDateIndo(profile?.createdAt)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 card-hover">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              Perbarui Informasi Akun
            </h3>

            {loading ? (
              <div className="space-y-4">
                <div className="w-full h-8 rounded-md skeleton-shimmer"></div>
                <div className="w-full h-8 rounded-md skeleton-shimmer"></div>
                <div className="w-full h-8 rounded-md skeleton-shimmer"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                    Nama Lengkap &amp; Gelar
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                      NIP Pegawai
                    </label>
                    <input
                      type="text"
                      value={formData.nip}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                      placeholder="19850101xxxx..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                      Jabatan Fungsional
                    </label>
                    <input
                      type="text"
                      value={formData.jabatan}
                      onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                      Instansi / Satuan Kerja
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.instansi}
                      onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                      Nomor HP / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {/* Ganti Kata Sandi Section */}
                <div className="pt-4 border-t border-slate-200 mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Ubah Kata Sandi (Opsional)
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Kosongkan bagian ini jika Anda tidak ingin mengganti kata sandi akun Anda.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">
                        Kata Sandi Lama
                      </label>
                      <input
                        type="password"
                        placeholder="Masukkan sandi lama"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 text-[11px] mb-1">
                          Kata Sandi Baru (Min. 6 Karakter)
                        </label>
                        <input
                          type="password"
                          placeholder="Sandi baru"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 text-[11px] mb-1">
                          Konfirmasi Sandi Baru
                        </label>
                        <input
                          type="password"
                          placeholder="Ulangi sandi baru"
                          value={formData.confirmNewPassword}
                          onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md btn-animate disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

