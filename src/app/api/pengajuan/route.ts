import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createPengajuanSchema = z.object({
  judul: z.string().min(5, "Judul pengajuan minimal 5 karakter"),
  deskripsi: z.string().optional(),
  tahun: z.number().int().min(2020).max(2035),
  wilayahId: z.string().min(1, "Wilayah wajib dipilih"),
  catatan: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const tahun = searchParams.get("tahun") ? parseInt(searchParams.get("tahun")!) : undefined;

    const whereClause: any = {};

    // Jika role USER biasa, hanya melihat pengajuannya sendiri atau wilayahnya
    if (session.user.role === "USER") {
      whereClause.submittedById = session.user.id;
    }

    if (search) {
      whereClause.OR = [
        { nomorPengajuan: { contains: search } },
        { judul: { contains: search } },
        { deskripsi: { contains: search } },
      ];
    }

    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    if (tahun) {
      whereClause.tahun = tahun;
    }

    const [items, wilayahList] = await Promise.all([
      prisma.pengajuanData.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
          wilayah: { select: { id: true, kode: true, nama: true } },
          submittedBy: { select: { id: true, name: true, instansi: true, email: true } },
          _count: {
            select: { hspwItems: true },
          },
        },
      }),
      prisma.wilayah.findMany({
        where: { status: true },
        select: { id: true, kode: true, nama: true },
        orderBy: { kode: "asc" },
      }),
    ]);

    return NextResponse.json({ data: items, wilayahList });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal memuat daftar pengajuan data", error: error.message },
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
    const validated = createPengajuanSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: "Data pengajuan tidak valid", errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Generate nomor pengajuan unik (format: REQ-TAHUN-TIMESTAMP)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const nomorPengajuan = `PGJ-${validated.data.tahun}-${Date.now().toString().slice(-4)}${randomSuffix}`;

    const newPengajuan = await prisma.$transaction(async (tx) => {
      const created = await tx.pengajuanData.create({
        data: {
          nomorPengajuan,
          judul: validated.data.judul,
          deskripsi: validated.data.deskripsi || null,
          tahun: validated.data.tahun,
          wilayahId: validated.data.wilayahId,
          submittedById: session.user.id,
          status: "SUBMITTED",
          submittedAt: new Date(),
          catatan: validated.data.catatan || null,
        },
        include: {
          wilayah: true,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: "CREATE_PENGAJUAN",
          module: "Pengajuan",
          description: `Membuat berkas pengajuan baru: ${created.judul} (${created.nomorPengajuan})`,
        },
      });

      return created;
    });

    return NextResponse.json(
      { message: "Berkas pengajuan usulan data berhasil dibuat dan diajukan.", data: newPengajuan },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal membuat pengajuan data", error: error.message },
      { status: 500 }
    );
  }
}

const actionPengajuanSchema = z.object({
  id: z.string().min(1, "ID Pengajuan wajib disertakan"),
  status: z.enum(["APPROVED", "IN_REVIEW", "REJECTED", "SUBMITTED"]),
  catatan: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "VERIFIKATOR") {
      return NextResponse.json(
        { message: "Anda tidak berwenang menindaklanjuti berkas pengajuan usulan." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = actionPengajuanSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: "Data aksi tidak valid", errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.pengajuanData.findUnique({
      where: { id: validated.data.id },
      include: { submittedBy: true },
    });

    if (!existing) {
      return NextResponse.json({ message: "Berkas pengajuan tidak ditemukan." }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.pengajuanData.update({
        where: { id: validated.data.id },
        data: {
          status: validated.data.status,
          catatan: validated.data.catatan !== undefined ? validated.data.catatan : existing.catatan,
        },
        include: { wilayah: true, submittedBy: true },
      });

      // Buat notifikasi untuk user pemohon
      let statusLabel = "Ditelaah";
      if (validated.data.status === "APPROVED") statusLabel = "Disetujui (ACC)";
      if (validated.data.status === "REJECTED") statusLabel = "Ditolak";
      if (validated.data.status === "IN_REVIEW") statusLabel = "Perlu Revisi / Sedang Ditelaah";

      await tx.notification.create({
        data: {
          userId: existing.submittedById,
          title: `Pengajuan Usulan: ${statusLabel}`,
          message: `Berkas "${existing.judul}" (${existing.nomorPengajuan}) telah ditindaklanjuti oleh Administrator: ${statusLabel}. Catatan: ${validated.data.catatan || "-"}`,
          type: validated.data.status === "APPROVED" ? "SUCCESS" : validated.data.status === "REJECTED" ? "ERROR" : "WARNING",
          link: "/pengajuan",
        },
      });

      // Audit Log
      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: "ACTION_PENGAJUAN",
          module: "Pengajuan",
          description: `Administrator menindaklanjuti berkas ${existing.nomorPengajuan} menjadi ${statusLabel}`,
        },
      });

      return res;
    });

    return NextResponse.json({
      message: `Berkas usulan berhasil ditindaklanjuti (${validated.data.status}).`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal menindaklanjuti berkas pengajuan", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID Pengajuan wajib disertakan" }, { status: 400 });
    }

    const existing = await prisma.pengajuanData.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ message: "Berkas pengajuan tidak ditemukan" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
    const isOwner = existing.submittedById === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { message: "Anda tidak berwenang membatalkan usulan ini." },
        { status: 403 }
      );
    }

    if (existing.status === "APPROVED" && !isAdmin) {
      return NextResponse.json(
        { message: "Usulan yang sudah disetujui (ACC) tidak dapat dibatalkan oleh pengguna." },
        { status: 400 }
      );
    }

    await prisma.pengajuanData.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_PENGAJUAN",
        module: "Pengajuan",
        description: `Menghapus berkas usulan: ${existing.judul} (${existing.nomorPengajuan})`,
      },
    });

    return NextResponse.json({ message: "Berkas usulan berhasil dihapus." });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal menghapus berkas pengajuan", error: error.message },
      { status: 500 }
    );
  }
}

