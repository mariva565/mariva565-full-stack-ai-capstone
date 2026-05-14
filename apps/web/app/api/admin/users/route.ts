import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { users } from "../../../../../../drizzle/schema";
import { requireAuth, requireAdmin } from "../../../../lib/api-utils";
import { logActivity } from "../../../../lib/activity";
import { hashPassword } from "../../../../lib/auth";
import { isStrongPassword } from "../../../../lib/password-validation";
import { buildPageMeta, normalizeSearch, readPaginationParams } from "../../../../lib/pagination";
import { combineConditions } from "../../../../lib/query-conditions";
import { count, desc, eq, ilike, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const { searchParams } = new URL(request.url);
  const { page, limit, offset } = readPaginationParams(searchParams, {
    defaultLimit: 50,
    maxLimit: 200,
  });
  const search = normalizeSearch(searchParams.get("search"));
  const viewAs = normalizeSearch(searchParams.get("viewAs"));
  const where = combineConditions([
    viewAs ? eq(users.email, viewAs) : undefined,
    search
      ? or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.role, `%${search}%`)
        )
      : undefined,
  ]);

  const [allUsers, [totalRow]] = await Promise.all([
    db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        avatarUrl: users.avatarUrl,
        blocked: users.blocked,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(users).where(where),
  ]);

  return NextResponse.json({
    users: allUsers,
    ...buildPageMeta(page, limit, totalRow.value),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const body = await request.json();
  const { email, name, password, role } = body;

  if (!email || !name || !password) {
    return NextResponse.json(
      { code: "MISSING_FIELDS", message: "Email, name, and password are required" },
      { status: 400 }
    );
  }

  if (!isStrongPassword(password)) {
    return NextResponse.json(
      { code: "WEAK_PASSWORD", message: "Password does not meet strength requirements" },
      { status: 400 }
    );
  }

  if (role && !["user", "mentor", "admin"].includes(role)) {
    return NextResponse.json(
      { code: "INVALID_ROLE", message: "Role must be 'user', 'mentor', or 'admin'" },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.trim()))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { code: "DUPLICATE_EMAIL", message: "A user with this email already exists" },
      { status: 409 }
    );
  }

  const [created] = await db
    .insert(users)
    .values({
      email: email.trim(),
      name: name.trim(),
      passwordHash: hashPassword(password),
      role: role || "user",
    })
    .returning({ id: users.id, email: users.email, name: users.name, role: users.role });

  await logActivity(auth.user.sub, "admin_create_user", created.id, { email: created.email });

  return NextResponse.json({ user: created }, { status: 201 });
}
