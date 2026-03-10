import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: "postgresql://postgres.gawjfnghxjjzxngfwhrj:Tokify2026!@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres",
  },
});
