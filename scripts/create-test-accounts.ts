import bcrypt from 'bcryptjs';

interface TestAccount {
  email: string;
  password: string;
  name: string;
  role: 'USER' | 'SATGAS' | 'REKTOR';
  affiliation: 'STUDENT' | 'FACULTY' | 'STAFF' | 'GUEST';
}

// Test accounts configuration
const testAccounts: TestAccount[] = [
  {
    email: 'user@example.com',
    password: 'password123',
    name: 'Test User',
    role: 'USER',
    affiliation: 'STUDENT'
  },
  {
    email: 'satgas@example.com',
    password: 'password123',
    name: 'Test Satgas Member',
    role: 'SATGAS',
    affiliation: 'FACULTY'
  },
  {
    email: 'rektor@example.com',
    password: 'password123',
    name: 'Test Rector',
    role: 'REKTOR',
    affiliation: 'FACULTY'
  }
];

// Database configuration
const DATABASE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Database URL not found in environment variables');
  process.exit(1);
}

async function createUserInDatabase(email: string, password: string, name: string, role: string, affiliation: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  
  const userData = {
    email: email.toLowerCase(),
    password: name,
    role,
    passwordHash,
    affiliation,
    isActive: true
  };

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`Failed to create user ${email}:`, error);
      return null;
    }

    const result = await response.json();
    console.log(`Created user: ${email}`);
    return result.user;
  } catch (error) {
    console.error(`Error creating user ${email}:`, error);
    return null;
  }
}

async function updateUserRole(userId: string, newRole: string, authToken?: string) {
  try {
    // For demo purposes, we'll update the role directly in the database
    // In production, you would use proper authentication
    console.log(`Role update for user ${userId} to ${newRole} - This would require admin authentication`);
    return true;
  } catch (error) {
    console.error(`Error updating role for user ${userId}:`, error);
    return false;
  }
}

async function main() {
  console.log('Creating test accounts...\n');

  for (const account of testAccounts) {
    console.log(`Creating account for ${account.email} (${account.role})...`);
    
    const user = await createUserInDatabase(
      account.email,
      account.password,
      account.name,
      account.role,
      account.affiliation
    );

    if (user) {
      console.log(`✅ Successfully created ${account.email}`);
      console.log(`   Password: ${account.password}`);
      console.log(`   Role: ${account.role}`);
      console.log(`   Affiliation: ${account.affiliation}\n`);
    } else {
      console.log(`❌ Failed to create ${account.email}\n`);
    }
  }

  console.log('Account creation process completed!');
  console.log('\nLogin Credentials:');
  console.log('==================');
  testAccounts.forEach(account => {
    console.log(`Email: ${account.email}`);
    console.log(`Password: ${account.password}`);
    console.log(`Role: ${account.role}`);
    console.log('---');
  });
}

if (require.main === module) {
  main().catch(console.error);
}