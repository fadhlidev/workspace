import "dotenv/config";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { sql } from "drizzle-orm";
import { db, closeDb } from "@storage/database";

const MIGRATIONS_SCHEMA = "drizzle";
const MIGRATIONS_TABLE = "__drizzle_migrations";
const MIGRATIONS_FOLDER = "./app/(storage)/database/migrations";

async function main() {
  console.log("⏳ Running migrations...");

  await db.execute(
    sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(MIGRATIONS_SCHEMA)}`,
  );
  await db.execute(
    sql`CREATE TABLE IF NOT EXISTS ${sql.identifier(MIGRATIONS_SCHEMA)}.${sql.identifier(MIGRATIONS_TABLE)} (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )`,
  );

  const applied = await db.execute<{ hash: string }>(
    sql`select hash from ${sql.identifier(MIGRATIONS_SCHEMA)}.${sql.identifier(MIGRATIONS_TABLE)}`,
  );
  const appliedHashes = new Set(applied.rows.map((row) => row.hash));

  const migrations = readMigrationFiles({
    migrationsFolder: MIGRATIONS_FOLDER,
  });

  for (const migration of migrations) {
    if (appliedHashes.has(migration.hash)) {
      console.log(`  ↻ ${migration.folderMillis} already applied, skipping`);
      continue;
    }

    console.log(`  → ${migration.folderMillis} applying...`);
    await db.transaction(async (tx) => {
      for (const stmt of migration.sql) {
        await tx.execute(sql.raw(stmt));
      }
      await tx.execute(
        sql`insert into ${sql.identifier(MIGRATIONS_SCHEMA)}.${sql.identifier(MIGRATIONS_TABLE)} ("hash", "created_at") values(${migration.hash}, ${migration.folderMillis})`,
      );
    });
  }

  console.log("✅ Migrations complete");
  await closeDb();
}

main().catch(async (err) => {
  console.error("❌ Migration failed:", err);
  await closeDb();
  process.exit(1);
});
