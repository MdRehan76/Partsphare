const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.secure,
      auth: {
        user: config.mail.user,
        pass: config.mail.pass,
      },
    });
  }
  return transporter;
};

/**
 * Send an email
 * @param {object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} [options.text]
 */
const sendMail = async ({ to, subject, html, text }) => {
  try {
    const t = getTransporter();
    const info = await t.sendMail({
      from: config.mail.from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });
    return info;
  } catch (err) {
    // Non-fatal: log but don't throw so order flows don't break
    console.error('[Mailer] Failed to send email:', err.message);
    return null;
  }
};

/**
 * Welcome email template
 */
const sendWelcomeEmail = async (user) => {
  return sendMail({
    to: user.email,
    subject: 'Welcome to PartSphere!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FF6B35;">Welcome to PartSphere, ${user.firstName}! 🚗</h1>
        <p>Your account has been created successfully.</p>
        <p>Start by adding your vehicle to get compatible part recommendations.</p>
        <a href="http://localhost:5173/garage" 
           style="display:inline-block;background:#FF6B35;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:16px;">
          Add Your Vehicle
        </a>
        <p style="color:#666;margin-top:32px;font-size:12px;">
          If you did not create this account, please ignore this email.
        </p>
      </div>
    `,
  });
};

module.exports = { sendMail, sendWelcomeEmail };
