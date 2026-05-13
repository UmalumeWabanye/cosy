const { Resend } = require('resend');

const roleLabels = {
  student: 'Student',
  landlord: 'Landlord',
  admin: 'Admin',
};

/**
 * Send an invite email to a new user.
 * @param {{ name: string, email: string, role: string, setupUrl: string }} opts
 */
async function sendInviteEmail({ name, email, role, setupUrl }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const roleLabel = roleLabels[role] || 'User';
  const firstName = name.split(' ')[0];

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to Cosy</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1976d2 0%,#1565c0 100%);padding:32px 40px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:rgba(255,255,255,0.2);border-radius:8px;padding:8px 10px;vertical-align:middle;">
                    <span style="font-size:20px;">🏠</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.3px;">Cosy</span>
                  </td>
                </tr>
              </table>
              <p style="color:rgba(255,255,255,0.85);margin:16px 0 0;font-size:14px;">Student Accommodation Platform</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">Welcome to Cosy, ${firstName}!</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
                You've been invited to join Cosy as a <strong style="color:#1976d2;">${roleLabel}</strong>.
                Click the button below to set up your password and access your account.
              </p>
              <a href="${setupUrl}"
                style="display:inline-block;background:#1976d2;color:#ffffff;font-size:15px;font-weight:600;
                       padding:13px 28px;border-radius:8px;text-decoration:none;letter-spacing:0.1px;">
                Set Up My Account
              </a>
              <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.6;">
                This invite link expires in <strong>48 hours</strong>. If you didn't expect this email, you can safely ignore it.
              </p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;" />
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                Or copy this link into your browser:<br/>
                <a href="${setupUrl}" style="color:#1976d2;word-break:break-all;">${setupUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                &copy; ${new Date().getFullYear()} Cosy &mdash; Student Accommodation Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Cosy <onboarding@resend.dev>',
    to: email,
    subject: `You're invited to Cosy as a ${roleLabel}`,
    html,
  });
}

module.exports = sendInviteEmail;
