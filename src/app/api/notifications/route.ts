import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal memuat notifikasi", error: error.message },
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

    const body = await request.json().catch(() => ({}));
    const { id, markAllAsRead } = body;

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ message: "Semua notifikasi ditandai telah dibaca" });
    }

    if (id) {
      await prisma.notification.update({
        where: { id, userId: session.user.id },
        data: { isRead: true },
      });
      return NextResponse.json({ message: "Notifikasi ditandai telah dibaca" });
    }

    return NextResponse.json({ message: "Parameter tidak valid" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal memperbarui notifikasi", error: error.message },
      { status: 500 }
    );
  }
}

