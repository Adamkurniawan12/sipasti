import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      roleName: string;
      nip?: string | null;
      jabatan?: string | null;
      instansi?: string | null;
      wilayahId?: string | null;
      wilayahNama?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    role: string;
    roleName: string;
    nip?: string | null;
    jabatan?: string | null;
    instansi?: string | null;
    wilayahId?: string | null;
    wilayahNama?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
    roleName: string;
    nip?: string | null;
    jabatan?: string | null;
    instansi?: string | null;
    wilayahId?: string | null;
    wilayahNama?: string | null;
  }
}

