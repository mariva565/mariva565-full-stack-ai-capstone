import { SignJWT, jwtVerify } from "jose";

const ISSUER = "studyhub";
const AUDIENCE = "material-file-download";
const MIN_SECRET_LENGTH = 32;

export const MATERIAL_FILE_LINK_EXPIRES_IN_SECONDS = 60;
export const MATERIAL_FILE_LINK_QUERY_PARAM = "downloadToken";

type MaterialFileLinkPayload = {
  materialId: number;
  pathname: string;
};

function getSigningKey(): Uint8Array {
  const fileLinkSecret = process.env.FILE_LINK_SIGNING_SECRET?.trim();
  const jwtSecret = process.env.JWT_SECRET?.trim();
  const secret = fileLinkSecret || jwtSecret;

  if (!secret) {
    throw new Error("FILE_LINK_SIGNING_SECRET or JWT_SECRET is required.");
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error("File link signing secret must be at least 32 characters.");
  }

  return new TextEncoder().encode(secret);
}

function isMaterialFileLinkPayload(
  value: Record<string, unknown>
): value is MaterialFileLinkPayload {
  return (
    typeof value.materialId === "number" &&
    Number.isFinite(value.materialId) &&
    value.materialId > 0 &&
    typeof value.pathname === "string" &&
    value.pathname.trim().length > 0
  );
}

export async function signMaterialFileLinkToken({
  materialId,
  pathname,
}: MaterialFileLinkPayload): Promise<string> {
  return new SignJWT({ materialId, pathname })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(`${MATERIAL_FILE_LINK_EXPIRES_IN_SECONDS}s`)
    .sign(getSigningKey());
}

export async function verifyMaterialFileLinkToken(
  token: string
): Promise<MaterialFileLinkPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSigningKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    if (!isMaterialFileLinkPayload(payload)) {
      return null;
    }

    return {
      materialId: payload.materialId,
      pathname: payload.pathname.trim(),
    };
  } catch {
    return null;
  }
}
