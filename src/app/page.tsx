"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const featureCards = [
  {
    title: "Manajemen HSPW Terstruktur",
    description:
      "Mengelola harga satuan pokok wilayah berdasarkan kategori, wilayah, dan tahun anggaran dengan kontrol data yang terukur.",
    tone: "bg-blue-50 text-blue-700",
  },
  {
    title: "Validasi Bertingkat",
    description:
      "Proses pengajuan, telaah, persetujuan, revisi, dan penolakan berjalan dalam alur yang jelas dengan jejak audit yang lengkap.",
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Katalog Wilayah & Kategori",
    description:
      "Data dikelola secara terorganisir per wilayah, komoditas, dan klasifikasi pekerjaan agar konsumsi informasi lebih presisi.",
    tone: "bg-violet-50 text-violet-700",
  },
];

const metricCards = [
  { label: "Provinsi terhubung", value: "38+" },
  { label: "Status validasi", value: "100%" },
  { label: "Standar referensi", value: "SNI" },
];

const serviceSlides = [
  {
    title: "Harga konstruksi terpusat",
    description:
      "Kelola harga satuan tenaga kerja, material, dan alat berat dalam satu katalog yang mudah ditelusuri.",
    number: "01",
  },
  {
    title: "Siap untuk perencanaan",
    description:
      "Gunakan rekapitulasi data wilayah sebagai referensi penyusunan kebutuhan proyek dan anggaran.",
    number: "02",
  },
  {
    title: "Validasi terdokumentasi",
    description:
      "Setiap usulan melewati alur pemeriksaan formal dengan status yang jelas dan riwayat yang tercatat.",
    number: "03",
  },
  {
    title: "Analisis berbasis data",
    description:
      "Pantau ringkasan data dan perkembangan validasi untuk membantu pengambilan keputusan.",
    number: "04",
  },
];

const statsRows = [
  { title: "Trend harga material", value: "+12.4%", detail: "dari tahun lalu" },
  {
    title: "Persetujuan usulan",
    value: "68.2%",
    detail: "rata-rata per wilayah",
  },
  { title: "Wilayah terdata", value: "94.8%", detail: "coverage nasional" },
];

