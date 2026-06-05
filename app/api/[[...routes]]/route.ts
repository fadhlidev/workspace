import { app } from "@/server/app";

export async function GET(request: Request) {
  return app.fetch(request);
}

export async function POST(request: Request) {
  return app.fetch(request);
}

export async function PUT(request: Request) {
  return app.fetch(request);
}
