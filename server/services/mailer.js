const nodemailer = require('nodemailer');

/**
 * Creates a Nodemailer transporter using Gmail SMTP.
 *
 * Setup (one-time):
 *  1. Enable 2-Step Verification on your Google account.
 *  2. Go to: Google Account → Security → App Passwords.
 *  3. Create an App Password for "Mail" — copy the 16-character code.
 *  4. Set GMAIL_USER and GMAIL_PASS in server/.env
 */
function createTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    throw new Error(
      'Email not configured. Add GMAIL_USER and GMAIL_PASS to server/.env\n' +
      'See README for Gmail App Password setup instructions.'
    );
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
    connectionTimeout: 10000, // 10 seconds
    socketTimeout: 10000,     // 10 seconds
    greetingTimeout: 10000,   // 10 seconds
  });
}

/**
 * Sends a professional HTML email from the admin to a lead.
 * @param {Object} opts
 * @param {string} opts.toEmail   - Lead's email address
 * @param {string} opts.toName    - Lead's name
 * @param {string} opts.message   - Admin's message body
 */
async function sendLeadEmail({ toEmail, toName, message }) {
  const transporter = createTransporter();

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8" /></head>
    <body style="margin:0;padding:0;background:#f4f4f8;font-family:Inter,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 20px;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.12);">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#7c3aed,#0d9488);padding:32px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.02em;">🎯 NexOrbit Agency</h1>
                <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">A message from our team</p>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:32px 40px;">
                <p style="margin:0 0 16px;color:#374151;font-size:16px;">Hi <strong>${toName}</strong>,</p>
                <div style="background:#f9f8ff;border-left:4px solid #7c3aed;border-radius:4px;padding:20px 24px;margin:20px 0;">
                  <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;">${message.replace(/\n/g, '<br>')}</p>
                </div>
                <p style="margin:24px 0 0;color:#6b7280;font-size:14px;">
                  Best regards,<br>
                  <strong style="color:#374151;">The NexOrbit Agency Team</strong>
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#f9f8ff;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
                <p style="margin:0;color:#9ca3af;font-size:12px;">
                  Built for <a href="https://digitalheroesco.com" style="color:#7c3aed;text-decoration:none;">Digital Heroes Training Task</a>
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"NexOrbit Agency" <${process.env.GMAIL_USER}>`,
    to:   `"${toName}" <${toEmail}>`,
    subject: 'A message from NexOrbit Agency Team',
    html: htmlBody,
    text: message, // plain-text fallback
  });
}

module.exports = { sendLeadEmail };
