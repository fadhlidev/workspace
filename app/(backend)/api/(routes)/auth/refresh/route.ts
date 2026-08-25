import { api } from "@backend/api/server";

export async function POST(request: Request) {
  return api.fetch(request);
}
