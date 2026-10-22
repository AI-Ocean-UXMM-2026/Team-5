import nodemailer from "nodemailer";

export async function deliverOffer({ to, companyName, role, duration, stipend }) {
  if (!process.env.SMTP_HOST) return { sentAt: null, error: "SMTP_HOST is not set." };
  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD || "" } : undefined,
    });
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || "citadel@localhost",
      to,
      subject: `Offer from ${companyName}`,
      text: `You have an offer for ${role || "an internship"} (${duration || "duration not set"}, ${stipend || "stipend not set"}). Sign in to accept or decline.`,
    });
    return { sentAt: new Date(), error: null };
  } catch (error) {
    return { sentAt: null, error: error.message || "Email failed." };
  }
}
