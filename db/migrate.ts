import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, closeDb } from "@/lib/db";

async function main() {
  console.log("⏳ Running migrations...");
  await migrate(db, { migrationsFolder: "./db/migrations" });
  console.log("✅ Migrations complete");
  await closeDb();
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
