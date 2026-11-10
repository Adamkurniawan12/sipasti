import { PrismaClient, RoleName, WilayahLevel, StatusValidasi, UserStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database sipasti_db...");

  // 1. Roles (4 Tingkatan Role Sesuai Master Prompt)
  // 1. Roles (2 Roles Utama: ADMIN & USER)
  const rolesData = [
    {
      name: RoleName.ADMIN,
      label: "Administrator",
      description: "Akses penuh sistem, manajemen pengguna, wilayah, validasi & tindak lanjut usulan (ACC, Revisi, Tolak), serta laporan rekapitulasi",
    },
    {
      name: RoleName.USER,
      label: "User Pengguna",
      description: "Melihat data resmi HSPW, mengajukan usulan berkas data harga satuan konstruksi, dan memantau status tindak lanjut",
    },
    {
      name: RoleName.SUPER_ADMIN,
      label: "Administrator",
      description: "Akses Administrator sistem",
    },
    {
      name: RoleName.VERIFIKATOR,
      label: "Administrator",
      description: "Akses Administrator penelaah teknis",
    },
  ];

  const rolesMap = new Map<string, string>();
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { label: r.label, description: r.description },
      create: r,
    });
    rolesMap.set(r.name, role.id);
  }
  console.log("✓ Roles seeded");

  // 2. Permissions
  const permissionsData = [
    { name: "Manage Users", code: "users:manage", module: "Users", description: "CRUD Pengguna sistem" },
    { name: "View Users", code: "users:view", module: "Users", description: "Melihat data pengguna" },
    { name: "Manage Wilayah", code: "wilayah:manage", module: "Wilayah", description: "CRUD Wilayah administrasi" },
    { name: "View Wilayah", code: "wilayah:view", module: "Wilayah", description: "Melihat data wilayah" },
    { name: "Manage HSPW", code: "hspw:manage", module: "HSPW", description: "CRUD Data HSPW" },
    { name: "View HSPW", code: "hspw:view", module: "HSPW", description: "Melihat katalog HSPW" },
    { name: "Validate HSPW", code: "hspw:validate", module: "HSPW", description: "Verifikasi & validasi HSPW" },
    { name: "View Laporan", code: "laporan:view", module: "Laporan", description: "Melihat & cetak laporan" },
    { name: "Export Laporan", code: "laporan:export", module: "Laporan", description: "Ekspor data CSV/Excel" },
  ];

  for (const p of permissionsData) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: p,
      create: p,
    });
  }
  console.log("✓ Permissions seeded");

  // 3. Wilayah
  const dki = await prisma.wilayah.upsert({
    where: { kode: "31" },
    update: {},
    create: {
      kode: "31",
      nama: "DKI Jakarta",
      level: WilayahLevel.PROVINSI,
      status: true,
    },
  });

  const jabar = await prisma.wilayah.upsert({
    where: { kode: "32" },
    update: {},
    create: {
      kode: "32",
      nama: "Jawa Barat",
      level: WilayahLevel.PROVINSI,
      status: true,
    },
  });

  const jateng = await prisma.wilayah.upsert({
    where: { kode: "33" },
    update: {},
    create: {
      kode: "33",
      nama: "Jawa Tengah",
      level: WilayahLevel.PROVINSI,
      status: true,
    },
  });

  const jatim = await prisma.wilayah.upsert({
    where: { kode: "35" },
    update: {},
    create: {
      kode: "35",
      nama: "Jawa Timur",
      level: WilayahLevel.PROVINSI,
      status: true,
    },
  });

  const banten = await prisma.wilayah.upsert({
    where: { kode: "36" },
    update: {},
    create: {
      kode: "36",
      nama: "Banten",
      level: WilayahLevel.PROVINSI,
      status: true,
    },
  });

  // Kab/Kota
  const jakpus = await prisma.wilayah.upsert({
    where: { kode: "31.71" },
    update: {},
    create: {
      kode: "31.71",
      nama: "Kota Jakarta Pusat",
      level: WilayahLevel.KABUPATEN_KOTA,
      parentId: dki.id,
      status: true,
    },
  });

  const jaksel = await prisma.wilayah.upsert({
    where: { kode: "31.74" },
    update: {},
    create: {
      kode: "31.74",
      nama: "Kota Jakarta Selatan",
      level: WilayahLevel.KABUPATEN_KOTA,
      parentId: dki.id,
      status: true,
    },
  });

  const bandung = await prisma.wilayah.upsert({
    where: { kode: "32.73" },
    update: {},
    create: {
      kode: "32.73",
      nama: "Kota Bandung",
      level: WilayahLevel.KABUPATEN_KOTA,
      parentId: jabar.id,
      status: true,
    },
  });

  const bogor = await prisma.wilayah.upsert({
    where: { kode: "32.71" },
    update: {},
    create: {
      kode: "32.71",
      nama: "Kota Bogor",
      level: WilayahLevel.KABUPATEN_KOTA,
      parentId: jabar.id,
      status: true,
    },
  });

  const semarang = await prisma.wilayah.upsert({
    where: { kode: "33.74" },
    update: {},
    create: {
      kode: "33.74",
      nama: "Kota Semarang",
      level: WilayahLevel.KABUPATEN_KOTA,
      parentId: jateng.id,
      status: true,
    },
  });

  const surabaya = await prisma.wilayah.upsert({
    where: { kode: "35.78" },
    update: {},
    create: {
      kode: "35.78",
      nama: "Kota Surabaya",
      level: WilayahLevel.KABUPATEN_KOTA,
      parentId: jatim.id,
      status: true,
    },
  });
  console.log("✓ Wilayah seeded");

  // 4. Kategori Data
  const categories = [
    { kode: "TK", nama: "Upah Tenaga Kerja", deskripsi: "Standar upah harian tenaga kerja konstruksi", urutan: 1 },
    { kode: "BA", nama: "Bahan & Material Konstruksi", deskripsi: "Bahan bangunan pokok seperti semen, pasir, bata, besi", urutan: 2 },
    { kode: "AL", nama: "Alat Berat & Peralatan", deskripsi: "Sewa dan operasional alat berat konstruksi per jam/hari", urutan: 3 },
    { kode: "ST", nama: "Pekerjaan Struktur & Pondasi", deskripsi: "Harga satuan pekerjaan struktur beton, baja, dan pemancangan", urutan: 4 },
    { kode: "AR", nama: "Pekerjaan Arsitektur & Finishing", deskripsi: "Pekerjaan dinding, plesteran, lantai, pengecatan dan plafon", urutan: 5 },
    { kode: "ME", nama: "Mekanikal & Elektrikal", deskripsi: "Instalasi listrik, tata udara, plumbing, dan pemadam kebakaran", urutan: 6 },
  ];

  const catMap = new Map<string, string>();
  for (const c of categories) {
    const cat = await prisma.kategoriData.upsert({
      where: { kode: c.kode },
      update: c,
      create: c,
    });
    catMap.set(c.kode, cat.id);
  }
  console.log("✓ Kategori Data seeded");

  // 5. Users
  const passwordHash = await bcrypt.hash("password123", 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@sipasti.go.id" },
    update: { password: passwordHash, roleId: rolesMap.get(RoleName.ADMIN)! },
    create: {
      name: "Super Administrator",
      username: "superadmin",
      email: "superadmin@sipasti.go.id",
      password: passwordHash,
      nip: "198501012010011001",
      jabatan: "Pranata Komputer Ahli Madya",
      instansi: "Kementerian Pekerjaan Umum dan Perumahan Rakyat",
      phone: "081299990001",
      status: UserStatus.ACTIVE,
      roleId: rolesMap.get(RoleName.ADMIN)!,
      wilayahId: dki.id,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@sipasti.go.id" },
    update: { password: passwordHash, roleId: rolesMap.get(RoleName.ADMIN)! },
    create: {
      name: "Budi Santoso, S.T.",
      username: "admin",
      email: "admin@sipasti.go.id",
      password: passwordHash,
      nip: "198802152012021002",
      jabatan: "Pengelola Pengadaan Barang/Jasa Muda",
      instansi: "Dinas Bina Marga dan Penataan Ruang",
      phone: "081299990002",
      status: UserStatus.ACTIVE,
      roleId: rolesMap.get(RoleName.ADMIN)!,
      wilayahId: jabar.id,
    },
  });

  const verifikator = await prisma.user.upsert({
    where: { email: "verifikator@sipasti.go.id" },
    update: { password: passwordHash, roleId: rolesMap.get(RoleName.ADMIN)! },
    create: {
      name: "Ir. Hendra Wijaya, M.T.",
      username: "verifikator",
      email: "verifikator@sipasti.go.id",
      password: passwordHash,
      nip: "197905102005011003",
      jabatan: "Pembina Jasa Konstruksi Ahli Madya",
      instansi: "Balai Jasa Konstruksi Wilayah",
      phone: "081299990003",
      status: UserStatus.ACTIVE,
      roleId: rolesMap.get(RoleName.ADMIN)!,
      wilayahId: jakpus.id,
    },
  });

  const userPublic = await prisma.user.upsert({
    where: { email: "user@sipasti.go.id" },
    update: { password: passwordHash },
    create: {
      name: "Ahmad Fauzi",
      username: "user",
      email: "user@sipasti.go.id",
      password: passwordHash,
      nip: "199408202020121004",
      jabatan: "Staf Teknis Estimasi Biaya",
      instansi: "PT Konstruksi Nusantara Bersama",
      phone: "081299990004",
      status: UserStatus.ACTIVE,
      roleId: rolesMap.get(RoleName.USER)!,
      wilayahId: bandung.id,
    },
  });
  console.log("✓ Users seeded (Super Admin, Admin, Verifikator, User)");

  // 6. HSPW Items
  const hspwSamples = [
    {
      kode: "HSPW-2025-TK-001",
      namaItem: "Tukang Batu / Pekerja Terampil",
      spesifikasi: "Pekerja terampil bidang pasangan batu kali dan bata merah bersertifikat",
      satuan: "OH (Orang Hari)",
      hargaSatuan: 165000,
      tahun: 2025,
      wilayahId: jakpus.id,
      kategoriId: catMap.get("TK")!,
      statusValidasi: StatusValidasi.DISETUJUI,
      createdById: admin.id,
      verifiedById: verifikator.id,
      verifiedAt: new Date(),
      catatanValidasi: "Telah diverifikasi sesuai standar upah minimum sektoral DKI 2025.",
    },
    {
      kode: "HSPW-2025-TK-002",
      namaItem: "Mandor Konstruksi",
      spesifikasi: "Mandor lapangan berpengalaman minimal 5 tahun memimpin regu kerja",
      satuan: "OH (Orang Hari)",
      hargaSatuan: 220000,
      tahun: 2025,
      wilayahId: jakpus.id,
      kategoriId: catMap.get("TK")!,
      statusValidasi: StatusValidasi.DISETUJUI,
      createdById: admin.id,
      verifiedById: verifikator.id,
      verifiedAt: new Date(),
      catatanValidasi: "Sesuai regulasi indeks tenaga kerja bina marga.",
    },
    {
      kode: "HSPW-2025-BA-001",
      namaItem: "Semen Portland Komposit (PCC) 50kg",
      spesifikasi: "SNI 7064:2014, kemasan zak 50 kg, mutu terjamin pabrikan terakreditasi",
      satuan: "Zak",
      hargaSatuan: 78500,
      tahun: 2025,
      wilayahId: bandung.id,
      kategoriId: catMap.get("BA")!,
      statusValidasi: StatusValidasi.DISETUJUI,
      createdById: admin.id,
      verifiedById: verifikator.id,
      verifiedAt: new Date(),
      catatanValidasi: "Harga rata-rata survei distributor Jawa Barat Q1 2025.",
    },
    {
      kode: "HSPW-2025-BA-002",
      namaItem: "Besi Beton Ulir BJTS 420B Dia. 16mm",
      spesifikasi: "SNI 2052:2017 panjang standar 12 meter bersertifikat mill sheet",
      satuan: "Kg",
      hargaSatuan: 14800,
      tahun: 2025,
      wilayahId: jakpus.id,
      kategoriId: catMap.get("BA")!,
      statusValidasi: StatusValidasi.MENUNGGU,
      createdById: userPublic.id,
      catatanValidasi: "Menunggu penelaahan faktur faktual dari 3 distributor resmi.",
    },
    {
      kode: "HSPW-2025-BA-003",
      namaItem: "Pasir Pasang Berkualitas Tinggi",
      spesifikasi: "Kadar lumpur < 5%, bebas bahan organik, butiran tajam dan keras",
      satuan: "M3",
      hargaSatuan: 345000,
      tahun: 2025,
      wilayahId: bogor.id,
      kategoriId: catMap.get("BA")!,
      statusValidasi: StatusValidasi.MENUNGGU,
      createdById: admin.id,
      catatanValidasi: null,
    },
    {
      kode: "HSPW-2025-AL-001",
      namaItem: "Excavator Standar 0.9 M3 / 130 HP",
      spesifikasi: "Kapasitas bucket 0.9 m3, daya mesin 130 HP, kondisi prima include operator",
      satuan: "Jam",
      hargaSatuan: 580000,
      tahun: 2025,
      wilayahId: surabaya.id,
      kategoriId: catMap.get("AL")!,
      statusValidasi: StatusValidasi.DISETUJUI,
      createdById: admin.id,
      verifiedById: verifikator.id,
      verifiedAt: new Date(),
      catatanValidasi: "Sudah mencakup BBM solar industri dan asuransi alat.",
    },
    {
      kode: "HSPW-2025-AL-002",
      namaItem: "Tandem Roller 6-8 Ton Vibratory",
      spesifikasi: "Daya pemadat dinamis 60 kN, mesin diesel water cooled",
      satuan: "Jam",
      hargaSatuan: 420000,
      tahun: 2025,
      wilayahId: semarang.id,
      kategoriId: catMap.get("AL")!,
      statusValidasi: StatusValidasi.PERLU_PERBAIKAN,
      createdById: userPublic.id,
      verifiedById: verifikator.id,
      verifiedAt: new Date(),
      catatanValidasi: "Mohon lampirkan bukti analisis perhitungan konsumsi BBM per jam operasional.",
    },
    {
      kode: "HSPW-2025-ST-001",
      namaItem: "Beton Ready Mix Mutu fc' 25 MPa (K-300) Slump 12±2 cm",
      spesifikasi: "SNI 2847:2019, agregat normal, fly ash max 15%, pengiriman truk mixer",
      satuan: "M3",
      hargaSatuan: 945000,
      tahun: 2025,
      wilayahId: jaksel.id,
      kategoriId: catMap.get("ST")!,
      statusValidasi: StatusValidasi.DISETUJUI,
      createdById: admin.id,
      verifiedById: verifikator.id,
      verifiedAt: new Date(),
      catatanValidasi: "Disetujui berdasarkan kontrak payung penyedia batching plant.",
    },
    {
      kode: "HSPW-2025-AR-001",
      namaItem: "Keramik Granit Tile 60x60 cm Polish Unpolished",
      spesifikasi: "Daya serap air < 0.5%, ketebalan 9.5mm, presisi tinggi Grade AAA",
      satuan: "M2",
      hargaSatuan: 195000,
      tahun: 2025,
      wilayahId: bandung.id,
      kategoriId: catMap.get("AR")!,
      statusValidasi: StatusValidasi.DITOLAK,
      createdById: userPublic.id,
      verifiedById: verifikator.id,
      verifiedAt: new Date(),
      catatanValidasi: "Harga yang diusulkan melebihi batas kewajaran pasar setempat (>35%).",
    },
  ];

  for (const item of hspwSamples) {
    await prisma.hspw.upsert({
      where: { kode: item.kode },
      update: item,
      create: item,
    });
  }
  console.log("✓ HSPW Sample items seeded");

  // 7. Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: superAdmin.id,
        action: "INITIAL_SETUP",
        module: "System",
        description: "Inisialisasi sistem database SIPASTI dan konfigurasi role awal",
        ipAddress: "127.0.0.1",
      },
      {
        userId: admin.id,
        action: "CREATE_HSPW",
        module: "HSPW",
        description: "Menambahkan usulan item HSPW Tenaga Kerja dan Material Semen PCC 2025",
        ipAddress: "127.0.0.1",
      },
      {
        userId: verifikator.id,
        action: "APPROVE_HSPW",
        module: "Validasi",
        description: "Menyetujui validasi HSPW-2025-TK-001 dan HSPW-2025-BA-001",
        ipAddress: "127.0.0.1",
      },
    ],
  });
  console.log("✓ Activity Logs seeded");

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

