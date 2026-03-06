import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Azure AD credentials — updated
const TENANT_ID = Deno.env.get("AZURE_TENANT_ID") ?? '';
const CLIENT_ID = Deno.env.get("AZURE_CLIENT_ID") ?? '';
const CLIENT_SECRET = Deno.env.get("AZURE_CLIENT_SECRET") ?? '';
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL_ADDRESS") ?? 'manasa@wagetrail.com';
const APP_URL = Deno.env.get("APP_URL") ?? 'https://wagetrail.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get Microsoft Graph API access token
async function getAccessToken() {
  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
    console.error("❌ CRITICAL: Azure secrets are missing. Email cannot be sent.");
    return null;
  }

  const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

  const params = new URLSearchParams({
    client_id: CLIENT_ID || '',
    client_secret: CLIENT_SECRET || '',
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  });

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to get access token:", data);
      return null;
    }

    return data.access_token;
  } catch (err) {
    console.error("Error fetching access token:", err);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      to,
      firstName,
      lastName,
      transactionId,
      orderId,
      timeOfPayment,
      amount,
      currency,
      password,
    } = await req.json();

    if (!to || !firstName || !transactionId) {
      throw new Error("Missing required fields");
    }

    console.log(`Sending email to: ${to}`);

    // Format the payment date
    const paymentDate = new Date(timeOfPayment).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Create HTML email template — plain style (matching brand tone)
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmed — WageTrail</title>
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
                Great news — your payment was successful and your WageTrail account is now active!
              </p>

              <!-- Transaction details -->
              <p style="margin: 0 0 6px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
              <p style="margin: 0 0 6px 0;"><strong>Order ID:</strong> ${orderId}</p>
              <p style="margin: 0 0 6px 0;"><strong>Amount Paid:</strong> ${currency} ${amount}</p>
              <p style="margin: 0 0 20px 0;"><strong>Payment Date:</strong> ${paymentDate}</p>

              <!-- Login credentials -->
              <p style="margin: 0 0 6px 0;"><strong>Email:</strong> ${to}</p>
              <p style="margin: 0 0 20px 0;"><strong>Password:</strong> ${password}</p>

              <p style="margin: 0 0 20px 0;">
                Log in here: <a href="${APP_URL}/login" style="color: #1a56db;">${APP_URL}/login</a>
                (remember to change your password after logging in to keep your account secure)
              </p>

              <p style="margin: 0 0 20px 0;">
                You now have full access to 500,000+ verified H-1B sponsoring jobs — including OPT/CPT, TN, E-3, J-1 &amp; Green Card opportunities. Start exploring today!
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
                &copy; ${new Date().getFullYear()} WageTrail. All rights reserved.<br>
                You're receiving this because you just subscribed at wagetrail.com.
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

    // Get access token
    const accessToken = await getAccessToken();

    if (!accessToken) {
      console.warn("⚠️ Skipping email delivery - Microsoft Graph credentials not configured.");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment recorded. Note: Welcome email skipped (missing server configuration).",
          warning: "Missing MS Graph credentials"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Send email using Microsoft Graph API
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
            subject: 'Welcome to WageTrail — Your Account is Active! 🎉',
            body: {
              contentType: 'HTML',
              content: htmlContent,
            },
            toRecipients: [
              {
                emailAddress: {
                  address: to,
                },
              },
            ],
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
      // We still return success: true because the payment WAS successful.
      // The email failure shouldn't stop the user's dashboard access.
      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment successful. Email delivery failed (account is active).",
          log: errorData
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Email sent successfully to ${to}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Error in send-email function:', error);
    // CRITICAL: Even if the email function crashes, we don't want to return 400
    // to the capture function because that might make the capture function think
    // the payment capture itself failed.
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        tip: "Check your Azure/Graph API configuration in Supabase Secrets."
      }),
      {
        status: 200, // Return 200 so the caller (capture-paypal-order) doesn't treat it as a hard crash
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
