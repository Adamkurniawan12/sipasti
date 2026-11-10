import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const hspwUpdateSchema = z.object({
  namaItem: z.string().min(3).optional(),
  spesifikasi: z.string().optional(),
  satuan: z.string().min(1).optional(),
  hargaSatuan: z.number().positive().optional(),
  tahun: z.number().int().min(2020).max(2035).optional(),
  wilayahId: z.string().min(1).optional(),
  kategoriId: z.string().min(1).optional(),
  statusValidasi: z.enum(["MENUNGGU", "DISETUJUI", "DITOLAK", "PERLU_PERBAIKAN"]).optional(),
  catatanValidasi: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await params;
    const item = await prisma.hspw.findUnique({
      where: { id },
      include: {
        kategori: true,
        wilayah: true,
        createdBy: { select: { id: true, name: true, email: true, username: true } },
        verifiedBy: { select: { id: true, name: true, nip: true, jabatan: true } },
        validasiRecords: {
          include: {
            verifikator: { select: { id: true, name: true, nip: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ message: "Data HSPW tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: item });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal memuat detail HSPW", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = hspwUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: "Validasi data gagal", errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.hspw.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Data HSPW tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.hspw.update({
        where: { id },
        data: validated.data,
        include: {
          kategori: true,
          wilayah: true,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE_HSPW",
          module: "HSPW",
          description: `Memperbarui item HSPW: ${result.namaItem} (${result.kode})`,
        },
      });

      await tx.riwayatPerubahan.create({
        data: {
          entityType: "HSPW",
          entityId: id,
          action: "UPDATE",
          oldValues: existing as any,
          newValues: result as any,
          userId: session.user.id,
        },
      });

      return result;
    });

    return NextResponse.json({ message: "Data HSPW berhasil diperbarui", data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal memperbarui data HSPW", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { message: "Hanya Administrator yang memiliki wewenang untuk menghapus data ini." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const existing = await prisma.hspw.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Data HSPW tidak ditemukan" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.hspw.delete({ where: { id } });

      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: "DELETE_HSPW",
          module: "HSPW",
          description: `Menghapus item HSPW: ${existing.namaItem} (${existing.kode})`,
        },
      });

      await tx.riwayatPerubahan.create({
        data: {
          entityType: "HSPW",
          entityId: id,
          action: "DELETE",
          oldValues: existing as any,
          userId: session.user.id,
        },
      });
    });

    return NextResponse.json({ message: "Data HSPW berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal menghapus data HSPW", error: error.message },
      { status: 500 }
    );
  }
}
