import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding initial users...");

  // Hash password default
  const password = await bcrypt.hash("Admin123!", 10);

  try {
    // 1. Buat akun SATGAS - use upsert to avoid conflicts
    await prisma.user.upsert({
      where: { email: "satgas@satgas-ppks.com" },
      update: {}, // Don't update if exists
      create: {
        name: "Admin SATGAS",
        email: "satgas@satgas-ppks.com",
        password: password,
        role: "SATGAS",
        affiliation: "STAFF",
      },
    });

    // 2. Buat akun REKTOR - use upsert to avoid conflicts
    await prisma.user.upsert({
      where: { email: "rektor@satgas-ppks.com" },
      update: {}, // Don't update if exists
      create: {
        name: "Admin Rektor",
        email: "rektor@satgas-ppks.com",
        password: password,
        role: "REKTOR",
        affiliation: "STAFF",
      },
    });

    // 3. Buat akun USER BARU - use upsert to avoid conflicts
    await prisma.user.upsert({
      where: { email: "user@satgas-ppks.com" },
      update: {}, // Don't update if exists
      create: {
        name: "Pengguna Umum",
        email: "user@satgas-ppks.com",
        password: password,
        role: "USER",
        affiliation: "STUDENT",
      },
    });

    console.log("✅ Seeding selesai! 3 akun berhasil dibuat/diperbarui.");
    console.table([
        { Role: "SATGAS", Email: "satgas@satgas-ppks.com", Password: "Admin123!" },
        { Role: "REKTOR", Email: "rektor@satgas-ppks.com", Password: "Admin123!" },
        { Role: "USER", Email: "user@satgas-ppks.com", Password: "Admin123!" }
    ]);

  } catch (error) {
    console.error("❌ Error saat seeding:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error saat seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });