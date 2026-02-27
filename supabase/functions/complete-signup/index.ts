import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const { email, firstName, lastName, mobileNumber, countryCode, promoCode, experience } = await req.json();

        if (!email || !firstName || !lastName) {
            throw new Error("Missing required fields: email, firstName, lastName");
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Generate default password
        const password = `${firstName}@123`;

        // Check if user already exists in auth
        const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.find((u: any) => u.email === email);

        let userId: string;

        if (existingUser) {
            // Update existing user password
            await supabase.auth.admin.updateUserById(existingUser.id, {
                password,
                email_confirm: true,
            });
            userId = existingUser.id;
        } else {
            // Create new auth user (auto-confirmed, no email verification needed)
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
            });
            if (createError) throw createError;
            userId = newUser.user.id;
        }

        // Upsert profile
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                email,
                first_name: firstName,
                last_name: lastName,
                mobile_number: mobileNumber || '',
                country_code: countryCode || '+1',
                promo_code: promoCode || null,
                experience: experience || null,
                role: 'user',
                payment_status: 'pending',
            }, { onConflict: 'id' });

        if (profileError) throw profileError;

        return new Response(
            JSON.stringify({
                success: true,
                userId,
                password,
                message: "Account created successfully",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error('complete-signup error:', error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
