import { api } from "@backend/api/server";

export async function GET(request: Request) {
  return api.fetch(request);
}

export async function POST(request: Request) {
  return api.fetch(request);
}

export async function PUT(request: Request) {
  return api.fetch(request);
}
