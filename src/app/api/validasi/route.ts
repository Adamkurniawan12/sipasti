import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const validationActionSchema = z.object({
  hspwId: z.string().min(1, "ID HSPW wajib disertakan"),
  status: z.enum(["DISETUJUI", "DITOLAK", "PERLU_PERBAIKAN"]),
  catatan: z.string().min(3, "Catatan validasi minimal 3 karakter"),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "MENUNGGU";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (status && status !== "ALL") {
      whereClause.statusValidasi = status;
    }

    if (search) {
      whereClause.OR = [
        { kode: { contains: search } },
        { namaItem: { contains: search } },
      ];
    }

    const [total, items, pendingCount, approvedCount, rejectedCount, revisionCount] =
      await Promise.all([
        prisma.hspw.count({ where: whereClause }),
        prisma.hspw.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            kategori: true,
            wilayah: true,
            createdBy: { select: { id: true, name: true, username: true, instansi: true } },
            verifiedBy: { select: { id: true, name: true, nip: true } },
            validasiRecords: {
              include: {
                verifikator: { select: { id: true, name: true } },
              },
              orderBy: { createdAt: "desc" },
            },
          },
        }),
        prisma.hspw.count({ where: { statusValidasi: "MENUNGGU" } }),
        prisma.hspw.count({ where: { statusValidasi: "DISETUJUI" } }),
        prisma.hspw.count({ where: { statusValidasi: "DITOLAK" } }),
        prisma.hspw.count({ where: { statusValidasi: "PERLU_PERBAIKAN" } }),
      ]);

    return NextResponse.json({
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        revision: revisionCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal memuat antrean validasi", error: error.message },
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

    // Hanya Administrator yang boleh memvalidasi data
    const role = session.user.role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "VERIFIKATOR") {
      return NextResponse.json(
        { message: "Hanya Administrator yang memiliki hak akses untuk memvalidasi usulan data." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = validationActionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: "Data validasi tidak valid", errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { hspwId, status, catatan } = validated.data;

    const hspwItem = await prisma.hspw.findUnique({ where: { id: hspwId } });
    if (!hspwItem) {
      return NextResponse.json({ message: "Item HSPW tidak ditemukan" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update HSPW status
      const updatedHspw = await tx.hspw.update({
        where: { id: hspwId },
        data: {
          statusValidasi: status,
          catatanValidasi: catatan,
          verifiedById: session.user.id,
          verifiedAt: new Date(),
        },
      });

      // 2. Buat record di validasi_data
      const validasiRecord = await tx.validasiData.create({
        data: {
          hspwId,
          verifikatorId: session.user.id,
          status,
          catatan,
          tindakan: `Validasi ${status} oleh ${session.user.name}`,
        },
      });

      // 3. Catat di activity_log
      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: `VALIDASI_${status}`,
          module: "Validasi",
          description: `Petugas memverifikasi item ${hspwItem.namaItem} (${hspwItem.kode}) dengan status: ${status}. Catatan: ${catatan}`,
        },
      });

      // 4. Buat notifikasi untuk pembuat data
      if (hspwItem.createdById) {
        await tx.notification.create({
          data: {
            userId: hspwItem.createdById,
            title: `Pembaruan Validasi: ${hspwItem.kode}`,
            message: `Usulan data ${hspwItem.namaItem} telah diproses dengan status: ${status}. Catatan: ${catatan}`,
            type: status === "DISETUJUI" ? "SUCCESS" : status === "DITOLAK" ? "ERROR" : "WARNING",
            link: "/hspw",
          },
        });
      }

      return { updatedHspw, validasiRecord };
    });

    return NextResponse.json({
      message: `Data HSPW berhasil divalidasi dengan status: ${status}`,
      data: result,
    });
  } catch (error: any) {
    console.error("POST Validasi Error:", error);
    return NextResponse.json(
      { message: "Gagal memproses validasi data", error: error.message },
      { status: 500 }
    );
  }
}
