"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-h-screen md:pl-64">
        {/* Header */}
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <span>
              SIPASTI &copy; {new Date().getFullYear()} &mdash; Sistem Informasi Pengelolaan Data dan Informasi Konstruksi
            </span>
            <span className="text-[11px] text-slate-400">
              Kementerian Pekerjaan Umum dan Perumahan Rakyat RI
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

