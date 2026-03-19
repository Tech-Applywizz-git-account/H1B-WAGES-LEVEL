// verify-password-reset-otp
// stateless: verifies HMAC token + OTP, returns a NEW token that authorizes the final reset.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OTP_SECRET = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "fallback-secret-change-me";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function hmacSign(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { email, otp, token } = await req.json();
    if (!email || !otp || !token) throw new Error("Missing required fields");

    const dotIdx = token.indexOf('.');
    const payloadB64 = token.slice(0, dotIdx);
    const receivedSig = token.slice(dotIdx + 1);
    let payloadStr: string;
    try { payloadStr = atob(payloadB64); } catch { throw new Error("Invalid token"); }
    const parts = payloadStr.split(':');
    if (parts.length !== 3) throw new Error("Invalid structure");
    const [tokenEmail, tokenOtp, tokenExpiry] = parts;

    // 1. Signature check
    const expectedSig = await hmacSign(OTP_SECRET, payloadStr);
    if (!safeCompare(expectedSig, receivedSig)) throw new Error("Verification failed: Signature invalid");

    // 2. Email check
    if (tokenEmail !== email) throw new Error("Verification failed: Email mismatch");

    // 3. OTP check
    if (tokenOtp !== otp) throw new Error("Corrected code: Incorrect code. Please try again.");

    // 4. Expiry check
    if (Date.now() > parseInt(tokenExpiry, 10)) throw new Error("Code expired.");

    // 5. Success -> Return a NEW token that specifically allows 'reset_password' action
    const newPayload = `${email}:reset_password:${Date.now() + 10 * 60 * 1000}`; // Good for another 10 min
    const newSignature = await hmacSign(OTP_SECRET, newPayload);
    const newToken = btoa(newPayload) + "." + newSignature;

    return new Response(JSON.stringify({ success: true, token: newToken }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
