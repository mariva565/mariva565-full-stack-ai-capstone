import { OAuth2Client } from "google-auth-library";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);

export async function verifyGoogleIdToken(token: string) {
  if (!clientId) {
    throw new Error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
  }

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Invalid token payload");
  }

  if (!payload.email_verified) {
    throw new Error("Google email is not verified");
  }

  return payload;
}

export async function verifyGoogleAccessToken(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user info with access token");
  }

  const data = await response.json();

  if (!data.email_verified) {
    throw new Error("Google email is not verified");
  }

  return {
    sub: data.sub,
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}
