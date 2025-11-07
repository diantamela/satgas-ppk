import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Testing database connection...')

    // Test connection first
    await prisma.$connect()
    console.log('Database connected successfully')

    const email = `test${Date.now()}@mail.com`.toLowerCase()
    const hash = await bcrypt.hash('P@ssw0rd123!', 10)

    console.log('Attempting to create user with email:', email)

    const user = await prisma.user.create({
      data: {
        email,
        name: 'Smoke',
        password: hash, // <-- WAJIB ada karena schema User.password NOT NULL
      },
      select: { id: true, email: true, name: true, createdAt: true },
    })

    console.log('User created successfully:', user)
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
