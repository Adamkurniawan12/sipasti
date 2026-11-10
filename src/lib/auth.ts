import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email atau username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "SIPASTI Credentials",
      credentials: {
        identifier: { label: "Email atau Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { identifier, password } = parsed.data;

        // Find user by email or username
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { username: identifier },
            ],
          },
          include: {
            role: true,
            wilayah: true,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        if (user.status !== "ACTIVE") {
          throw new Error("Akun Anda sedang dinonaktifkan atau ditangguhkan.");
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return null;
        }

        // Catat activity log login
        try {
          await prisma.activityLog.create({
            data: {
              userId: user.id,
              action: "LOGIN",
              module: "Auth",
              description: `Pengguna ${user.name} (${user.username}) berhasil login ke sistem.`,
            },
          });
        } catch {
          // Ignore if logging fails
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role.name,
          roleName: user.role.label,
          nip: user.nip,
          jabatan: user.jabatan,
          instansi: user.instansi,
          wilayahId: user.wilayahId,
          wilayahNama: user.wilayah?.nama || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.roleName = user.roleName;
        token.nip = user.nip;
        token.jabatan = user.jabatan;
        token.instansi = user.instansi;
        token.wilayahId = user.wilayahId;
        token.wilayahNama = user.wilayahNama;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.roleName = token.roleName as string;
        session.user.nip = token.nip as string | null;
        session.user.jabatan = token.jabatan as string | null;
        session.user.instansi = token.instansi as string | null;
        session.user.wilayahId = token.wilayahId as string | null;
        session.user.wilayahNama = token.wilayahNama as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 jam sesi
  },
  secret: process.env.AUTH_SECRET,
});

