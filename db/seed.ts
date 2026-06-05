import "dotenv/config";
import { db, closeDb } from "@/lib/db";
import { users } from "@/db/schema/users";
import bcrypt from "bcrypt";

async function seed() {
  const passwordHash = await bcrypt.hash("p4ssw0rD", 12);

  await db.insert(users).values({
    username: "admin",
    email: "admin@local.dev",
    passwordHash,
    name: "Administrator",
    role: "admin",
  });

  console.log("✅ Default admin user seeded (admin / p4ssw0rD)");
  await closeDb();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
