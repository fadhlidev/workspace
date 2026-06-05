import { Elysia } from "elysia";
import { jwt } from "@/server/plugins/jwt";
import { auth } from "@/server/modules/auth";
import { user } from "@/server/modules/user";

export const app = new Elysia({ prefix: "/api" }).use(jwt).use(auth).use(user);

export type App = typeof app;
