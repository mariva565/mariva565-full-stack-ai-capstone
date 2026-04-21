import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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
  const typeLabel =
    materialType === "note"
      ? "бележка"
      : materialType === "file"
        ? "файл"
        : materialType === "link"
          ? "линк"
          : "материал";

  const safeSender = escapeHtml(senderName);
  const safeTitle = escapeHtml(materialTitle);
  const safeUrl = isSafeUrl(materialUrl) ? escapeHtml(materialUrl) : "#";

  await transporter.sendMail({
    from: `"StudyHub" <${process.env.SMTP_USER}>`,
    to,
    subject: `${senderName} сподели ${typeLabel} с теб`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #6d28d9;">StudyHub</h2>
        <p><strong>${safeSender}</strong> сподели ${typeLabel} с теб:</p>
        <p style="font-size: 1.1em;"><strong>${safeTitle}</strong></p>
        <a href="${safeUrl}" style="
          display: inline-block;
          margin-top: 16px;
          padding: 10px 20px;
          background: #6d28d9;
          color: white;
          border-radius: 8px;
          text-decoration: none;
        ">Виж материала</a>
        <p style="margin-top: 24px; color: #888; font-size: 0.85em;">
          Получаваш това съобщение, защото потребител на StudyHub те е споделил материал.
        </p>
      </div>
    `,
  });
}
