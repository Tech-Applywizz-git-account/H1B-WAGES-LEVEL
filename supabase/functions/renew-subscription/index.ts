import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Azure AD credentials - Using environment variables for security
const TENANT_ID = Deno.env.get("AZURE_TENANT_ID");
const CLIENT_ID = Deno.env.get("AZURE_CLIENT_ID");
const CLIENT_SECRET = Deno.env.get("AZURE_CLIENT_SECRET");
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL_ADDRESS");

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getAccessToken() {
    const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
        client_id: CLIENT_ID || '',
        client_secret: CLIENT_SECRET || '',
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
    });

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Azure Token Error: ${data.error_description || data.error}`);
    return data.access_token;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const { to, firstName, transactionId, amount, currency, subscriptionEnd, timeOfPayment } = await req.json();

        const formatDate = (dateStr: string) => {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        };

        const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">H1B Wage Level</h1>
            <p style="color: #fbbf24; font-size: 18px; margin: 10px 0 0 0;">Subscription Renewed! 🎉</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <p style="font-size: 18px; color: #1f2937;">Hi ${firstName},</p>
            <p style="color: #4b5563; line-height: 1.6;">Your subscription has been successfully extended. You continue to have full access to all 500,000+ verified job listings.</p>
            
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px solid #f3f4f6;">
                <h3 style="margin-top: 0; color: #111827; font-size: 16px; border-bottom: 2px solid #fbbf24; padding-bottom: 8px; display: inline-block;">Renewal Details</h3>
                <table style="width: 100%; margin-top: 15px;">
                    <tr><td style="color: #6b7280; padding: 5px 0;">Transaction ID:</td><td style="text-align: right; font-weight: 600;">${transactionId}</td></tr>
                    <tr><td style="color: #6b7280; padding: 5px 0;">Amount:</td><td style="text-align: right; font-weight: 600;">${currency} ${amount}</td></tr>
                    <tr><td style="color: #6b7280; padding: 5px 0;">Next Expiry Date:</td><td style="text-align: right; font-weight: 600; color: #7c3aed;">${formatDate(subscriptionEnd)}</td></tr>
                </table>
            </div>

            <div style="text-align: center; margin-top: 35px;">
                <a href="${Deno.env.get('APP_URL') || 'http://localhost:5173'}/dashboard" style="background: #1e3a8a; color: #ffffff; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Go to Dashboard</a>
            </div>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 13px; color: #9ca3af;">
            &copy; ${new Date().getFullYear()} H1B Wage Level. All rights reserved.<br>
            Please do not reply to this automated email.
          </div>
        </div>`;

        const accessToken = await getAccessToken();
        const emailResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${SENDER_EMAIL}/sendMail`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: {
                    subject: 'Subscription Renewed Successfully - H1B Wage Level',
                    body: { contentType: 'HTML', content: htmlContent },
                    toRecipients: [{ emailAddress: { address: to } }],
                },
                saveToSentItems: false
            }),
        });

        if (!emailResponse.ok) throw new Error(`Graph API error: ${await emailResponse.text()}`);

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
