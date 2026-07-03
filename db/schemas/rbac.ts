import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { userRoleEnum } from "@/db/schemas/users";

export const permissionResources = pgTable("permission_resources", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const permissionActions = pgTable("permission_actions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    role: userRoleEnum("role").notNull(),
    resourceId: uuid("resource_id")
      .references(() => permissionResources.id, { onDelete: "cascade" })
      .notNull(),
    actionId: uuid("action_id")
      .references(() => permissionActions.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueRoleResourceAction: uniqueIndex("rp_role_resource_action_idx").on(
      table.role,
      table.resourceId,
      table.actionId,
    ),
  }),
);
