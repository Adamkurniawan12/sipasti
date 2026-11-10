import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  nip: z.string().optional(),
  jabatan: z.string().optional(),
  instansi: z.string().min(2, "Instansi wajib diisi"),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter").optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        role: true,
        wilayah: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      nip: user.nip,
      jabatan: user.jabatan,
      instansi: user.instansi,
      phone: user.phone,
      role: user.role.label,
      roleName: user.role.name,
      wilayah: user.wilayah?.nama || "Pusat / Seluruh Indonesia",
      status: user.status,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal memuat profil pengguna", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateProfileSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: "Data tidak valid", errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ message: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    const updateData: any = {
      name: validated.data.name,
      nip: validated.data.nip || null,
      jabatan: validated.data.jabatan || null,
      instansi: validated.data.instansi,
      phone: validated.data.phone || null,
    };

    // Jika ingin mengganti kata sandi
    if (validated.data.newPassword) {
      if (!validated.data.currentPassword) {
        return NextResponse.json(
          { message: "Kata sandi lama wajib diisi untuk mengganti kata sandi baru." },
          { status: 400 }
        );
      }

      const isCurrentValid = await bcrypt.compare(
        validated.data.currentPassword,
        user.password
      );

      if (!isCurrentValid) {
        return NextResponse.json(
          { message: "Kata sandi lama yang Anda masukkan salah." },
          { status: 400 }
        );
      }

      updateData.password = await bcrypt.hash(validated.data.newPassword, 10);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.user.update({
        where: { id: session.user.id },
        data: updateData,
      });

      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE_PROFILE",
          module: "Users",
          description: `Pengguna memperbarui data profil akun (${res.username})`,
        },
      });

      return res;
    });

    return NextResponse.json({
      message: "Data profil berhasil diperbarui.",
      user: {
        id: updated.id,
        name: updated.name,
        username: updated.username,
        email: updated.email,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal memperbarui profil", error: error.message },
      { status: 500 }
    );
  }
}

