import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  nip: z.string().optional(),
  jabatan: z.string().optional(),
  instansi: z.string().optional(),
  phone: z.string().optional(),
  roleName: z.enum(["ADMIN", "USER", "SUPER_ADMIN", "VERIFIKATOR"]),
  wilayahId: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).default("ACTIVE"),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { message: "Hanya Administrator yang dapat mengakses data pengguna." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const roleFilter = searchParams.get("role") || "";
    const statusFilter = searchParams.get("status") || "";

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { username: { contains: search } },
        { email: { contains: search } },
        { nip: { contains: search } },
        { instansi: { contains: search } },
      ];
    }

    if (roleFilter) {
      whereClause.role = { name: roleFilter as any };
    }

    if (statusFilter) {
      whereClause.status = statusFilter as any;
    }

    const [users, roles, wilayahList] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          nip: true,
          jabatan: true,
          instansi: true,
          phone: true,
          status: true,
          createdAt: true,
          role: { select: { id: true, name: true, label: true } },
          wilayah: { select: { id: true, kode: true, nama: true } },
          _count: {
            select: { hspwCreated: true, validasiProcessed: true },
          },
        },
      }),
      prisma.role.findMany({
        select: { id: true, name: true, label: true, description: true },
      }),
      prisma.wilayah.findMany({
        where: { status: true },
        select: { id: true, kode: true, nama: true, level: true },
        orderBy: { kode: "asc" },
      }),
    ]);

    return NextResponse.json({ data: users, roles, wilayahList });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal memuat daftar pengguna", error: error.message },
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

    const role = session.user.role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { message: "Hanya Administrator yang berwenang menambahkan pengguna baru." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = createUserSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: "Validasi data gagal", errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Cek email & username duplicate
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validated.data.email },
          { username: validated.data.username },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Email atau Username tersebut sudah terdaftar di sistem." },
        { status: 400 }
      );
    }

    // Ambil role ID
    const targetRole = await prisma.role.findUnique({
      where: { name: validated.data.roleName },
    });

    if (!targetRole) {
      return NextResponse.json({ message: "Role yang dipilih tidak valid." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(validated.data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: validated.data.name,
        username: validated.data.username,
        email: validated.data.email,
        password: hashedPassword,
        nip: validated.data.nip || null,
        jabatan: validated.data.jabatan || null,
        instansi: validated.data.instansi || null,
        phone: validated.data.phone || null,
        roleId: targetRole.id,
        wilayahId: validated.data.wilayahId || null,
        status: validated.data.status,
      },
      include: {
        role: true,
        wilayah: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_USER",
        module: "Users",
        description: `Menambahkan pengguna baru: ${newUser.name} (${newUser.username}) dengan role ${newUser.role.label}`,
      },
    });

    return NextResponse.json(
      { message: "Pengguna berhasil didaftarkan ke sistem", data: newUser },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal menambahkan pengguna", error: error.message },
      { status: 500 }
    );
  }
}
