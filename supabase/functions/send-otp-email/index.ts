// send-otp-email — stateless approach:
// Generates OTP, signs it as a HMAC token, sends email, returns token to client.
// No database table needed.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TENANT_ID = Deno.env.get("AZURE_TENANT_ID");
const CLIENT_ID = Deno.env.get("AZURE_CLIENT_ID");
const CLIENT_SECRET = Deno.env.get("AZURE_CLIENT_SECRET");
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL_ADDRESS");
// Use service role key as HMAC signing secret (already available in all edge functions)
const OTP_SECRET = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "fallback-secret-change-me";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hmacSign(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function getAccessToken() {
  const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    client_id: CLIENT_ID || '',
    client_secret: CLIENT_SECRET || '',
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Token error: ${data.error_description || data.error}`);
  return data.access_token;
}

// ── Handler ───────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { email } = await req.json();
    if (!email) throw new Error("Email is required");

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    const payload = `${email}:${otp}:${expiresAt}`;
    const signature = await hmacSign(OTP_SECRET, payload);

    // Token = base64(payload) + "." + signature
    const token = btoa(payload) + "." + signature;

    // Send OTP email via Microsoft Graph
    const accessToken = await getAccessToken();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f4f4f4;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr><td align="center" style="padding:40px 0;">
      <table role="presentation" style="width:550px;border-collapse:collapse;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.12);">

        <tr>
          <td style="background:linear-gradient(135deg,#24385E 0%,#1a6abf 100%);padding:36px 30px;text-align:center;">
            <div>
              <span style="color:#fff;font-size:26px;font-weight:900;">H1-B</span>
              <span style="color:#FDB913;font-size:26px;font-weight:900;"> WageLevel</span>
            </div>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">Email Verification Code</p>
          </td>
        </tr>

        <tr>
          <td style="padding:44px 30px;text-align:center;">
            <h2 style="margin:0 0 12px;color:#24385E;font-size:22px;font-weight:800;">Your verification code</h2>
            <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;">
              Enter this code on the signup page to verify your email address.
            </p>
            <div style="background:#f0f5ff;border:2px dashed #c7d7f5;border-radius:16px;padding:34px 20px;margin:0 auto 32px;max-width:280px;">
              <span style="font-size:52px;font-weight:900;color:#24385E;letter-spacing:18px;font-family:'Courier New',monospace;">${otp}</span>
            </div>
            <p style="margin:0 0 6px;color:#9ca3af;font-size:13px;">⏰ Expires in <strong>10 minutes</strong></p>
            <p style="margin:0;color:#9ca3af;font-size:13px;">Didn't request this? You can safely ignore this email.</p>
          </td>
        </tr>

        <tr>
          <td style="background:#f9fafb;padding:20px 30px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              © ${new Date().getFullYear()} H1B WageLevel · Automated email — do not reply
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const emailRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${SENDER_EMAIL}/sendMail`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            subject: `${otp} — Your H1B WageLevel verification code`,
            body: { contentType: 'HTML', content: htmlContent },
            toRecipients: [{ emailAddress: { address: email } }],
          },
          saveToSentItems: false,
        }),
      }
    );

    if (!emailRes.ok) {
      const err = await emailRes.text();
      throw new Error(`Email failed: ${emailRes.status} — ${err}`);
    }

    // Return token to client (NO otp in response — client doesn't see it)
    return new Response(
      JSON.stringify({ success: true, token }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('send-otp-email error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
