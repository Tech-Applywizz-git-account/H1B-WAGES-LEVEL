// send-password-reset-otp
// stateless: signs OTP as HMAC token, sends email, returns token to client.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TENANT_ID = Deno.env.get("AZURE_TENANT_ID") ?? '';
const CLIENT_ID = Deno.env.get("AZURE_CLIENT_ID") ?? '';
const CLIENT_SECRET = Deno.env.get("AZURE_CLIENT_SECRET") ?? '';
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL_ADDRESS") ?? 'manasa@wagetrail.com';
const OTP_SECRET = SUPABASE_SERVICE_ROLE_KEY;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ... (helper functions same as before)
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
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
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

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { email } = await req.json();
    if (!email) throw new Error("Email is required");

    // ── Check if email exists in profiles table ───────────────────────────────
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();
    
    if (profileErr || !profile) {
        throw new Error("No account found with this email address.");
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    const payload = `${email}:${otp}:${expiresAt}`;
    const signature = await hmacSign(OTP_SECRET, payload);
    const token = btoa(payload) + "." + signature;

    const htmlContent = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
    <h2 style="color: #24385E; text-align: center;">Reset Your Password</h2>
    <p>Hello,</p>
    <p>You requested a password reset for your WageTrail account. Use the code below to complete the process:</p>
    <div style="background: #f0f5ff; border: 2px dashed #24385E; border-radius: 10px; padding: 20px; text-align: center; margin: 30px 0;">
      <span style="font-size: 40px; font-weight: 900; color: #24385E; letter-spacing: 10px;">${otp}</span>
    </div>
    <p>This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
    <p>Thanks,<br>Team WageTrail</p>
  </div>
</body>
</html>`;

    const accessToken = await getAccessToken();
    const emailRes = await fetch(`https://graph.microsoft.com/v1.0/users/${SENDER_EMAIL}/sendMail`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          subject: `${otp} — Password Reset Code for WageTrail`,
          body: { contentType: 'HTML', content: htmlContent },
          toRecipients: [{ emailAddress: { address: email } }],
        },
        saveToSentItems: true,
      }),
    });

    if (!emailRes.ok) throw new Error(`Email failed: ${emailRes.status}`);

    return new Response(JSON.stringify({ success: true, token }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
