import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { users, oauthAccounts } from "../../../../../../drizzle/schema";
import { signToken } from "../../../../lib/jwt";
import { verifyGoogleIdToken, verifyGoogleAccessToken } from "../../../../lib/google";
import { eq, and } from "drizzle-orm";
import { hashPassword } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, type } = body;

    // We can receive either an 'id_token' (from standard GSI component)
    // or an 'access_token' (from custom useGoogleLogin hook)
    if (!token) {
      return NextResponse.json(
        { code: "MISSING_TOKEN", message: "Google token is required" },
        { status: 400 }
      );
    }

    // 1. Verify the token with Google
    let googleUserId: string;
    let googleEmail: string;
    let googleName: string;

    if (type === "access_token") {
      const profile = await verifyGoogleAccessToken(token);
      googleUserId = profile.sub;
      googleEmail = profile.email;
      googleName = profile.name || "Google User";
    } else {
      const payload = await verifyGoogleIdToken(token);
      googleUserId = payload.sub;
      googleEmail = payload.email!;
      googleName = payload.name || "Google User";
    }

    if (!googleUserId || !googleEmail) {
      return NextResponse.json(
        { code: "INVALID_TOKEN", message: "Invalid Google token claims" },
        { status: 400 }
      );
    }

    let userToSignIn = null;

    // 2. Check if this exact Google account is already linked to a user
    const [existingOAuthAccount] = await db
      .select({ userId: oauthAccounts.userId })
      .from(oauthAccounts)
      .where(
        and(
          eq(oauthAccounts.provider, "google"),
          eq(oauthAccounts.providerUserId, googleUserId)
        )
      )
      .limit(1);

    if (existingOAuthAccount) {
      // User is already linked
      const [existingUser] = await db
        .select({ id: users.id, email: users.email, role: users.role, blocked: users.blocked })
        .from(users)
        .where(eq(users.id, existingOAuthAccount.userId))
        .limit(1);

      if (existingUser) {
        userToSignIn = existingUser;
      }
    }

    // 3. If no matching oauth_account, find user by email or create a new user
    if (!userToSignIn) {
      const [existingUserByEmail] = await db
        .select({ id: users.id, email: users.email, role: users.role, blocked: users.blocked })
        .from(users)
        .where(eq(users.email, googleEmail))
        .limit(1);

      if (existingUserByEmail) {
        // Link the Google account to the existing user
        await db.insert(oauthAccounts).values({
          userId: existingUserByEmail.id,
          provider: "google",
          providerUserId: googleUserId,
          providerEmail: googleEmail,
        });

        userToSignIn = existingUserByEmail;
      } else {
        // Create a new user with a random unguessable password
        // (Since the original backend required non-null passwordHash)
        const randomPassword = require("crypto").randomBytes(32).toString("hex");
        const hashedRandomPassword = hashPassword(randomPassword);

        const [newUser] = await db
          .insert(users)
          .values({
            email: googleEmail,
            name: googleName,
            passwordHash: hashedRandomPassword,
            role: "user",
          })
          .returning({ id: users.id, email: users.email, role: users.role, blocked: users.blocked });

        // Link the Google account to the new user
        await db.insert(oauthAccounts).values({
          userId: newUser.id,
          provider: "google",
          providerUserId: googleUserId,
          providerEmail: googleEmail,
        });

        userToSignIn = newUser;
      }
    }

    if (!userToSignIn) {
      throw new Error("Failed to sign in or create user");
    }

    if (userToSignIn.blocked) {
      return NextResponse.json(
        { code: "ACCOUNT_BLOCKED", message: "This account is blocked" },
        { status: 403 }
      );
    }

    // 4. Generate standard JWT
    const jwtToken = await signToken({
      sub: userToSignIn.id,
      email: userToSignIn.email,
      role: userToSignIn.role,
    });

    // 5. Build standard response with cookies
    const { blocked: _blocked, ...userPublic } = userToSignIn;
    const response = NextResponse.json(
      {
        message: "Login successful",
        token: jwtToken,
        user: userPublic,
      },
      { status: 200 }
    );

    response.cookies.set("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google Auth Error:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to authenticate with Google" },
      { status: 500 }
    );
  }
}
