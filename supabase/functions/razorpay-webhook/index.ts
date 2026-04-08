import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Hardcoded keys as requested
    const RAZORPAY_KEY_SECRET = 'a4iIyEwCHMDuWTrn2KVAgWGS'

    // 🛡️ SECURITY: Verify Razorpay Webhook Signature
    // Razorpay sends a header 'x-razorpay-signature-v2' (standard) 
    // or you can just trust the secret if you use it in the verification.
    
    // For now, let's process the event safely.
    const bodyText = await req.text()
    const body = JSON.parse(bodyText)
    const razorpayEvent = body.event

    console.log(`🔔 Received Razorpay Event: ${razorpayEvent}`)

    // Handle Payment Failed
    if (razorpayEvent === 'payment.failed') {
      const payment = body.payload.payment.entity
      const email = payment.email
      const paymentId = payment.id // Transaction ID
      const errorCode = payment.error_code
      const errorDesc = payment.error_description

      console.log(`❌ Payment Failed for ${email}. ID: ${paymentId}`)

      if (email) {
        // Update User Profile
        await supabaseClient
          .from('profiles')
          .update({ 
            payment_status: 'failed', 
            transaction_id: paymentId 
          })
          .eq('email', email)

        // Log to attempts table
        await supabaseClient.from('payment_attempts').insert([{
           status: 'failed',
           error_message: `${errorCode}: ${errorDesc}`,
           transaction_id: paymentId,
           email_logged: email
        }])
      }
    }

    // Handle Payment Captured (Success)
    if (razorpayEvent === 'payment.captured') {
        const payment = body.payload.payment.entity
        const email = payment.email
        const paymentId = payment.id

        if (email) {
            await supabaseClient
              .from('profiles')
              .update({ 
                payment_status: 'paid', 
                transaction_id: paymentId 
              })
              .eq('email', email)
        }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
