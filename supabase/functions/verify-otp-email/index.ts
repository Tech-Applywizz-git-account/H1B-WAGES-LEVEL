// verify-otp-email — stateless approach:
// Verifies the OTP against the HMAC token. No database lookup.

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
    // Constant-time comparison to prevent timing attacks
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const { email, otp, token } = await req.json();
        if (!email || !otp || !token) throw new Error("email, otp, and token are required");

        // Token = base64(payload) + "." + signature
        const dotIdx = token.indexOf('.');
        if (dotIdx === -1) throw new Error("Invalid token format");

        const payloadB64 = token.slice(0, dotIdx);
        const receivedSig = token.slice(dotIdx + 1);

        // Decode payload
        let payload: string;
        try {
            payload = atob(payloadB64);
        } catch {
            throw new Error("Invalid token");
        }

        const parts = payload.split(':');
        if (parts.length !== 3) throw new Error("Invalid token structure");

        const [tokenEmail, tokenOtp, tokenExpiry] = parts;

        // 1. Verify HMAC signature
        const expectedSig = await hmacSign(OTP_SECRET, payload);
        if (!safeCompare(expectedSig, receivedSig)) {
            return new Response(
                JSON.stringify({ success: false, error: "Invalid verification code." }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // 2. Check email matches
        if (tokenEmail !== email) {
            return new Response(
                JSON.stringify({ success: false, error: "Token email mismatch." }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // 3. Check OTP matches
        if (tokenOtp !== otp) {
            return new Response(
                JSON.stringify({ success: false, error: "Incorrect code. Please try again." }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // 4. Check expiry
        const expiresAt = parseInt(tokenExpiry, 10);
        if (Date.now() > expiresAt) {
            return new Response(
                JSON.stringify({ success: false, error: "Code expired. Please request a new one." }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ success: true, message: "OTP verified" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error('verify-otp-email error:', error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
