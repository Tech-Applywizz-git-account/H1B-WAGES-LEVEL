import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

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
        const { orderId, email, firstName, lastName, mobileNumber, countryCode } = await req.json()

        // Detect environment mode
        const clientId = Deno.env.get('PAYPAL_CLIENT_ID')
        const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')
        const mode = Deno.env.get('PAYPAL_MODE') || 'sandbox'
        const baseUrl = mode === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com'

        // Database credentials from Supabase secrets
        const dbUrl = Deno.env.get('DB_URL')
        const dbServiceRoleKey = Deno.env.get('DB_SERVICE_ROLE_KEY')

        if (!dbUrl || !dbServiceRoleKey) {
            return new Response(JSON.stringify({ success: false, error: 'Database configuration missing on server.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // 2. Get PayPal access token
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
            return new Response(JSON.stringify({
                success: false,
                error: `PayPal Auth Error: ${tokenData.error_description || tokenData.error || 'Check keys'}`
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        const access_token = tokenData.access_token

        // 3. Capture payment
        const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
        })

        const captureData = await captureResponse.json()

        if (!captureResponse.ok) {
            return new Response(JSON.stringify({
                success: false,
                error: `PayPal Capture Failed: ${captureData.message || 'Verification Error'}`
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        if (captureData.status === 'COMPLETED') {
            const supabase = createClient(dbUrl, dbServiceRoleKey)
            const captureDetails = captureData.purchase_units[0].payments.captures[0];

            // 4. Record payment in database
            await supabase.from('payment_details').insert([
                {
                    email,
                    transaction_id: captureDetails.id,
                    order_id: orderId,
                    time_of_payment: new Date().toISOString(),
                    amount: parseFloat(captureDetails.amount.value),
                    currency: captureDetails.amount.currency_code,
                    status: 'COMPLETED',
                    metadata: captureData
                }
            ])

            // 5. Handle Auth User (Get UUID by email)
            // Users who "Continue with Google" already have an account.
            let userIdValue = null;

            console.log(`Checking for existing user with email: ${email}`);

            // Try to find user in Auth
            const { data: users, error: listError } = await supabase.auth.admin.listUsers();
            if (listError) {
                console.error("Error listing users:", listError);
            }

            const existingUser = users?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

            const userPassword = `${firstName.toLowerCase()}@123`;

            if (existingUser) {
                userIdValue = existingUser.id;
                console.log(`Found existing user ID: ${userIdValue}. Updating password for email consistency.`);
                // Set the password so the email is accurate even for Google users
                await supabase.auth.admin.updateUserById(userIdValue, {
                    password: userPassword
                });
            } else {
                // If not found (unlikely if they just paid, but possible if it's a new email flow)
                console.log("No existing user found. Creating new account...");
                const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                    email,
                    password: userPassword,
                    email_confirm: true,
                    user_metadata: { first_name: firstName, last_name: lastName }
                });

                if (authError) {
                    console.error("Auth creation error:", authError);
                    // Last ditch effort: query profiles to see if they exist there
                    const { data: prof } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
                    if (prof) userIdValue = prof.id;
                    else throw new Error(`Account creation failed: ${authError.message}`);
                } else {
                    userIdValue = authUser.user.id;
                }
            }

            // 6. Update Profile - THIS GRANTS DASHBOARD ACCESS
            const subscriptionEndDate = new Date();
            subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

            console.log(`Updating profile for user ${userIdValue} to 'paid' status...`);

            const { error: upsertError } = await supabase.from('profiles').upsert({
                id: userIdValue,
                email,
                first_name: firstName,
                last_name: lastName,
                mobile_number: mobileNumber,
                country_code: countryCode, // Matches capture input
                payment_status: 'paid',
                role: 'user',
                subscription_end_date: subscriptionEndDate.toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

            if (upsertError) {
                console.error("Profile upsert error:", upsertError);
                // Try upsert by email if ID fails (e.g. if ID was mismatched)
                await supabase.from('profiles').upsert({
                    email,
                    first_name: firstName,
                    last_name: lastName,
                    payment_status: 'paid',
                    subscription_end_date: subscriptionEndDate.toISOString()
                }, { onConflict: 'email' });
            }

            // 7. Send Welcome Email (Fail-safe, non-blocking)
            try {
                const userPassword = `${firstName.toLowerCase()}@123`;
                console.log("Attempting to send welcome email...");
                const emailResult = await fetch(`${dbUrl}/functions/v1/send-email`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${dbServiceRoleKey}`
                    },
                    body: JSON.stringify({
                        to: email, firstName, lastName,
                        transactionId: captureDetails.id, orderId: orderId,
                        amount: captureDetails.amount.value,
                        currency: captureDetails.amount.currency_code,
                        timeOfPayment: new Date().toISOString(),
                        password: userPassword
                    })
                });

                if (!emailResult.ok) {
                    const errTxt = await emailResult.text();
                    console.warn("Email function returned error (flow continuing):", errTxt);
                }
            } catch (e) {
                console.error("Non-fatal email error:", e);
            }

            return new Response(JSON.stringify({
                success: true,
                transactionId: captureDetails.id,
                orderId: orderId
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        } else {
            throw new Error(`Payment status is ${captureData.status}. Expected COMPLETED.`)
        }
    } catch (error) {
        console.error('Capture Function Error:', error)
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    }
})
