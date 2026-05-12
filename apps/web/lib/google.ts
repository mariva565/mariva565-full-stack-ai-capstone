import { OAuth2Client } from "google-auth-library";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const client = new OAuth2Client(clientId, clientSecret);

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

export async function exchangeGoogleCode(code: string, redirectUri: string) {
  if (!clientId || !clientSecret) {
    throw new Error("Missing GOOGLE_CLIENT_SECRET");
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    const err = await tokenResponse.text();
    throw new Error(`Google token exchange failed: ${err}`);
  }

  const tokens = await tokenResponse.json();

  // Use the id_token if available, otherwise use access_token
  if (tokens.id_token) {
    return verifyGoogleIdToken(tokens.id_token);
  }

  return verifyGoogleAccessToken(tokens.access_token);
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
