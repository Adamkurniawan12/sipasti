import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const wilayahSchema = z.object({
  kode: z.string().min(2, "Kode wilayah minimal 2 karakter"),
  nama: z.string().min(3, "Nama wilayah minimal 3 karakter"),
  level: z.enum(["PROVINSI", "KABUPATEN_KOTA", "KECAMATAN"]),
  parentId: z.string().nullable().optional(),
  status: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const level = searchParams.get("level") || "";
    const parentId = searchParams.get("parentId") || "";

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { kode: { contains: search } },
        { nama: { contains: search } },
      ];
    }
    if (level) {
      whereClause.level = level;
    }
    if (parentId) {
      whereClause.parentId = parentId;
    }

    const [items, provinsiList] = await Promise.all([
      prisma.wilayah.findMany({
        where: whereClause,
        orderBy: { kode: "asc" },
        include: {
          parent: { select: { id: true, kode: true, nama: true } },
          _count: {
            select: { hspwItems: true, children: true, users: true },
          },
        },
      }),
      prisma.wilayah.findMany({
        where: { level: "PROVINSI", status: true },
        select: { id: true, kode: true, nama: true },
        orderBy: { kode: "asc" },
      }),
    ]);

    return NextResponse.json({ data: items, provinsiList });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal memuat data wilayah", error: error.message },
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
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.json(
        { message: "Hanya Super Admin atau Admin yang dapat menambahkan data wilayah." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = wilayahSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: "Data wilayah tidak valid", errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.wilayah.findUnique({
      where: { kode: validated.data.kode },
    });
    if (existing) {
      return NextResponse.json(
        { message: `Kode wilayah '${validated.data.kode}' sudah terdaftar.` },
        { status: 400 }
      );
    }

    const newWilayah = await prisma.wilayah.create({
      data: {
        kode: validated.data.kode,
        nama: validated.data.nama,
        level: validated.data.level,
        parentId: validated.data.parentId || null,
        status: validated.data.status ?? true,
      },
      include: {
        parent: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_WILAYAH",
        module: "Wilayah",
        description: `Menambahkan wilayah: ${newWilayah.nama} (${newWilayah.kode})`,
      },
    });

    return NextResponse.json(
      { message: "Data wilayah berhasil ditambahkan", data: newWilayah },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal menambahkan wilayah", error: error.message },
      { status: 500 }
    );
  }
}
