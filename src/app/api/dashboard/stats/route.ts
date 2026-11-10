import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    // 1. Total counters
    const [
      totalHspw,
      totalDisetujui,
      totalMenunggu,
      totalPerluPerbaikan,
      totalDitolak,
      totalWilayah,
      totalUsers,
    ] = await Promise.all([
      prisma.hspw.count(),
      prisma.hspw.count({ where: { statusValidasi: "DISETUJUI" } }),
      prisma.hspw.count({ where: { statusValidasi: "MENUNGGU" } }),
      prisma.hspw.count({ where: { statusValidasi: "PERLU_PERBAIKAN" } }),
      prisma.hspw.count({ where: { statusValidasi: "DITOLAK" } }),
      prisma.wilayah.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
    ]);

    // 2. Data per Kategori
    const kategoriCounts = await prisma.kategoriData.findMany({
      select: {
        id: true,
        kode: true,
        nama: true,
        _count: {
          select: { hspwItems: true },
        },
      },
      orderBy: { urutan: "asc" },
    });

    const categoryStats = kategoriCounts.map((k) => ({
      name: k.nama,
      kode: k.kode,
      total: k._count.hspwItems,
    }));

    // 3. Status Validasi Chart Data
    const validationStats = [
      { name: "Disetujui", value: totalDisetujui, color: "#16A34A" },
      { name: "Menunggu", value: totalMenunggu, color: "#F59E0B" },
      { name: "Perlu Perbaikan", value: totalPerluPerbaikan, color: "#3B82F6" },
      { name: "Ditolak", value: totalDitolak, color: "#DC2626" },
    ];

    // 4. Data per Wilayah (Top 5 wilayah dengan jumlah HSPW)
    const wilayahHspw = await prisma.wilayah.findMany({
      take: 6,
      select: {
        id: true,
        nama: true,
        kode: true,
        _count: {
          select: { hspwItems: true },
        },
      },
      orderBy: {
        hspwItems: {
          _count: "desc",
        },
      },
    });

    const wilayahStats = wilayahHspw.map((w) => ({
      name: w.nama,
      total: w._count.hspwItems,
    }));

    // 5. Recent Activity Logs (5 terbaru)
    const recentActivities = await prisma.activityLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            username: true,
            role: { select: { label: true } },
          },
        },
      },
    });

    // 6. Recent HSPW Items
    const recentHspw = await prisma.hspw.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        kategori: { select: { nama: true } },
        wilayah: { select: { nama: true } },
        createdBy: { select: { name: true } },
      },
    });

    return NextResponse.json({
      counters: {
        totalHspw,
        totalDisetujui,
        totalMenunggu,
        totalPerluPerbaikan,
        totalDitolak,
        totalWilayah,
        totalUsers,
      },
      categoryStats,
      validationStats,
      wilayahStats,
      recentActivities,
      recentHspw,
    });
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data statistik dashboard", error: error.message },
      { status: 500 }
    );
  }
}
