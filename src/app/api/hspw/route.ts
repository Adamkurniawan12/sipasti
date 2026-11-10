import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const hspwCreateSchema = z.object({
  kode: z.string().min(3, "Kode item minimal 3 karakter"),
  namaItem: z.string().min(3, "Nama item minimal 3 karakter"),
  spesifikasi: z.string().optional(),
  satuan: z.string().min(1, "Satuan wajib diisi"),
  hargaSatuan: z.number().positive("Harga satuan harus lebih dari 0"),
  tahun: z.number().int().min(2020).max(2035),
  wilayahId: z.string().min(1, "Wilayah wajib dipilih"),
  kategoriId: z.string().min(1, "Kategori wajib dipilih"),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const wilayahId = searchParams.get("wilayahId") || "";
    const kategoriId = searchParams.get("kategoriId") || "";
    const statusValidasi = searchParams.get("statusValidasi") || "";
    const tahun = searchParams.get("tahun") ? parseInt(searchParams.get("tahun")!) : undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { kode: { contains: search } },
        { namaItem: { contains: search } },
        { spesifikasi: { contains: search } },
      ];
    }

    if (wilayahId) {
      whereClause.wilayahId = wilayahId;
    }

    if (kategoriId) {
      whereClause.kategoriId = kategoriId;
    }

    if (statusValidasi) {
      whereClause.statusValidasi = statusValidasi;
    }

    if (tahun) {
      whereClause.tahun = tahun;
    }

    // Hitung total dan ambil data bersamaan
    const [total, items, kategoriList, wilayahList] = await Promise.all([
      prisma.hspw.count({ where: whereClause }),
      prisma.hspw.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          kategori: { select: { id: true, kode: true, nama: true } },
          wilayah: { select: { id: true, kode: true, nama: true, level: true } },
          createdBy: { select: { id: true, name: true, username: true } },
          verifiedBy: { select: { id: true, name: true } },
        },
      }),
      prisma.kategoriData.findMany({
        where: { status: true },
        select: { id: true, kode: true, nama: true },
        orderBy: { urutan: "asc" },
      }),
      prisma.wilayah.findMany({
        where: { status: true },
        select: { id: true, kode: true, nama: true, level: true },
        orderBy: { kode: "asc" },
      }),
    ]);

    return NextResponse.json({
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        kategoriList,
        wilayahList,
      },
    });
  } catch (error: any) {
    console.error("GET HSPW Error:", error);
    return NextResponse.json(
      { message: "Gagal memuat data HSPW", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const body = await request.json();
    const validated = hspwCreateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: "Validasi data gagal", errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Cek apakah kode sudah digunakan
    const existing = await prisma.hspw.findUnique({
      where: { kode: validated.data.kode },
    });

    if (existing) {
      return NextResponse.json(
        { message: `Kode HSPW '${validated.data.kode}' sudah digunakan. Harap gunakan kode unik.` },
        { status: 400 }
      );
    }

    const newHspw = await prisma.$transaction(async (tx) => {
      const created = await tx.hspw.create({
        data: {
          kode: validated.data.kode,
          namaItem: validated.data.namaItem,
          spesifikasi: validated.data.spesifikasi || null,
          satuan: validated.data.satuan,
          hargaSatuan: validated.data.hargaSatuan,
          tahun: validated.data.tahun,
          wilayahId: validated.data.wilayahId,
          kategoriId: validated.data.kategoriId,
          createdById: session.user.id,
          statusValidasi: "MENUNGGU",
        },
        include: {
          kategori: true,
          wilayah: true,
        },
      });

      // Log aktivitas
      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: "CREATE_HSPW",
          module: "HSPW",
          description: `Menambahkan item HSPW baru: ${created.namaItem} (${created.kode})`,
        },
      });

      // Riwayat perubahan
      await tx.riwayatPerubahan.create({
        data: {
          entityType: "HSPW",
          entityId: created.id,
          action: "CREATE",
          newValues: created as any,
          userId: session.user.id,
        },
      });

      return created;
    });

    return NextResponse.json(
      { message: "Data HSPW berhasil ditambahkan dan berstatus Menunggu Validasi", data: newHspw },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST HSPW Error:", error);
    return NextResponse.json(
      { message: "Gagal menyimpan data HSPW", error: error.message },
      { status: 500 }
    );
  }
}