export default function LandingPage() {
  const [activeService, setActiveService] = useState(0);

  useEffect(() => {
    const revealElements =
      document.querySelectorAll<HTMLElement>(".scroll-reveal");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    revealElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveService((current) => (current + 1) % serviceSlides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const showService = (index: number) => {
    setActiveService((index + serviceSlides.length) % serviceSlides.length);
  };

  return (
    <div className="min-h-screen bg-[#F3F7FB] text-slate-900">
      <div className="bg-[#0B2545] text-slate-200 text-[11px] border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Portal Resmi Data Konstruksi Nasional Republik Indonesia
            </span>
          </div>
          <div className="hidden text-slate-400 sm:block">
            Terintegrasi Database MySQL &bull; Standar SNI PUPR
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#12345A]/95 text-white backdrop-blur-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-950/30 text-sm font-black text-white">
              S
            </div>
            <div>
              <div className="text-xl font-black tracking-[0.16em]">
                SIPASTI
              </div>
              <div className="text-[10px] font-medium tracking-[0.12em] text-blue-100 uppercase">
                Konstruksi &amp; HSPW
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-200 md:flex">
            <a href="#fitur" className="transition-colors hover:text-white">
              Fitur
            </a>
            <a href="#layanan" className="transition-colors hover:text-white">
              Layanan
            </a>
            <a href="#statistik" className="transition-colors hover:text-white">
              Statistik
            </a>
            <a href="#tentang" className="transition-colors hover:text-white">
              Tentang
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/register"
              className="hidden rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10 sm:inline-flex"
            >
              Daftar Akun
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition-all hover:bg-blue-500"
            >
              <span>Masuk Portal</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.2),transparent_30%),linear-gradient(135deg,#12345A_0%,#0B2545_48%,#0f172a_100%)] py-16 text-white md:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
          <div className="scroll-reveal relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="space-y-7 lg:col-span-7">
              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl lg:text-[4.6rem] lg:leading-[0.9]">
                  <span className="block">SIPASTI</span>
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  SIPASTI membantu instansi dan mitra kerja menyusun, mengelola,
                  memvalidasi, dan memantau data HSPW secara terstruktur
                  sehingga keputusan anggaran dan perencanaan proyek lebih
                  tepat.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-bold text-white shadow-xl shadow-blue-950/30 transition-transform hover:-translate-y-0.5 hover:bg-blue-500"
                >
                  Akses Dashboard
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Daftar Pengguna Baru
                </Link>
              </div>

              <div className="grid max-w-xl grid-cols-3 gap-4 pt-4">
                {metricCards.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
                  >
                    <div className="text-2xl font-black text-white">
                      {item.value}
                    </div>
                    <div className="mt-1 text-[11px] leading-5 text-slate-300">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-[28px] border border-white/15 bg-white/10 p-4 shadow-[0_30px_90px_rgba(15,23,42,0.45)] backdrop-blur-md">
                <div className="rounded-[22px] bg-[#F8FBFF] p-6 text-slate-800">
                  <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-rose-400" />
                      <span className="h-3 w-3 rounded-full bg-amber-400" />
                      <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      Live Data Preview
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3.5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
                            Upah Tenaga Kerja
                          </div>
                          <div className="mt-1 text-sm font-bold text-slate-800">
                            Tukang Batu Terampil
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-500">
                            DKI Jakarta
                          </div>
                          <div className="text-sm font-black text-blue-700">
                            Rp 165.000 / OH
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                            Material Pokok
                          </div>
                          <div className="mt-1 text-sm font-bold text-slate-800">
                            Semen Portland PCC 50kg
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-500">
                            Jawa Barat
                          </div>
                          <div className="text-sm font-black text-emerald-700">
                            Rp 78.500 / Zak
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                            Alat Berat
                          </div>
                          <div className="mt-1 text-sm font-bold text-slate-800">
                            Excavator 0.9 M3 / 130 HP
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-500">
                            Jawa Timur
                          </div>
                          <div className="text-sm font-black text-violet-700">
                            Rp 580.000 / Jam
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-slate-900 p-3 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                          Status sistem
                        </div>
                        <div className="mt-1 text-sm font-semibold text-emerald-400">
                          Semua data terverifikasi
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="fitur" className="bg-white py-20">
          <div className="scroll-reveal mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Fitur
              </h2>
            </div>

            <div className="mt-12 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {featureCards.map(({ title, description, tone }) => (
                <div
                  key={title}
                  className="scroll-reveal rounded-3xl border border-slate-200 bg-[#F8FAFC] p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${tone} text-base font-bold`}
                  >
                    0
                    {1 + featureCards.findIndex((item) => item.title === title)}
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-slate-900">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="layanan" className="bg-slate-100 py-20">
          <div className="scroll-reveal mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
                Layanan
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Data
              </h2>

              <div
                className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                role="region"
                aria-roledescription="carousel"
                aria-label="Layanan SIPASTI"
              >
                <div className="flex min-h-48 flex-col justify-between sm:min-h-44">
                  <div key={activeService} className="service-slide-enter">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-700">
                        {serviceSlides[activeService].number}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                        Layanan SIPASTI
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-black text-slate-900 sm:text-2xl">
                      {serviceSlides[activeService].title}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-7 text-slate-600">
                      {serviceSlides[activeService].description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4">
                    <div
                      className="flex items-center gap-2"
                      aria-label="Pilih layanan"
                    >
                      {serviceSlides.map((slide, index) => (
                        <button
                          key={slide.number}
                          type="button"
                          onClick={() => showService(index)}
                          aria-label={`Tampilkan layanan ${index + 1}`}
                          aria-current={
                            activeService === index ? "true" : undefined
                          }
                          className={`h-2.5 rounded-full transition-all ${
                            activeService === index
                              ? "w-8 bg-blue-600"
                              : "w-2.5 bg-slate-300 hover:bg-blue-300"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => showService(activeService - 1)}
                        aria-label="Layanan sebelumnya"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => showService(activeService + 1)}
                        aria-label="Layanan berikutnya"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-[#12345A] p-6 text-white shadow-xl shadow-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-blue-200">
                    Dashboard ringkasan
                  </p>
                  <h3 className="mt-2 text-2xl font-black">
                    Status Kinerja Sistem
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sm font-black text-emerald-300">
                  +
                </div>
              </div>

              <div className="mt-8 space-y-5">
                {statsRows.map((row) => (
                  <div
                    key={row.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-300">
                        {row.title}
                      </span>
                      <span className="text-xl font-black text-white">
                        {row.value}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      {row.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="statistik" className="bg-white py-20">
          <div className="scroll-reveal mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-[30px] border border-slate-200 bg-[#F8FAFC] p-7 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
                      Analisis data
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-slate-900">
                      Kinerja per komponen
                    </h3>
                  </div>
                </div>

                <div className="mt-8 space-y-5">
                  {[
                    {
                      label: "Material bangunan",
                      value: 82,
                      color: "bg-blue-600",
                    },
                    {
                      label: "Tenaga kerja",
                      value: 74,
                      color: "bg-blue-600",
                    },
                    { label: "Alat berat", value: 68, color: "bg-blue-600" },
                    {
                      label: "Wilayah & validasi",
                      value: 88,
                      color: "bg-blue-600",
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                        <span>{item.label}</span>
                        <span className="font-bold text-slate-900">
                          {item.value}%
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`${item.color} h-full rounded-full`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] border border-slate-200 bg-[#12345A] p-7 text-white shadow-xl shadow-slate-200/80">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-200">
                      Sistem terintegrasi
                    </p>
                    <h3 className="mt-2 text-2xl font-black">
                      Arsitektur utama
                    </h3>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {[
                    "Next.js App Router untuk frontend modern",
                    "Prisma ORM yang menghubungkan database MySQL secara aman",
                    "Auth.js untuk sesi dan role-based access control",
                    "Dashboard & laporan untuk analisis keperluan dinas",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5"
                    >
                      <p className="text-sm leading-7 text-slate-200">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:px-6 lg:flex-row lg:px-8">
          <div className="font-semibold text-slate-700">SIPASTI</div>
          <div>© 2026 Sistem Informasi Pengelolaan Data Konstruksi</div>
        </div>
      </footer>
    </div>
  );
}
