import nodemailer from "nodemailer";
import { PASSWORD_RESET_TTL_HOURS } from "./password-reset";

type SmtpConfig = {
  smtpUser: string;
  contactToEmail: string;
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT ?? "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function getSmtpConfig(): SmtpConfig {
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();

  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP_NOT_CONFIGURED");
  }

  return {
    smtpUser,
    contactToEmail: process.env.CONTACT_TO_EMAIL?.trim() || smtpUser,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function cleanHeaderValue(value: string, fallback: string): string {
  const cleaned = value.replace(/[\r\n]+/g, " ").trim();
  return cleaned || fallback;
}

function formatMultilineHtml(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

export interface ShareNotificationParams {
  to: string;
  senderName: string;
  materialTitle: string;
  materialType: "note" | "file" | "link" | "material";
  materialUrl: string;
}

export async function sendShareNotification({
  to,
  senderName,
  materialTitle,
  materialType,
  materialUrl,
}: ShareNotificationParams) {
  const { smtpUser } = getSmtpConfig();
  const typeLabel =
    materialType === "note"
      ? "note"
      : materialType === "file"
        ? "file"
        : materialType === "link"
          ? "link"
          : "material";

  const cleanSender = cleanHeaderValue(senderName, "Someone");
  const safeSender = escapeHtml(cleanSender);
  const safeTitle = escapeHtml(materialTitle);
  const safeUrl = isSafeUrl(materialUrl) ? escapeHtml(materialUrl) : "#";

  await transporter.sendMail({
    from: { name: "StudyHub", address: smtpUser },
    to,
    subject: `${cleanSender} shared a ${typeLabel} with you`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #6d28d9;">StudyHub</h2>
        <p><strong>${safeSender}</strong> shared a ${typeLabel} with you:</p>
        <p style="font-size: 1.1em;"><strong>${safeTitle}</strong></p>
        <a href="${safeUrl}" style="
          display: inline-block;
          margin-top: 16px;
          padding: 10px 20px;
          background: #6d28d9;
          color: white;
          border-radius: 8px;
          text-decoration: none;
        ">Open material</a>
        <p style="margin-top: 24px; color: #888; font-size: 0.85em;">
          You are receiving this message because a StudyHub user shared a material with you.
        </p>
      </div>
    `,
  });
}

export interface PasswordResetEmailParams {
  to: string;
  name: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: PasswordResetEmailParams) {
  const { smtpUser } = getSmtpConfig();
  const safeName = escapeHtml(cleanHeaderValue(name, "there"));
  const safeUrl = isSafeUrl(resetUrl) ? escapeHtml(resetUrl) : "#";
  const ttlLabel =
    PASSWORD_RESET_TTL_HOURS === 1
      ? "1 hour"
      : `${PASSWORD_RESET_TTL_HOURS} hours`;

  await transporter.sendMail({
    from: { name: "StudyHub", address: smtpUser },
    to,
    subject: "Reset your StudyHub password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #6d28d9;">StudyHub</h2>
        <p>Hi <strong>${safeName}</strong>,</p>
        <p>We received a request to reset the password for your StudyHub account. Click the button below to set a new password.</p>
        <a href="${safeUrl}" style="
          display: inline-block;
          margin-top: 16px;
          padding: 10px 20px;
          background: #6d28d9;
          color: white;
          border-radius: 8px;
          text-decoration: none;
        ">Reset password</a>
        <p style="margin-top: 24px; color: #555; font-size: 0.9em;">
          This link expires in <strong>${ttlLabel}</strong>.
        </p>
        <p style="margin-top: 8px; color: #888; font-size: 0.85em;">
          If you didn&apos;t request this, you can safely ignore this email. Your password will not change.
        </p>
      </div>
    `,
  });
}

export interface ContactMessageParams {
  name: string;
  email: string;
  message: string;
}

export async function sendContactMessage({
  name,
  email,
  message,
}: ContactMessageParams) {
  const { smtpUser, contactToEmail } = getSmtpConfig();
  const cleanName = cleanHeaderValue(name, "StudyHub visitor");
  const cleanEmail = cleanHeaderValue(email, "unknown@example.com");
  const safeName = escapeHtml(cleanName);
  const safeEmail = escapeHtml(cleanEmail);
  const safeMessage = formatMultilineHtml(message);

  await transporter.sendMail({
    from: { name: "StudyHub Contact", address: smtpUser },
    to: contactToEmail,
    replyTo: { name: cleanName, address: cleanEmail },
    subject: `StudyHub contact message from ${cleanName}`,
    text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\n${message}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #6d28d9;">New StudyHub contact message</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="line-height: 1.6;">${safeMessage}</p>
      </div>
    `,
  });
}
