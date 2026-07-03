import "dotenv/config";
import { db, closeDb } from "@/lib/db";
import { users } from "@/db/schemas/users";
import {
  permissionResources,
  permissionActions,
  rolePermissions,
} from "@/db/schemas/rbac";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";

const RESOURCES = [
  {
    name: "users",
    label: "User Management",
    description: "Manage system user accounts",
  },
  {
    name: "access-permission",
    label: "Access Permission",
    description: "Manage role-based access permissions",
  },
] as const;

const ACTIONS = [
  { name: "view", label: "View", description: "View resource data" },
  {
    name: "create",
    label: "Create",
    description: "Create new resource entries",
  },
  {
    name: "update",
    label: "Update",
    description: "Update existing resource entries",
  },
  { name: "delete", label: "Delete", description: "Delete resource entries" },
  { name: "export", label: "Export", description: "Export resource data" },
] as const;

async function seed() {
  const passwordHash = await bcrypt.hash("p4ssw0rD", 12);

  const allUsers = [
    {
      username: "admin",
      name: "Administrator",
      email: "admin@local.dev",
      role: "admin" as const,
    },
  ];

  for (const u of allUsers) {
    await db
      .insert(users)
      .values({ ...u, passwordHash })
      .onConflictDoNothing();
    console.log(`✅ User seeded: ${u.username}`);
  }

  const resourceMap: Record<string, string> = {};
  for (const r of RESOURCES) {
    const [inserted] = await db
      .insert(permissionResources)
      .values(r)
      .onConflictDoNothing()
      .returning({ id: permissionResources.id });
    if (inserted) {
      resourceMap[r.name] = inserted.id;
      console.log(`✅ Resource seeded: ${r.label}`);
    } else {
      const [existing] = await db
        .select({ id: permissionResources.id })
        .from(permissionResources)
        .where(eq(permissionResources.name, r.name));
      if (existing) resourceMap[r.name] = existing.id;
    }
  }

  const actionMap: Record<string, string> = {};
  for (const a of ACTIONS) {
    const [inserted] = await db
      .insert(permissionActions)
      .values(a)
      .onConflictDoNothing()
      .returning({ id: permissionActions.id });
    if (inserted) {
      actionMap[a.name] = inserted.id;
      console.log(`✅ Action seeded: ${a.label}`);
    } else {
      const [existing] = await db
        .select({ id: permissionActions.id })
        .from(permissionActions)
        .where(eq(permissionActions.name, a.name));
      if (existing) actionMap[a.name] = existing.id;
    }
  }

  const adminViewResources = RESOURCES.map((r) => r.name);
  const adminActions = ACTIONS.map((a) => a.name);

  for (const resource of adminViewResources) {
    for (const action of adminActions) {
      const rid = resourceMap[resource];
      const aid = actionMap[action];
      if (!rid || !aid) continue;

      const [existing] = await db
        .select({ id: rolePermissions.id })
        .from(rolePermissions)
        .where(
          and(
            eq(rolePermissions.role, "admin"),
            eq(rolePermissions.resourceId, rid),
            eq(rolePermissions.actionId, aid),
          ),
        )
        .limit(1);

      if (!existing) {
        await db
          .insert(rolePermissions)
          .values({ role: "admin", resourceId: rid, actionId: aid });
      }
    }
  }
  console.log("✅ Admin permissions seeded: all resources × all actions");

  await closeDb();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
