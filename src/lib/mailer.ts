import nodemailer from "nodemailer";

interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

let transporter: nodemailer.Transporter | undefined;

/** Best-effort email. Without SMTP settings the message is printed to the server console (handy in development). */
export async function sendMail({ to, subject, html, text }: Mail): Promise<boolean> {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log(`\n[mail] SMTP not configured. Would send "${subject}" to ${to}:\n${text}\n`);
    return false;
  }
  try {
    transporter ??= nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: SMTP_SECURE === "true",
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transporter.sendMail({ from: MAIL_FROM || SMTP_USER, to, subject, html, text });
    return true;
  } catch (err) {
    console.warn(`[mail] could not send "${subject}":`, (err as Error).message);
    return false;
  }
}
