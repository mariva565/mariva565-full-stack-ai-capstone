import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
const ISSUER = "studyhub";
const EXPIRES_IN = "1d";

export type JwtPayload = {
  sub: number;
  email: string;
  role: string;
};

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setExpirationTime(EXPIRES_IN)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { issuer: ISSUER });
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}
