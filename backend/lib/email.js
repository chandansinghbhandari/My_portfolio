/**
 * Nodemailer email service
 */

'use strict';

// import nodemailer from "nodemailer";
const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false, // TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter;
}

/**
 * Send contact form notification to Rahul
 */
async function sendContactNotification({ name, email, budget, message }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('  ⚠️  SMTP not configured — skipping email notification');
    return { skipped: true };
  }

  const budgetLabels = {
    starter:    '$999 – $2,000 (Starter)',
    growth:     '$2,000 – $5,000 (Growth)',
    enterprise: '$5,000+ (Enterprise)'
  };

  const mail = {
    from:    `"Portfolio Contact" <${process.env.SMTP_USER}>`,
    to:      process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER,
    replyTo: email,
    subject: `🚀 New Lead from Portfolio: ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0d1117;color:#f0f4fc;padding:32px;border-radius:12px;">
        <h2 style="color:#f5a623;margin:0 0 24px;">New Project Inquiry</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;color:#8a93a8;width:120px;">Name</td>
            <td style="padding:10px 0;font-weight:600;">${name}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#8a93a8;">Email</td>
            <td style="padding:10px 0;"><a href="mailto:${email}" style="color:#f5a623;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#8a93a8;">Budget</td>
            <td style="padding:10px 0;">${budgetLabels[budget] || budget || 'Not specified'}</td>
          </tr>
        </table>
        <div style="margin-top:24px;padding:20px;background:#141922;border-radius:8px;border-left:4px solid #f5a623;">
          <p style="color:#8a93a8;font-size:13px;margin:0 0 8px;">Message</p>
          <p style="margin:0;line-height:1.6;">${message.replace(/\n/g, '<br/>')}</p>
        </div>
        <p style="color:#5a6478;font-size:12px;margin-top:24px;">Sent from chandansinghbhandari.dev portfolio — ${new Date().toLocaleString()}</p>
      </div>
    `
  };

  const info = await getTransporter().sendMail(mail);
  return { messageId: info.messageId };
}

/**
 * Send auto-reply to the visitor
 */
async function sendAutoReply({ name, email }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return { skipped: true };

  const mail = {
    from:    `"Chandan Singh Bhandari" <${process.env.SMTP_USER}>`,
    to:      email,
    subject: `Got your message, ${name}! 👋`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0d1117;color:#f0f4fc;padding:32px;border-radius:12px;">
        <h2 style="color:#f5a623;margin:0 0 16px;">Hey ${name}, thanks for reaching out!</h2>
        <p style="color:#8a93a8;line-height:1.7;">I've received your message and I'll get back to you within <strong style="color:#f0f4fc;">24 hours</strong> with a detailed response.</p>
        <p style="color:#8a93a8;line-height:1.7;">In the meantime, feel free to check out my projects or explore my services on the portfolio.</p>
        <div style="margin-top:32px;padding:20px;background:#141922;border-radius:8px;">
          <p style="margin:0;font-size:14px;color:#5a6478;">While you wait, you can:</p>
          <ul style="color:#8a93a8;font-size:14px;line-height:2;margin:8px 0 0;padding-left:20px;">
            <li>Browse project case studies on the portfolio</li>
            <li>Connect with me on <a href="https://www.linkedin.com/in/chandan-singh-bhandari-91627a330/" style="color:#f5a623;">LinkedIn</a></li>
            <li>Check out my code on <a href="https://github.com/chandansinghbhandari" style="color:#f5a623;">GitHub</a></li>
          </ul>
        </div>
        <p style="margin-top:32px;color:#f0f4fc;">Talk soon,<br/><strong>Chandan Singh Bhandari</strong><br/><span style="color:#8a93a8;font-size:13px;">Full Stack Developer & AI Engineer</span></p>
      </div>
    `
  };

  const info = await getTransporter().sendMail(mail);
  return { messageId: info.messageId };
}

// export {
//   sendContactNotification,
//   sendAutoReply
// };

module.exports = {
  sendContactNotification,
  sendAutoReply
};