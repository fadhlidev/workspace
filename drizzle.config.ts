import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./app/(storage)/database/schemas/*",
  out: "./app/(storage)/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
