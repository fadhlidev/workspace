import { z } from "zod";

export const updateRolePermissionsRequestSchema = z.object({
  permissions: z.array(
    z.object({
      role: z.enum(["user", "admin"]),
      resourceId: z.string(),
      actionId: z.string(),
    }),
  ),
});

export type RolePermissionEntry = z.infer<
  typeof updateRolePermissionsRequestSchema
>["permissions"][number];

export type UpdateRolePermissionsRequest = z.infer<
  typeof updateRolePermissionsRequestSchema
>;

export const toggleRolePermissionRequestSchema = z.object({
  targetRole: z.enum(["user", "admin"]),
  resourceId: z.string(),
  actionId: z.string(),
  enabled: z.boolean(),
});

export type ToggleRolePermissionRequest = z.infer<
  typeof toggleRolePermissionRequestSchema
>;
