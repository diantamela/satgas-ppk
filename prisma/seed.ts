import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding initial users...");

  // Hash password default
  const password = await bcrypt.hash("Admin123!", 10);

  try {
    // 1. Buat/Update akun SATGAS
    await prisma.user.upsert({
      where: { email: "satgas@satgas-ppks.com" },
      update: {
        name: "Admin SATGAS",
        password: password,
        role: "SATGAS",
        affiliation: "STAFF",
      },
      create: {
        name: "Admin SATGAS",
        email: "satgas@satgas-ppks.com",
        password: password,
        role: "SATGAS",
        affiliation: "STAFF",
      },
    });
    console.log("✅ SATGAS user created/updated");

    // 2. Buat/Update akun REKTOR
    await prisma.user.upsert({
      where: { email: "rektor@satgas-ppks.com" },
      update: {
        name: "Admin Rektor",
        password: password,
        role: "REKTOR",
        affiliation: "STAFF",
      },
      create: {
        name: "Admin Rektor",
        email: "rektor@satgas-ppks.com",
        password: password,
        role: "REKTOR",
        affiliation: "STAFF",
      },
    });
    console.log("✅ REKTOR user created/updated");

    // 3. Buat/Update akun USER
    await prisma.user.upsert({
      where: { email: "user@satgas-ppks.com" },
      update: {
        name: "Pengguna Umum",
        password: password,
        role: "USER",
        affiliation: "STUDENT",
      },
      create: {
        name: "Pengguna Umum",
        email: "user@satgas-ppks.com",
        password: password,
        role: "USER",
        affiliation: "STUDENT",
      },
    });
    console.log("✅ USER user created/updated");

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