import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Azure AD credentials from Environment Variables (same as send-email function)
const TENANT_ID = Deno.env.get("AZURE_TENANT_ID");
const CLIENT_ID = Deno.env.get("AZURE_CLIENT_ID");
const CLIENT_SECRET = Deno.env.get("AZURE_CLIENT_SECRET");
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL_ADDRESS");
const APP_URL = Deno.env.get("APP_URL") || "https://teluguwalalinks.com";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getAccessToken() {
    const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
        client_id: CLIENT_ID || '',
        client_secret: CLIENT_SECRET || '',
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

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to H1B Wage Level</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.12);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #24385E 0%, #1a6abf 100%); padding: 40px 30px; text-align: center;">
              <div style="display: inline-block; background: rgba(255,255,255,0.15); border-radius: 12px; padding: 10px 20px; margin-bottom: 12px;">
                <span style="color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">H1-B</span>
                <span style="color: #FDB913; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;"> WageLevel</span>
              </div>
              <p style="margin: 8px 0 0; color: #FDB913; font-size: 18px; font-weight: 700;">Account Created Successfully! 🎉</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 16px; color: #24385E; font-size: 22px; font-weight: 800;">Welcome, ${firstName}!</h2>

              <p style="margin: 0 0 20px; color: #4b5563; font-size: 15px; line-height: 1.7;">
                Your H1B WageLevel account has been created. You can now log in with your credentials below.
              </p>

              <!-- Credentials box -->
              <div style="background: #f0f7ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px; color: #24385E; font-size: 16px; font-weight: 700;">🔐 Your Login Credentials</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px;">Email:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 700;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Password:</td>
                    <td style="padding: 8px 0;">
                      <span style="background: #24385E; color: #FDB913; padding: 4px 12px; border-radius: 6px; font-size: 14px; font-weight: 800; font-family: monospace; letter-spacing: 1px;">${password}</span>
                    </td>
                  </tr>
                </table>
                <p style="margin: 16px 0 0; color: #dc2626; font-size: 13px;">
                  ⚠️ Please change your password after logging in for security.
                </p>
              </div>

              <!-- Access notice -->
              <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>🚀 Next step:</strong> Log in and complete your payment to get full access to 500,000+ verified H-1B sponsoring jobs.
                </p>
              </div>

              <!-- CTA -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${APP_URL}/login" style="display: inline-block; background: #FDB913; color: #24385E; text-decoration: none; padding: 14px 40px; border-radius: 12px; font-size: 16px; font-weight: 800; box-shadow: 0 4px 12px rgba(253,185,19,0.4);">
                  Log In to Dashboard →
                </a>
              </div>

              <p style="margin: 24px 0 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                Best regards,<br>
                <strong style="color: #24385E;">The H1B WageLevel Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} H1B WageLevel. All rights reserved.<br>
                This is an automated email. Please do not reply.
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
                        subject: `Welcome to H1B WageLevel — Your Login Credentials`,
                        body: { contentType: 'HTML', content: htmlContent },
                        toRecipients: [{ emailAddress: { address: email } }],
                    },
                    saveToSentItems: true,
                }),
            }
        );

        if (!emailResponse.ok) {
            const errorData = await emailResponse.text();
            console.error('Microsoft Graph API error:', errorData);
            throw new Error(`Email sending failed: ${emailResponse.status}`);
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
