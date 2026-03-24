import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Razorpay from "npm:razorpay@2.9.2"

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

        const key_id = Deno.env.get('RAZORPAY_KEY_ID') || 'rzp_live_SCjkNy569aq6F2'
        const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET') || 'a4iIyEwCHMDuWTrn2KVAgWGS'

        if (!key_id || !key_secret) {
            return new Response(JSON.stringify({
                error: `Razorpay keys missing from server environment variables.`
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        const razorpay = new Razorpay({
            key_id,
            key_secret,
        })

        // Razorpay requires amount in subunits (e.g., paise for INR or cents for USD)
        // If amount is '39.99', we want 3999
        const amountInSubunits = Math.round(parseFloat(amount || '39.99') * 100);

        const options = {
            amount: amountInSubunits,
            currency: currency || 'USD',
            receipt: `receipt_order_${new Date().getTime()}`,
        }

        const order = await razorpay.orders.create(options)

        return new Response(JSON.stringify(order), {
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
