import { SignJWT, jwtVerify } from "jose";

const getSecretKey = () =>
  new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

export type JwtPayload = {
  sub: string;
  username: string;
  role: string;
  type: "access" | "refresh";
  exp?: number;
};

export async function signToken(
  payload: Omit<JwtPayload, "exp">,
  expiresIn: string,
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as JwtPayload;
  } catch {
    return null;
  }
}
