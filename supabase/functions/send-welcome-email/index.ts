import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Azure AD credentials — updated credentials
const TENANT_ID = Deno.env.get("AZURE_TENANT_ID") ?? '';
const CLIENT_ID = Deno.env.get("AZURE_CLIENT_ID") ?? '';
const CLIENT_SECRET = Deno.env.get("AZURE_CLIENT_SECRET") ?? '';
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL_ADDRESS") ?? 'manasa@wagetrail.com';
const APP_URL = 'https://wagetrail.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getAccessToken() {
  const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to get access token: ${data.error_description || data.error}`);
  }
  return data.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, password } = await req.json();

    if (!email || !firstName || !password) {
      throw new Error("Missing required fields: email, firstName, password");
    }

    console.log(`Sending welcome email to: ${email}`);

    // ── Plain-text style HTML email (matching the Migrate Mate screenshot style) ──
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to WageTrail</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #ffffff; color: #222222; font-size: 15px; line-height: 1.6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 580px; border-collapse: collapse; background-color: #ffffff;">

          <!-- Body -->
          <tr>
            <td style="padding: 0 0 24px 0;">
              <p style="margin: 0 0 16px 0;">Hey ${firstName},</p>

              <p style="margin: 0 0 20px 0;">
                Welcome to <strong>WageTrail</strong> — your account has been created successfully.
                You can now log in using the credentials below.
              </p>

              <!-- Credentials -->
              <p style="margin: 0 0 6px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 0 0 20px 0;"><strong>Password:</strong> ${password}</p>

              <p style="margin: 0 0 20px 0;">
                Log in here: <a href="${APP_URL}/login" style="color: #1a56db;">${APP_URL}/login</a>
                (remember to change your password after logging in to keep your account secure)
              </p>

              <p style="margin: 0 0 20px 0;">
                Do you have any feedback or questions? Just reply to this email — I read every message.
              </p>

              <p style="margin: 0 0 4px 0;"><strong>Manasa</strong></p>
              <p style="margin: 0; color: #555555; font-size: 14px;">Head of Growth &amp; User Strategy</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #e5e7eb; padding: 20px 0 0 0;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} WageTrail. All rights reserved.<br>
                You're receiving this because you just signed up at wagetrail.com.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const accessToken = await getAccessToken();

    const emailResponse = await fetch(
      `https://graph.microsoft.com/v1.0/users/${SENDER_EMAIL}/sendMail`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            subject: `Welcome to WageTrail — Your Login Credentials`,
            body: { contentType: 'HTML', content: htmlContent },
            toRecipients: [{ emailAddress: { address: email } }],
            from: {
              emailAddress: {
                address: SENDER_EMAIL,
                name: 'Manasa from WageTrail',
              },
            },
          },
          saveToSentItems: true,
        }),
      }
    );

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('Microsoft Graph API error:', errorData);
      throw new Error(`Email sending failed: ${emailResponse.status} — ${errorData}`);
    }

    console.log(`Welcome email sent to ${email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Welcome email sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in send-welcome-email:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
