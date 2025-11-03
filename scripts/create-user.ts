import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser() {
  try {
    const email = 'user@satgas-ppk.com';
    const password = 'User123!';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      console.log('✅ User already exists!');
      console.log('Name:', existingUser.name);
      console.log('Email:', existingUser.email);
      console.log('Role:', existingUser.role);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create regular user
    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: email,
        role: 'USER',
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

    console.log('✅ Regular user created successfully!');
    console.log('Name:', user.name);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', user.role);

  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();