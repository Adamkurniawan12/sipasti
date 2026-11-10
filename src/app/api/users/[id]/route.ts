import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  nip: z.string().optional(),
  jabatan: z.string().optional(),
  instansi: z.string().optional(),
  phone: z.string().optional(),
  roleName: z.enum(["SUPER_ADMIN", "ADMIN", "VERIFIKATOR", "USER"]).optional(),
  wilayahId: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
  newPassword: z.string().min(6).optional(),
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
    const currentRole = session.user.role;
    const isSelf = session.user.id === id;
    const isAdmin = currentRole === "ADMIN" || currentRole === "SUPER_ADMIN";

    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { message: "Anda tidak berwenang memperbarui pengguna ini." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = updateUserSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: "Data tidak valid", errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updateData: any = {
      name: validated.data.name,
      nip: validated.data.nip,
      jabatan: validated.data.jabatan,
      instansi: validated.data.instansi,
      phone: validated.data.phone,
      wilayahId: validated.data.wilayahId,
    };

    if (isAdmin) {
      if (validated.data.status) updateData.status = validated.data.status;
      if (validated.data.roleName) {
        const targetRole = await prisma.role.findUnique({
          where: { name: validated.data.roleName },
        });
        if (targetRole) updateData.roleId = targetRole.id;
      }
    }

    if (validated.data.newPassword) {
      updateData.password = await bcrypt.hash(validated.data.newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true, wilayah: true },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_USER",
        module: "Users",
        description: `Memperbarui profil / hak akses pengguna: ${updated.name} (${updated.username})`,
      },
    });

    return NextResponse.json({ message: "Data pengguna berhasil diperbarui", data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal memperbarui pengguna", error: error.message },
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

    const currentRole = session.user.role;
    if (currentRole !== "ADMIN" && currentRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { message: "Hanya Administrator yang diizinkan menghapus pengguna." },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (session.user.id === id) {
      return NextResponse.json(
        { message: "Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_USER",
        module: "Users",
        description: `Menghapus pengguna: ${existing.name} (${existing.username})`,
      },
    });

    return NextResponse.json({ message: "Pengguna berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal menghapus pengguna", error: error.message },
      { status: 500 }
    );
  }
}
