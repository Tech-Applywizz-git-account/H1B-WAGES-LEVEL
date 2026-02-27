import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // 1. ALWAYS handle CORS first
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { amount, currency } = await req.json()

        // Detect environment mode
        const clientId = Deno.env.get('PAYPAL_CLIENT_ID')
        const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')
        const mode = Deno.env.get('PAYPAL_MODE') || 'sandbox'
        const baseUrl = mode === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com'

        // 2. PayPal Authentication
        const auth = btoa(`${clientId}:${clientSecret}`)
        const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        })

        const tokenData = await tokenResponse.json()

        if (!tokenResponse.ok) {
            console.error("PayPal Auth Error Details:", tokenData);
            return new Response(JSON.stringify({
                error: `PayPal Authentication Failed. Root cause: ${tokenData.error_description || tokenData.error || 'Invalid Keys'}`
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200, // Force 200 so we can show this specific message on screen
            })
        }

        const access_token = tokenData.access_token

        // 3. Create PayPal Order
        const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: currency || 'USD',
                        value: amount || '39.99'
                    }
                }],
            }),
        })

        const orderData = await orderResponse.json()

        if (!orderResponse.ok) {
            return new Response(JSON.stringify({
                error: `PayPal Order Creation Failed: ${orderData.message || 'Unknown error'}`
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        return new Response(JSON.stringify(orderData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error('Final Catch-all Error:', error)
        return new Response(JSON.stringify({ error: `Function Crash: ${error.message}` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    }
})
