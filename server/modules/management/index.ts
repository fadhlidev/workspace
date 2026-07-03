import { Elysia } from "elysia";
import { jwt } from "@/server/plugins/jwt";
import { users } from "@/server/modules/management/users";
import { accessPermission } from "@/server/modules/management/access-permission";
import { getAuthRole } from "@/server/helpers/auth";

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
