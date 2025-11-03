import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  const prisma = new PrismaClient();

  try {
    const email = 'admin@satgas-ppk.com';
    const password = 'Admin123!';

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log('Email:', email);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: 'Administrator',
        email: email,
        role: 'SATGAS',
        emailVerified: true,
        accounts: {
          create: {
            providerId: 'email',
            accountId: email,
            password: hashedPassword,
          },
        },
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', admin.role);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();