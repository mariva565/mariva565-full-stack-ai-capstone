import { NextRequest, NextResponse } from "next/server";
import { sendContactMessage } from "../../../lib/email";

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 4000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactBody = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
};

function readTextField(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function hasHeaderBreak(value: string): boolean {
  return /[\r\n]/.test(value);
}

function badRequest(message: string) {
  return NextResponse.json({ code: "BAD_REQUEST", message }, { status: 400 });
}

async function readContactBody(request: NextRequest): Promise<ContactBody | null> {
  try {
    return (await request.json()) as ContactBody;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = await readContactBody(request);
  if (!body) return badRequest("Invalid JSON body");

  const name = readTextField(body.name, MAX_NAME_LENGTH);
  const email = readTextField(body.email, MAX_EMAIL_LENGTH).toLowerCase();
  const message = readTextField(body.message, MAX_MESSAGE_LENGTH);

  if (!name || !email || !message) {
    return badRequest("Name, email, and message are required");
  }

  if (hasHeaderBreak(name) || hasHeaderBreak(email) || !EMAIL_PATTERN.test(email)) {
    return badRequest("Please enter a valid email address");
  }

  try {
    await sendContactMessage({ name, email, message });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact email failed:", err);

    if (err instanceof Error && err.message === "SMTP_NOT_CONFIGURED") {
      return NextResponse.json(
        { code: "NOT_CONFIGURED", message: "Contact email is not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { code: "EMAIL_SEND_FAILED", message: "Could not send contact message" },
      { status: 502 }
    );
  }
}
