import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Azure AD credentials from Environment Variables
const TENANT_ID = Deno.env.get("AZURE_TENANT_ID");
const CLIENT_ID = Deno.env.get("AZURE_CLIENT_ID");
const CLIENT_SECRET = Deno.env.get("AZURE_CLIENT_SECRET");
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL_ADDRESS");
const APP_URL = Deno.env.get("APP_URL") || "https://teluguwalalinks.com";

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

    // Create HTML email template
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
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">H1B Wage Level</h1>
              <p style="margin: 10px 0 0 0; color: #fbbf24; font-size: 16px;">Payment Successful! 🎉</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 22px;">Dear ${firstName} ${lastName},</h2>
              
              <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Thank you for subscribing to H1B Wage Level! We're thrilled to have you on board. Your payment has been successfully processed, and your account is now active.
              </p>
              
              <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Transaction Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Transaction ID:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${transactionId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Order ID:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${orderId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount Paid:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${currency} ${amount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payment Date:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${paymentDate}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Your Login Credentials</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${to}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Password:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${password}</td>
                  </tr>
                </table>
                <p style="margin: 15px 0 0 0; color: #dc2626; font-size: 13px; font-style: italic;">
                  ⚠️ Please change your password after your first login for security purposes.
                </p>
              </div>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #fbbf24; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                  📧 <strong>Note:</strong> If you don't see this email in your inbox, please check your spam or junk mail folder.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}/login" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  Click Here to Login
                </a>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                You now have access to 500,000+ verified job openings including H-1B, OPT/CPT, TN, E-3, J-1 & Green Cards opportunities. Start exploring and find your dream job today!
              </p>
              
              <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                If you have any questions or need assistance, feel free to reach out to our support team.
              </p>
              
              <p style="margin: 30px 0 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Best regards,<br>
                <strong>The H1B Wage Level Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                © ${new Date().getFullYear()} H1B Wage Level. All rights reserved.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                This is an automated email. Please do not reply to this message.
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
            subject: 'Welcome to H1B Wage Level - Payment Successful! 🎉',
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
