const { Resend } = require('resend');

const sendEventEmail = async ({ to, subject, heading, body, ctaUrl, ctaLabel = 'View in Cosy' }) => {
  if (!process.env.RESEND_API_KEY) return;
  if (!to || !subject || !heading || !body) return;

  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#1976d2 0%,#1565c0 100%);padding:28px 36px;">
              <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.3px;">Cosy</span>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 36px;">
              <h1 style="margin:0 0 10px;font-size:22px;font-weight:700;color:#111827;">${heading}</h1>
              <p style="margin:0 0 20px;font-size:15px;color:#4b5563;line-height:1.6;">${body}</p>
              ${ctaUrl ? `<a href="${ctaUrl}" style="display:inline-block;background:#1976d2;color:#fff;font-size:14px;font-weight:600;padding:12px 22px;border-radius:8px;text-decoration:none;">${ctaLabel}</a>` : ''}
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
    to,
    subject,
    html,
  });
};

module.exports = sendEventEmail;
