import { Elysia } from "elysia";
import { jwt } from "@backend/plugins/jwt";
import { auth } from "@backend/modules/auth/api";
import { profile } from "@backend/modules/profile/api";
import { rbac } from "@backend/modules/rbac/api";
import { management } from "@backend/modules/management/api";

export const api = new Elysia({ prefix: "/api" })
  .use(jwt)
  .use(auth)
  .use(profile)
  .use(rbac)
  .use(management);

export type Api = typeof api;
