"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { formatDateTimeIndo } from "@/lib/utils";
import {
  Menu,
  Bell,
  CheckCheck,
  Building2,
  User,
  ShieldCheck,
  LogOut,
  X,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Notification states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard Utama",
    "/hspw": "Harga Satuan Pokok Wilayah (HSPW)",
    "/validasi": "Validasi & Verifikasi Data",
    "/wilayah": "Pengelolaan Data Wilayah",
    "/laporan": "Laporan & Rekapitulasi",
    "/users": "Manajemen Pengguna & Hak Akses",
    "/profile": "Profil & Pengaturan Akun",
  };

  const getBreadcrumbTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (pathname === path || pathname.startsWith(path + "/")) {
        return title;
      }
    }
    return "Sistem Informasi";
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.notifications || []);
        setUnreadCount(json.unreadCount || 0);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling tiap 30 detik
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Ignore
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case "WARNING":
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case "ERROR":
        return <XCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-slate-200 shadow-xs">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 rounded-lg md:hidden hover:bg-slate-100 focus:outline-hidden"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="hidden sm:inline">SIPASTI</span>
            <span className="hidden sm:inline">/</span>
            <span className="text-blue-600 font-semibold">{getBreadcrumbTitle()}</span>
          </div>
          <h1 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
            {getBreadcrumbTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Date, Notifications, User Badge */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Date Display (Desktop) */}
        <div className="hidden lg:flex flex-col text-right">
          <span className="text-xs font-semibold text-slate-700">{today}</span>
          <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 justify-end">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Database MySQL Aktif
          </span>
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotifOpen((prev) => !prev);
              setIsProfileOpen(false);
            }}
            className="p-2 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors relative"
            title="Pemberitahuan Sistem"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Popover */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3.5 bg-[#12345A] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-300" />
                  <span className="text-xs font-bold tracking-wide">Pemberitahuan Sistem</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-[10px] font-bold">
                      {unreadCount} Baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-blue-200 hover:text-white flex items-center gap-1 font-semibold"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Tandai Semua Dibaca</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 text-xs transition-colors hover:bg-slate-50 flex items-start gap-2.5 ${
                        !n.isRead ? "bg-blue-50/40" : ""
                      }`}
                    >
                      {getNotifIcon(n.type)}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 line-clamp-1">{n.title}</div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                          {n.message}
                        </p>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                          <span>{formatDateTimeIndo(n.createdAt)}</span>
                          {n.link && (
                            <Link
                              href={n.link}
                              onClick={() => setIsNotifOpen(false)}
                              className="text-blue-600 hover:underline font-semibold flex items-center gap-0.5"
                            >
                              <span>Buka</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    <Bell className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    <span>Tidak ada pemberitahuan baru</span>
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <span className="text-[10px] text-slate-500 font-medium">
                  Notifikasi otomatis sinkronisasi audit validasi data
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setIsProfileOpen((prev) => !prev);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2.5 pl-3 border-l border-slate-200 text-left hover:opacity-90 transition-opacity focus:outline-hidden"
          >
            <div className="w-8 h-8 rounded-full bg-[#12345A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[140px]">
                {session?.user?.name || "Pengguna"}
              </p>
              <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                {session?.user?.roleName || "User"}
              </p>
            </div>
          </button>

          {/* Profile Menu Popover */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-4 bg-gradient-to-r from-[#12345A] to-[#0B2545] text-white">
                <p className="text-xs font-bold truncate">{session?.user?.name}</p>
                <p className="text-[11px] text-blue-200 truncate">{session?.user?.email}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                    {session?.user?.roleName}
                  </span>
                </div>
              </div>

              <div className="p-3 text-xs text-slate-600 space-y-2 border-b border-slate-100">
                {session?.user?.nip && (
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">NIP PEGAWAI</span>
                    <span className="font-mono text-slate-800">{session.user.nip}</span>
                  </div>
                )}
                {session?.user?.jabatan && (
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">JABATAN</span>
                    <span className="text-slate-800">{session.user.jabatan}</span>
                  </div>
                )}
                {session?.user?.instansi && (
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">SATUAN KERJA</span>
                    <span className="text-slate-800 line-clamp-1">{session.user.instansi}</span>
                  </div>
                )}
              </div>

              <div className="p-2 space-y-1">
                <Link
                  href="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Profil &amp; Keamanan Akun</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar Sistem</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
