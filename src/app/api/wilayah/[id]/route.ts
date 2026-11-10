import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const wilayahUpdateSchema = z.object({
  nama: z.string().min(3).optional(),
  level: z.enum(["PROVINSI", "KABUPATEN_KOTA", "KECAMATAN"]).optional(),
  parentId: z.string().nullable().optional(),
  status: z.boolean().optional(),
});

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
    const validated = wilayahUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: "Data tidak valid", errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.wilayah.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Wilayah tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.wilayah.update({
      where: { id },
      data: validated.data,
      include: { parent: true },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_WILAYAH",
        module: "Wilayah",
        description: `Memperbarui wilayah: ${updated.nama} (${updated.kode})`,
      },
    });

    return NextResponse.json({ message: "Data wilayah berhasil diperbarui", data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal memperbarui wilayah", error: error.message },
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
        { message: "Hanya Administrator yang diizinkan menghapus data wilayah." },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Periksa apakah wilayah memiliki data HSPW atau sub-wilayah
    const countCheck = await prisma.wilayah.findUnique({
      where: { id },
      include: {
        _count: {
          select: { hspwItems: true, children: true, users: true },
        },
      },
    });

    if (!countCheck) {
      return NextResponse.json({ message: "Wilayah tidak ditemukan" }, { status: 404 });
    }

    if (
      countCheck._count.hspwItems > 0 ||
      countCheck._count.children > 0 ||
      countCheck._count.users > 0
    ) {
      return NextResponse.json(
        {
          message: `Tidak dapat menghapus wilayah '${countCheck.nama}' karena memiliki relasi ke ${countCheck._count.hspwItems} data HSPW, ${countCheck._count.children} kabupaten/kota turunan, atau ${countCheck._count.users} pengguna. Silakan nonaktifkan status wilayah sebagai gantinya.`,
        },
        { status: 400 }
      );
    }

    await prisma.wilayah.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_WILAYAH",
        module: "Wilayah",
        description: `Menghapus wilayah: ${countCheck.nama} (${countCheck.kode})`,
      },
    });

    return NextResponse.json({ message: "Wilayah berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal menghapus wilayah", error: error.message },
      { status: 500 }
    );
  }
}
