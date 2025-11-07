import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'test@mail.com' // <— ganti dg email user yg mau login
  const plain = 'P@ssw0rd123!'  // <— ganti dg password yg mau dipakai login

  const u = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!u) {
    console.log('USER NOT FOUND')
    return
  }
  console.log('USER OK:', { id: u.id, email: u.email, hasPassword: !!u.password })
  const ok = await bcrypt.compare(plain, u.password)
  console.log('BCRYPT MATCH =', ok)
}

main().finally(()=>process.exit(0))
