import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const RAZORPAY_KEY_ID = 'rzp_live_SCjkNy569aq6F2'
    const RAZORPAY_KEY_SECRET = 'a4iIyEwCHMDuWTrn2KVAgWGS'

    const body = await req.json()
    const razorpayEvent = body.event

    console.log(`🔔 Received Razorpay Event: ${razorpayEvent}`)

    // Handle Payment Failed
    if (razorpayEvent === 'payment.failed') {
      const payment = body.payload.payment.entity
      const email = payment.email
      const paymentId = payment.id // This is the Transaction ID
      const errorCode = payment.error_code
      const errorDesc = payment.error_description

      console.log(`❌ Payment Failed for ${email}. ID: ${paymentId}`)

      if (email) {
        // Find user by email and update status
        const { data, error } = await supabaseClient
          .from('profiles')
          .update({ 
            payment_status: 'failed', 
            transaction_id: paymentId 
          })
          .eq('email', email)

        if (error) throw error

        // Also log to attempt history
        await supabaseClient.from('payment_attempts').insert([{
           status: 'failed',
           error_message: `${errorCode}: ${errorDesc}`,
           transaction_id: paymentId,
           email_logged: email
        }])
      }
    }

    // Handle Payment Captured (Success)
    // Even though your capture function handles this, it's good to have a backup
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
