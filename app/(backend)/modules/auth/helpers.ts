export async function getAuthRole(
  verify: (token?: string) => Promise<false | Record<string, unknown>>,
  request: Request,
): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const payload = await verify(authHeader.slice(7));
  if (!payload) return null;
  return (payload as { role: string }).role;
}
