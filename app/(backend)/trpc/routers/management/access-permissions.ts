import {
  router,
  adminProcedure,
  permissionProcedure,
} from "@backend/trpc/trpc";
import {
  getPermissionActions,
  getPermissionResources,
  getRolePermissions,
  toggleRolePermission,
  updateRolePermissions,
} from "@backend/modules/management/access-permissions/services";
import {
  toggleRolePermissionRequestSchema,
  updateRolePermissionsRequestSchema,
} from "@shared/schemas/management/access-permissions";
import { Resources, Actions } from "@backend/modules/rbac/constants";

export const managementAccessPermissionsRouter = router({
  getResources: adminProcedure.query(() => getPermissionResources()),

  getActions: adminProcedure.query(() => getPermissionActions()),

  getRolePermissions: permissionProcedure(
    Resources.ACCESS_PERMISSION,
    Actions.VIEW,
  ).query(() => getRolePermissions()),

  updateRolePermissions: permissionProcedure(
    Resources.ACCESS_PERMISSION,
    Actions.UPDATE,
  )
    .input(updateRolePermissionsRequestSchema)
    .mutation(async ({ input }) => updateRolePermissions(input.permissions)),

  toggleRolePermission: permissionProcedure(
    Resources.ACCESS_PERMISSION,
    Actions.UPDATE,
  )
    .input(toggleRolePermissionRequestSchema)
    .mutation(async ({ input }) => toggleRolePermission(input)),
});
