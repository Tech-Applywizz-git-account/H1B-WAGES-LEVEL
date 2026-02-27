import React, { useState, useEffect } from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { supabase } from '../supabaseClient';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const PaypalButton = ({ amount = import.meta.env.VITE_PAYMENT_AMOUNT || "30.00", onSuccess }) => {
    const { user, firstName, lastName, refresh } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const createOrder = async () => {
        try {
            setError(null);
            console.log("🚀 Initializing PayPal payment...");

            const { data, error: invokeError } = await supabase.functions.invoke('create-paypal-order', {
                body: { amount, currency: 'USD' }
            });

            if (invokeError) {
                console.error("❌ Network error calling function:", invokeError);
                throw new Error("Unable to connect to payment server. Please check your internet.");
            }

            // Check if the backend returned an application-level error
            if (data?.error) {
                console.error("❌ PayPal API Error:", data.error);
                throw new Error(data.error);
            }

            if (!data?.id) {
                console.error("❌ Missing Order ID in response:", data);
                throw new Error("Payment service did not return an order ID.");
            }

            console.log("✅ Order created successfully:", data.id);
            return data.id;
        } catch (err) {
            console.error("❌ createOrder failed:", err);
            setError(err.message);
            return null;
        }
    };

    const onApprove = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const meta = user?.user_metadata || {};

            const { data: captureData, error: captureError } = await supabase.functions.invoke('capture-paypal-order', {
                body: {
                    orderId: data.orderID,
                    email: user?.email,
                    firstName: firstName || meta.first_name || meta.firstName || 'User',
                    lastName: lastName || meta.last_name || meta.lastName || '',
                    mobileNumber: meta.mobile_number || meta.mobileNumber || '',
                    countryCode: meta.country_code || meta.countryCode || '+1'
                }
            });

            if (captureError || captureData?.error) {
                throw new Error(captureError?.message || captureData?.error || "Payment verification failed.");
            }

            if (captureData?.success) {
                setSuccess(true);
                if (refresh) await refresh();
                if (onSuccess) onSuccess(captureData);
            } else {
                throw new Error("Payment could not be verified.");
            }
        } catch (err) {
            console.error("❌ onApprove failed:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Auto-redirect to dashboard after 3 seconds on success
    useEffect(() => {
        let redirectTimeout;
        if (success) {
            redirectTimeout = setTimeout(() => {
                window.location.href = '/app';
            }, 3000);
        }
        return () => clearTimeout(redirectTimeout);
    }, [success]);

    if (success) {
        return (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                        <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                </div>
                <h3 className="text-2xl font-black text-emerald-900 mb-2">Payment Successful!</h3>
                <p className="text-emerald-700 font-bold mb-6">Your account has been upgraded. Redirecting you to the dashboard...</p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => window.location.href = '/app'}
                        className="px-8 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all transform hover:scale-105"
                    >
                        Enter Dashboard Now →
                    </button>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest animate-pulse">
                        Redirecting in 3 seconds...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-start gap-3 animate-in slide-in-from-top-2 shadow-sm">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-1">Payment System Error</p>
                        <p className="text-sm text-red-600 font-bold">{error}</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <Loader2 className="w-12 h-12 text-[#24385E] animate-spin mb-4" />
                    <p className="text-[#24385E] font-black text-lg">Verifying Payment...</p>
                    <p className="text-gray-400 text-sm mt-1 font-bold">Please do not close this window</p>
                </div>
            ) : (
                <PayPalButtons
                    style={{
                        layout: "vertical",
                        shape: "rect",
                        label: "pay",
                        color: "gold",
                        height: 52
                    }}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    disabled={loading}
                />
            )}
        </div>
    );
};

export default PaypalButton;
