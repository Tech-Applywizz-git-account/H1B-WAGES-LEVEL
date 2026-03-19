// reset-password-final
// stateless: verifies the 'reset_password' token, then updates the user's password in auth.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OTP_SECRET = SUPABASE_SERVICE_ROLE_KEY; // Using as signing secret

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
    const { email, token, newPassword } = await req.json();
    if (!email || !token || !newPassword) throw new Error("Missing required fields");

    // 1. Token Verification (Must be a 'reset_password' claimed token)
    const dotIdx = token.indexOf('.');
    const payloadB64 = token.slice(0, dotIdx);
    const receivedSig = token.slice(dotIdx + 1);
    const payloadStr = atob(payloadB64);
    const [tokenEmail, claim, expiry] = payloadStr.split(':');

    const expectedSig = await hmacSign(OTP_SECRET, payloadStr);
    if (!safeCompare(expectedSig, receivedSig)) throw new Error("Verification failed: Signature invalid");
    if (tokenEmail !== email || claim !== 'reset_password') throw new Error("Unauthorized request");
    if (Date.now() > parseInt(expiry, 10)) throw new Error("Reset session expired.");

    // 2. Perform Reset (Admin Update)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers();
    const user = existingUsers?.find((u: any) => u.email === email);

    if (!user) throw new Error("Account not found.");

    const { error: resetError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
      email_confirm: true,
    });

    if (resetError) throw resetError;

    return new Response(JSON.stringify({ success: true, message: "Password updated successfully" }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
