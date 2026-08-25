import { Elysia } from "elysia";
import { jwt } from "@backend/plugins/jwt";
import { users } from "@backend/modules/management/users/api";
import { accessPermission } from "@backend/modules/management/access-permissions/api";
import { getAuthRole } from "@backend/modules/auth/helpers";

export const management = new Elysia({
  name: "management",
  prefix: "/management",
})
  .use(jwt)
  .guard({
    async beforeHandle({ jwt, request, status }) {
      const role = await getAuthRole(jwt.verify, request);
      if (!role) {
        return status(401, { message: "Unauthorized" });
      }
      if (role !== "admin") {
        return status(403, { message: "Forbidden: Admin access required" });
      }
    },
  })
  .use(users)
  .use(accessPermission);
