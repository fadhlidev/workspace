import { treaty } from "@elysia/eden";
import type { App } from "@/server/app";

export const client = treaty<App>("http://localhost:3000");
