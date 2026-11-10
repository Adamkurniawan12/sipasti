import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/layout/SessionProvider";

export const metadata: Metadata = {
  title: "SIPASTI - Sistem Informasi Pengelolaan Data dan Informasi Konstruksi",
  description:
    "Portal resmi pengelolaan data Harga Satuan Pokok Wilayah (HSPW), informasi konstruksi, dan validasi data terpadu instansi pemerintahan.",
  keywords: [
    "SIPASTI",
    "HSPW",
    "Konstruksi",
    "Harga Satuan",
    "PUPR",
    "Data Konstruksi",
    "Pemerintah",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#F5F7FA] text-[#1E293B]">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
