import { Elysia } from "elysia";
import { jwt } from "@/server/plugins/jwt";
import { auth } from "@/server/modules/auth";
import { user } from "@/server/modules/user";
import { permissions } from "@/server/modules/permissions";
import { management } from "@/server/modules/management";

export const app = new Elysia({ prefix: "/api" })
  .use(jwt)
  .use(auth)
  .use(user)
  .use(permissions)
  .use(management);

export type App = typeof app;
