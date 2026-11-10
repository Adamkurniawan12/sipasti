import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tahun = searchParams.get("tahun") ? parseInt(searchParams.get("tahun")!) : undefined;
    const wilayahId = searchParams.get("wilayahId") || "";
    const kategoriId = searchParams.get("kategoriId") || "";
    const statusValidasi = searchParams.get("statusValidasi") || "";

    const whereClause: any = {};
    if (tahun) whereClause.tahun = tahun;
    if (wilayahId) whereClause.wilayahId = wilayahId;
    if (kategoriId) whereClause.kategoriId = kategoriId;
    if (statusValidasi) whereClause.statusValidasi = statusValidasi;

    // Ambil data items
    const items = await prisma.hspw.findMany({
      where: whereClause,
      orderBy: [{ tahun: "desc" }, { kategori: { urutan: "asc" } }, { kode: "asc" }],
      include: {
        kategori: { select: { kode: true, nama: true } },
        wilayah: { select: { kode: true, nama: true, level: true } },
        createdBy: { select: { name: true, instansi: true } },
        verifiedBy: { select: { name: true, nip: true } },
      },
    });

    // Statistik Agregat
    const totalData = items.length;
    const approvedCount = items.filter((i) => i.statusValidasi === "DISETUJUI").length;
    const pendingCount = items.filter((i) => i.statusValidasi === "MENUNGGU").length;
    const rejectedCount = items.filter((i) => i.statusValidasi === "DITOLAK").length;
    const revisionCount = items.filter((i) => i.statusValidasi === "PERLU_PERBAIKAN").length;

    // Rekap per Kategori
    const rekapKategoriMap: Record<string, { nama: string; total: number; sumHarga: number; avgHarga: number }> = {};
    for (const item of items) {
      const catName = item.kategori.nama;
      const harga = Number(item.hargaSatuan);
      if (!rekapKategoriMap[catName]) {
        rekapKategoriMap[catName] = { nama: catName, total: 0, sumHarga: 0, avgHarga: 0 };
      }
      rekapKategoriMap[catName].total += 1;
      rekapKategoriMap[catName].sumHarga += harga;
    }

    const rekapKategori = Object.values(rekapKategoriMap).map((k) => ({
      ...k,
      avgHarga: k.total > 0 ? Math.round(k.sumHarga / k.total) : 0,
    }));

    // Data dropdown filters
    const [kategoriList, wilayahList] = await Promise.all([
      prisma.kategoriData.findMany({ select: { id: true, kode: true, nama: true } }),
      prisma.wilayah.findMany({
        where: { status: true },
        select: { id: true, kode: true, nama: true, level: true },
        orderBy: { kode: "asc" },
      }),
    ]);

    return NextResponse.json({
      summary: {
        totalData,
        approvedCount,
        pendingCount,
        rejectedCount,
        revisionCount,
      },
      rekapKategori,
      items,
      filters: {
        kategoriList,
        wilayahList,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal memuat data laporan", error: error.message },
      { status: 500 }
    );
  }
}
