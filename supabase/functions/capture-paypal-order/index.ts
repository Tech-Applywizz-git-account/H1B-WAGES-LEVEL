import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { orderId, email, firstName, lastName, mobileNumber, countryCode } = await req.json()

        // Get PayPal access token
        const auth = btoa(`${Deno.env.get('PAYPAL_CLIENT_ID')}:${Deno.env.get('PAYPAL_CLIENT_SECRET')}`)
        const tokenResponse = await fetch(`${Deno.env.get('PAYPAL_MODE') === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        })

        const { access_token } = await tokenResponse.json()

        // Capture payment
        const captureResponse = await fetch(`${Deno.env.get('PAYPAL_MODE') === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
        })

        const captureData = await captureResponse.json()

        if (captureData.status === 'COMPLETED') {
            const supabase = createClient(
                Deno.env.get('DB_URL') ?? '',
                Deno.env.get('DB_SERVICE_ROLE_KEY') ?? ''
            )

            // 1. Record payment
            const { error: paymentError } = await supabase.from('payment_details').insert([
                {
                    email,
                    transaction_id: captureData.purchase_units[0].payments.captures[0].id,
                    order_id: orderId,
                    time_of_payment: new Date().toISOString(),
                    amount: parseFloat(captureData.purchase_units[0].payments.captures[0].amount.value),
                    currency: captureData.purchase_units[0].payments.captures[0].amount.currency_code,
                    status: 'COMPLETED',
                    metadata: captureData
                }
            ])

            if (paymentError) throw paymentError

            // 2. Create Auth User FIRST (to get the UUID)
            const userPassword = `${firstName.toLowerCase()}@123`
            let userIdValue = null;

            // Check if user already exists
            const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
            const existingUser = existingUsers?.users.find(u => u.email === email);

            if (existingUser) {
                userIdValue = existingUser.id;
                console.log('User already exists, updating existing profile for UUID:', userIdValue);
            } else {
                const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                    email,
                    password: userPassword,
                    email_confirm: true,
                    user_metadata: { firstName, lastName }
                })

                if (authError) {
                    console.error('Error creating auth user:', authError);
                    // If creation fails but user might exist (race condition), try to fetch again
                    throw authError;
                }
                userIdValue = authUser.user.id;
            }

            // 3. Create/Update Profile with 30 days subscription
            const subscriptionEndDate = new Date()
            subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30)

            const { error: profileError } = await supabase.from('profiles').upsert({
                id: userIdValue, // CRITICAL: Link to Auth UUID
                email,
                first_name: firstName,
                last_name: lastName,
                mobile_number: mobileNumber,
                country_code: countryCode,
                payment_status: 'paid',
                role: 'user',
                subscription_end_date: subscriptionEndDate.toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' })

            if (profileError) throw profileError

            // Note: If user exists, we might get an error, but that's okay for now

            // 4. Send Welcome Email
            try {
                await fetch(`${Deno.env.get('DB_URL')}/functions/v1/send-email`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${Deno.env.get('DB_ANON_KEY')}`
                    },
                    body: JSON.stringify({
                        to: email,
                        firstName,
                        lastName,
                        transactionId: captureData.purchase_units[0].payments.captures[0].id,
                        orderId: orderId,
                        timeOfPayment: new Date().toISOString(),
                        amount: captureData.purchase_units[0].payments.captures[0].amount.value,
                        currency: captureData.purchase_units[0].payments.captures[0].amount.currency_code,
                        password: userPassword
                    })
                })
            } catch (emailErr) {
                console.error('Error triggering email:', emailErr)
                // We don't throw here to ensure the user still gets a success response
            }

            return new Response(JSON.stringify({
                success: true,
                transactionId: captureData.purchase_units[0].payments.captures[0].id,
                orderId: orderId,
                amount: captureData.purchase_units[0].payments.captures[0].amount.value,
                currency: captureData.purchase_units[0].payments.captures[0].amount.currency_code,
                timeOfPayment: new Date().toISOString()
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        } else {
            throw new Error('Payment was not completed successfully')
        }
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
