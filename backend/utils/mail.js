import nodemailer from "nodemailer";

export function createTransport() {
  const port = Number(process.env.MAIL_PORT || 587);
  const secure =
    typeof process.env.MAIL_SECURE === "string"
      ? process.env.MAIL_SECURE.toLowerCase() === "true"
      : Boolean(process.env.MAIL_SECURE);

  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port,
    secure,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

export async function sendMail({ to, subject, html, text }) {
  const transporter = createTransport();
  const from = process.env.MAIL_FROM || process.env.MAIL_USER;
  await transporter.sendMail({ from, to, subject, html, text });
}

