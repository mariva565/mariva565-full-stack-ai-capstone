import { SignJWT, jwtVerify } from "jose";

const MIN_SECRET_LENGTH = 32;
const PLACEHOLDER_PATTERNS = [
  "secret",
  "change-me",
  "changeme",
  "placeholder",
  "random_long_secret",
  "your-jwt-secret",
  "example",
];

const ISSUER = "studyhub";
const EXPIRES_IN = "1d";
const secret = new TextEncoder().encode(getJwtSecret());

export type JwtPayload = {
  sub: number;
  email: string;
  role: string;
};

function getJwtSecret(): string {
  const value = process.env.JWT_SECRET?.trim();
  const normalized = value?.toLowerCase() ?? "";

  if (!value) {
    throw new Error("JWT_SECRET is required. Generate a strong value in .env.local.");
  }

  if (value.length < MIN_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters long.`);
  }

  if (PLACEHOLDER_PATTERNS.some((pattern) => normalized.includes(pattern))) {
    throw new Error("JWT_SECRET looks like a placeholder. Generate a random secret.");
  }

  return value;
}

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
