"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Coins,
  CheckCircle2,
  MapPin,
  FileSpreadsheet,
  Users,
  LogOut,
  Building2,
  ShieldCheck,
  X,
  FileText,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const rawRole = session?.user?.role || "USER";
  const role = (rawRole === "SUPER_ADMIN" || rawRole === "VERIFIKATOR" || rawRole === "ADMIN") ? "ADMIN" : "USER";

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "USER"],
    },
    {
      name: "Data HSPW",
      href: "/hspw",
      icon: Coins,
      roles: ["ADMIN", "USER"],
      description: "Harga Satuan Pokok Wilayah",
    },
    {
      name: "Pengajuan Usulan",
      href: "/pengajuan",
      icon: FileText,
      roles: ["ADMIN", "USER"],
      description: "Usulan harga satuan baru",
    },
    {
      name: "Validasi Data",
      href: "/validasi",
      icon: CheckCircle2,
      roles: ["ADMIN"],
      description: "Verifikasi pengajuan harga",
    },
    {
      name: "Pengelolaan Wilayah",
      href: "/wilayah",
      icon: MapPin,
      roles: ["ADMIN"],
      description: "Provinsi, Kab/Kota",
    },
    {
      name: "Laporan & Rekap",
      href: "/laporan",
      icon: FileSpreadsheet,
      roles: ["ADMIN", "USER"],
      description: "Ekspor & Cetak Data",
    },
    {
      name: "Manajemen Pengguna",
      href: "/users",
      icon: Users,
      roles: ["ADMIN"],
      description: "Akun & Hak Akses",
    },
  ];

  const filteredNav = navigation.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#0B2545] text-white transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-xl`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 bg-[#12345A] border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white shadow-md group-hover:bg-blue-500 transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-wider text-white">SIPASTI</span>
              <span className="block text-[10px] text-blue-200 font-medium tracking-wide">
                KONS-INFO NASIONAL
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-white/10 md:hidden"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instansi Ribbon */}
        <div className="px-4 py-2.5 bg-blue-950/60 border-b border-white/5">
          <p className="text-[11px] text-slate-300 line-clamp-1 font-medium">
            Sistem Pengelolaan Data Konstruksi
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">
              Server MySQL Terhubung
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu Navigasi
          </div>
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onClose()}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/40 font-semibold"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-300"}`} />
                <div className="flex-1 truncate">
                  <div>{item.name}</div>
                  {item.description && (
                    <div className="text-[10px] text-slate-400 font-normal truncate">
                      {item.description}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-3.5 bg-[#12345A] border-t border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-black/20">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 font-semibold text-white text-sm">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {session?.user?.name || "Pengguna"}
              </p>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-[10px] font-medium text-emerald-300 uppercase tracking-wide truncate">
                  {session?.user?.roleName || role}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center justify-center gap-2 w-full mt-2.5 px-3 py-2 text-xs font-medium text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 hover:text-white border border-rose-800/40 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>
    </>
  );
}

