import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  username: z.string().min(3, "Username minimal 3 karakter").regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore"),
  email: z.string().email("Format email dinas tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  nip: z.string().optional(),
  jabatan: z.string().optional(),
  instansi: z.string().min(2, "Instansi / Satuan Kerja wajib diisi"),
  phone: z.string().optional(),
  wilayahId: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: "Data pendaftaran tidak valid", errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, username, email, password, nip, jabatan, instansi, phone, wilayahId } = validated.data;

    // Cek apakah username atau email sudah ada
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return NextResponse.json(
          { message: "Alamat email ini sudah terdaftar. Silakan gunakan email lain atau login." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { message: "Username sudah digunakan. Silakan pilih username yang lain." },
        { status: 400 }
      );
    }

    // Dapatkan role USER default
    const userRole = await prisma.role.findUnique({
      where: { name: "USER" },
    });

    if (!userRole) {
      return NextResponse.json(
        { message: "Konfigurasi role default sistem belum tersedia." },
        { status: 500 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name,
          username: username.toLowerCase(),
          email: email.toLowerCase(),
          password: hashedPassword,
          nip: nip || null,
          jabatan: jabatan || null,
          instansi,
          phone: phone || null,
          wilayahId: wilayahId || null,
          roleId: userRole.id,
          status: "ACTIVE",
        },
      });

      // Buat activity log
      await tx.activityLog.create({
        data: {
          userId: created.id,
          action: "REGISTER",
          module: "Auth",
          description: `Pengguna baru mendaftar mandiri: ${created.name} (${created.username}) dari ${instansi}`,
        },
      });

      // Buat notifikasi sambutan
      await tx.notification.create({
        data: {
          userId: created.id,
          title: "Selamat Datang di Portal SIPASTI",
          message: `Akun Anda berhasil didaftarkan. Anda dapat menjelajahi katalog HSPW atau mengajukan usulan harga satuan.`,
          type: "SUCCESS",
          link: "/hspw",
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        message: "Pendaftaran akun berhasil! Silakan masuk dengan username dan kata sandi Anda.",
        userId: newUser.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { message: "Gagal memproses pendaftaran", error: error.message },
      { status: 500 }
    );
  }
}

