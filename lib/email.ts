import nodemailer from 'nodemailer'

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM
} = process.env as Record<string, string | undefined>

const enabled = !!(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM)

const transporter = enabled ? nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: Number(SMTP_PORT) === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
}) : null

export async function sendEmail({
  to,
  subject,
  text,
  html
}: { to: string; subject: string; text?: string; html?: string }) {
  if (!enabled || !transporter) {
    console.warn('Email not configured. Set SMTP_* env vars to enable notifications.')
    return
  }
  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text,
    html: html || text
  })
}
