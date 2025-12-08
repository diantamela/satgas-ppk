require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Initialize Prisma client with the same configuration as the app
const globalForPrisma = global;

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
  console.error('DATABASE_URL or DIRECT_URL not found in environment variables');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  adapter,
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Test accounts configuration
const testAccounts = [
  {
    email: 'user@test.com',
    password: 'password123',
    name: 'Test User',
    role: 'USER',
    affiliation: 'STUDENT'
  },
  {
    email: 'satgas@test.com',
    password: 'password123',
    name: 'Test Satuan Tugas',
    role: 'SATGAS',
    affiliation: 'FACULTY'
  },
  {
    email: 'rektor@test.com',
    password: 'password123',
    name: 'Test Rektor',
    role: 'REKTOR',
    affiliation: 'FACULTY'
  }
];

async function createTestAccounts() {
  console.log('Creating test accounts...\n');

  for (const account of testAccounts) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: account.email.toLowerCase() }
      });

      if (existingUser) {
        console.log(`⚠️  User ${account.email} already exists, skipping...`);
        continue;
      }

      // Hash the password
      const passwordHash = await bcrypt.hash(account.password, 10);

      // Create the user
      const user = await prisma.user.create({
        data: {
          email: account.email.toLowerCase(),
          password: passwordHash,
          name: account.name,
          role: account.role,
          affiliation: account.affiliation,
          isActive: true
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          affiliation: true,
          isActive: true,
          createdAt: true
        }
      });

      console.log(`✅ Successfully created ${account.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Affiliation: ${user.affiliation}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   ID: ${user.id}\n`);

    } catch (error) {
      console.error(`❌ Error creating user ${account.email}:`, error.message);
    }
  }

  console.log('Account creation process completed!');
  
  // Display login credentials
  console.log('\n📋 Login Credentials:');
  console.log('=====================');
  testAccounts.forEach((account, index) => {
    console.log(`${index + 1}. Email: ${account.email}`);
    console.log(`   Password: ${account.password}`);
    console.log(`   Role: ${account.role}`);
    console.log('   ---');
  });
}

async function verifyAccounts() {
  console.log('\n🔍 Verifying created accounts...\n');
  
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: testAccounts.map(acc => acc.email.toLowerCase())
      }
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      affiliation: true,
      isActive: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`Found ${users.length} test accounts:`);
  users.forEach(user => {
    console.log(`• ${user.email} (${user.role}) - ${user.affiliation}`);
  });
}

async function main() {
  try {
    console.log('Connecting to database...');
    console.log('Database URL:', connectionString ? 'Found' : 'Not found');
    
    await createTestAccounts();
    await verifyAccounts();
  } catch (error) {
    console.error('Error in main process:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});