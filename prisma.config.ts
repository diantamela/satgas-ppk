import "dotenv/config";
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!, // atau process.env.DIRECT_URL kalau itu yang kamu pakai
  },
});
