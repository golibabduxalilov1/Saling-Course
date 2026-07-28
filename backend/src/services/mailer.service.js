const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    });
  }
  return transporter;
}

/**
 * Best-effort email notification. If SMTP isn't configured (no SMTP_HOST),
 * this silently does nothing instead of failing the request that triggered it.
 */
async function sendMail({ to, subject, text, html }) {
  const t = getTransporter();
  if (!t || !to) return;
  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@sotuv.uz',
      to,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error('Email yuborishda xatolik:', err.message);
  }
}

async function notifyAdminNewOrder(order) {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (!adminEmail) return;
  await sendMail({
    to: adminEmail,
    subject: `Yangi buyurtma: ${order.orderNumber}`,
    text: `Yangi buyurtma tushdi.\nRaqami: ${order.orderNumber}\nMijoz: ${order.customerName} (${order.phone})\nSumma: ${order.totalAmount}`,
  });
}

module.exports = { sendMail, notifyAdminNewOrder };
