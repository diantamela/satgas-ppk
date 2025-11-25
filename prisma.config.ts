import { defineConfig } from 'prisma/config'

export default defineConfig({
  database: {
    db: {
      provider: "postgresql",
      url: process.env.DATABASE_URL,
    },
  },
} as any)