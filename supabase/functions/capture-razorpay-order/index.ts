import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

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
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency, email, firstName, lastName, mobileNumber, countryCode } = await req.json()

        const key_id = Deno.env.get('RAZORPAY_KEY_ID') || 'rzp_test_SCPRjZ63CrrTej'
        const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET') || '8888Eq6wBMqoiZoOgrBPQ7gD'
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('DB_URL')
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('DB_SERVICE_ROLE_KEY')

        if (!key_secret || !supabaseUrl || !supabaseKey) {
             return new Response(JSON.stringify({
                success: false,
                error: `Server configuration error: Required secrets are missing.`
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // Verify signature
        const msg = new TextEncoder().encode(razorpay_order_id + "|" + razorpay_payment_id)
        const key = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(key_secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        )
        const signatureBuffer = await crypto.subtle.sign("HMAC", key, msg)
        
        // Convert to hex
        const signatureArray = Array.from(new Uint8Array(signatureBuffer))
        const generated_signature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('')

        if (generated_signature !== razorpay_signature) {
             return new Response(JSON.stringify({
                success: false,
                error: "Invalid payment signature"
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        
        // Fetch full payment details from Razorpay to store as metadata (like PayPal)
        let rzpPaymentData = {};
        try {
            const auth = btoa(`${key_id}:${key_secret}`);
            const rzpResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${auth}`
                }
            });
            if (rzpResponse.ok) {
                rzpPaymentData = await rzpResponse.json();
            }
        } catch (fetchErr) {
            console.error("Failed to fetch Razorpay payment details:", fetchErr);
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        // Record payment in database
        try {
            await supabase.from('payment_details').insert([
                {
                    email,
                    transaction_id: razorpay_payment_id,
                    order_id: razorpay_order_id,
                    time_of_payment: new Date().toISOString(),
                    amount: parseFloat(amount),
                    currency: currency || "USD",
                    status: 'COMPLETED',
                    metadata: {
                        payer: {
                            name: {
                                given_name: firstName || "User",
                                surname: lastName || ""
                            },
                            email_address: email,
                            payer_id: rzpPaymentData?.contact || mobileNumber || "razorpay_user"
                        },
                        status: "COMPLETED",
                        purchase_units: [
                            {
                                payments: {
                                    captures: [
                                        {
                                            id: razorpay_payment_id,
                                            amount: {
                                                value: amount.toString(),
                                                currency_code: currency || "USD"
                                            },
                                            status: "COMPLETED",
                                            create_time: new Date().toISOString(),
                                            update_time: new Date().toISOString()
                                        }
                                    ]
                                },
                                reference_id: razorpay_order_id
                            }
                        ],
                        // Preserving explicit razorpay raw data just in case
                        payment_gateway: 'razorpay',
                        razorpay_raw_data: rzpPaymentData
                    }
                }
            ])
        } catch (dbErr) {
            console.error("Database error recording payment:", dbErr);
        }

        // Handle Auth User
        let userIdValue = null;
        const userPassword = `${(firstName || 'User').toLowerCase()}@123`;

        try {
            const { data: users } = await supabase.auth.admin.listUsers();
            const existingUser = users?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

            if (existingUser) {
                userIdValue = existingUser.id;
            } else {
                const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                    email,
                    password: userPassword,
                    email_confirm: true,
                    user_metadata: { first_name: firstName, last_name: lastName }
                });
                if (!authError && authUser.user) {
                    userIdValue = authUser.user.id;
                }
            }
        } catch (authErr) {
            console.error("Auth management error:", authErr);
        }

        if (!userIdValue) {
            const { data: prof } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
            if (prof) userIdValue = prof.id;
        }

        // Update Profile
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

        if (userIdValue) {
            await supabase.from('profiles').upsert({
                id: userIdValue,
                email,
                first_name: firstName,
                last_name: lastName,
                mobile_number: mobileNumber,
                country_code: countryCode,
                payment_status: 'paid',
                role: 'user',
                subscription_end_date: subscriptionEndDate.toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
        } else {
            await supabase.from('profiles').upsert({
                email,
                first_name: firstName,
                last_name: lastName,
                payment_status: 'paid',
                subscription_end_date: subscriptionEndDate.toISOString()
            }, { onConflict: 'email' });
        }

        return new Response(JSON.stringify({
            success: true,
            transactionId: razorpay_payment_id,
            orderId: razorpay_order_id
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        console.error('Capture Function Error:', error)
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    }
})
