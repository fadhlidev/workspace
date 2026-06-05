import { app } from "@/server/app";

export async function POST(request: Request) {
  return app.fetch(request);
}
