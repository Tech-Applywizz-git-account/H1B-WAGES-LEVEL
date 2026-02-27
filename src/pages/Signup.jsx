import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Star, CheckCircle } from 'lucide-react';

const Signup = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        countryCode: '+1', // Default to US
        promoCode: ''
    });
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Country codes
    const countryCodes = [
        { code: '+1', country: 'US' },
        { code: '+44', country: 'UK' },
        { code: '+91', country: 'India' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate form
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.mobileNumber) {
                throw new Error('Please fill in all required fields');
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                throw new Error('Please enter a valid email address');
            }

            // Move to payment step (profile will be created after successful payment)
            setStep(2);
        } catch (err) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const [paypalLoading, setPaypalLoading] = useState(true);
    const [paypalReady, setPaypalReady] = useState(false);

    // Load PayPal SDK
    useEffect(() => {
        if (step === 2) {
            const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

            if (!clientId) {
                setError('PayPal Client ID is not configured. Please contact support.');
                setPaypalLoading(false);
                return;
            }

            // Check if PayPal already loaded
            if (window.paypal) {
                console.log('PayPal SDK already loaded');
                setPaypalReady(true);
                setPaypalLoading(false);
                return;
            }

            // Check if script already exists
            const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
            if (existingScript) {
                // Wait for it to load
                existingScript.addEventListener('load', () => {
                    setPaypalReady(true);
                    setPaypalLoading(false);
                });
                return;
            }

            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
            script.async = true;

            script.onload = () => {
                console.log('PayPal SDK loaded successfully');
                setPaypalReady(true);
                setPaypalLoading(false);
            };

            script.onerror = (err) => {
                console.error('Failed to load PayPal SDK:', err);
                setPaypalLoading(false);
                setError('Failed to load PayPal. Please check your internet connection and try again.');
            };

            document.body.appendChild(script);
        }
    }, [step]);

    // Render PayPal buttons when SDK is ready
    useEffect(() => {
        if (paypalReady && step === 2) {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                renderPayPalButtons();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [paypalReady, step]);

    const renderPayPalButtons = () => {
        if (window.paypal && document.getElementById('paypal-button-container')) {
            window.paypal.Buttons({
                createOrder: async () => {
                    try {
                        console.log('Creating PayPal order...');
                        const response = await fetch(
                            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-paypal-order`,
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                                },
                                body: JSON.stringify({
                                    amount: '30.00',
                                    currency: 'USD'
                                })
                            }
                        );

                        console.log('Response status:', response.status);
                        const data = await response.json();
                        console.log('Response data:', data);

                        if (data.id) {
                            console.log('Order created successfully:', data.id);
                            return data.id;
                        } else {
                            throw new Error(data.error || 'Failed to create order');
                        }
                    } catch (error) {
                        console.error('Error creating order:', error);
                        setError(`Failed to create payment order: ${error.message}`);
                        throw error;
                    }
                },
                onApprove: async (data) => {
                    try {
                        console.log('Payment approved, capturing order:', data.orderID);
                        setLoading(true);
                        setError('');

                        const response = await fetch(
                            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capture-paypal-order`,
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                                },
                                body: JSON.stringify({
                                    orderId: data.orderID,
                                    email: formData.email,
                                    firstName: formData.firstName,
                                    lastName: formData.lastName,
                                    mobileNumber: formData.mobileNumber,
                                    countryCode: formData.countryCode,
                                    promoCode: formData.promoCode
                                })
                            }
                        );

                        console.log('Capture response status:', response.status);
                        const result = await response.json();
                        console.log('Capture result:', result);

                        if (result.success) {
                            console.log('Payment captured successfully!');
                            setPaymentData(result);
                            setStep(3); // Move to success page
                        } else {
                            throw new Error(result.error || 'Payment capture failed');
                        }
                    } catch (error) {
                        console.error('Error capturing payment:', error);
                        setError(`Payment processing failed: ${error.message}`);
                    } finally {
                        setLoading(false);
                    }
                },
                onError: (err) => {
                    console.error('PayPal error:', err);
                    setError(`Payment failed: ${err.message || 'Unknown error. Please try again.'}`);
                }
            }).render('#paypal-button-container');
        }
    };

    return (
        <div className="min-h-screen bg-[#24385E] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FDB913]/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3"></div>
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#FDB913]/5 rounded-full"></div>

            <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 md:p-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 group">
                        <div className="relative">
                            <div className="w-10 h-10 bg-[#24385E] rounded-xl flex items-center justify-center transform rotate-12 transition-transform group-hover:rotate-0 shadow-lg">
                                <span className="text-white font-black text-xs tracking-tighter">H1-B</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FDB913] rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-[#24385E] tracking-tight leading-none">Wage</span>
                            <span className="text-xl font-bold text-[#FDB913] tracking-tight leading-none">Level</span>
                        </div>
                    </Link>
                </div>

                {step === 1 && (
                    // Step 1: Form Page
                    <div>
                        <h1 className="text-3xl font-black text-[#24385E] mb-2 text-center">
                            Get Access to 500,000+ Jobs
                        </h1>
                        <p className="text-gray-400 font-medium text-center mb-8">
                            Fill in your details to proceed
                        </p>

                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-[#24385E] uppercase tracking-wider mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FDB913] focus:border-transparent text-[#24385E] font-medium placeholder:text-gray-300 bg-gray-50/50"
                                        placeholder="John"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-[#24385E] uppercase tracking-wider mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FDB913] focus:border-transparent text-[#24385E] font-medium placeholder:text-gray-300 bg-gray-50/50"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-[#24385E] uppercase tracking-wider mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FDB913] focus:border-transparent text-[#24385E] font-medium placeholder:text-gray-300 bg-gray-50/50"
                                    placeholder="john.doe@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-[#24385E] uppercase tracking-wider mb-2">
                                    Mobile Number *
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        name="countryCode"
                                        value={formData.countryCode}
                                        onChange={handleInputChange}
                                        className="px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FDB913] bg-gray-50/50 text-[#24385E] font-medium"
                                    >
                                        {countryCodes.map((item) => (
                                            <option key={item.code} value={item.code}>
                                                {item.country} ({item.code})
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="tel"
                                        name="mobileNumber"
                                        value={formData.mobileNumber}
                                        onChange={handleInputChange}
                                        required
                                        className="flex-1 px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FDB913] focus:border-transparent text-[#24385E] font-medium placeholder:text-gray-300 bg-gray-50/50"
                                        placeholder="1234567890"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-[#24385E] uppercase tracking-wider mb-2">
                                    Promo Code (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="promoCode"
                                    value={formData.promoCode}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FDB913] focus:border-transparent text-[#24385E] font-medium placeholder:text-gray-300 bg-gray-50/50"
                                    placeholder="Enter promo code"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-[#FDB913] hover:bg-[#e5a811] text-[#24385E] font-black text-lg rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Proceed to Payment →'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-400 font-medium">
                                Already have an account?{' '}
                                <Link to="/login" className="text-[#FDB913] font-bold hover:text-[#e5a811] transition-colors">
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    // Step 2: Payment Section
                    <div>
                        <h1 className="text-3xl font-black text-[#24385E] mb-4 text-center">
                            Complete Your Payment
                        </h1>

                        <div className="bg-[#24385E]/5 rounded-2xl p-6 mb-6">
                            <p className="text-center text-xl font-black text-[#24385E] mb-5">
                                30-day free trial, then $30 USD/month
                            </p>

                            <div className="space-y-3">
                                {[
                                    '500,000+ verified open roles',
                                    'H-1B, OPT/CPT, TN, E-3, J-1 & Green Cards',
                                    'Constantly updated with new jobs',
                                    'Salary & company info for every role',
                                    'Verified email of a real company contact',
                                    'Cancel anytime',
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-[#FDB913]/20 rounded-full flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 text-[#24385E]" strokeWidth={3} />
                                        </div>
                                        <span className="text-[#24385E] font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Testimonial */}
                        <div className="border-l-4 border-[#FDB913] bg-[#FDB913]/5 p-5 rounded-r-xl mb-6">
                            <div className="flex mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-[#FDB913] fill-current" />
                                ))}
                            </div>
                            <p className="text-gray-600 italic text-sm mb-2 font-medium">
                                "This platform helped me land my dream job at Microsoft! Highly recommended!"
                            </p>
                            <p className="text-sm font-black text-[#24385E]">- Rajesh K., Software Engineer</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
                                {error}
                            </div>
                        )}

                        {/* PayPal Button Container */}
                        {paypalLoading && (
                            <div className="mb-4 p-6 bg-gray-50 rounded-xl text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FDB913] mx-auto mb-2"></div>
                                <p className="text-gray-500 font-medium">Loading PayPal...</p>
                            </div>
                        )}
                        <div
                            id="paypal-button-container"
                            className="mb-4"
                            style={{ display: paypalLoading ? 'none' : 'block' }}
                        ></div>

                        {loading && (
                            <div className="text-center py-4">
                                <p className="text-gray-500 font-medium">Processing payment...</p>
                            </div>
                        )}

                        <p className="text-center text-sm text-gray-400 font-bold">
                            Customer: {formData.firstName} {formData.lastName} ({formData.email})
                        </p>
                    </div>
                )}

                {step === 3 && paymentData && (
                    // Step 3: Success Card
                    <div className="text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-12 h-12 text-emerald-500" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-black text-emerald-500 mb-4">
                            Payment Successful! 🎉
                        </h1>

                        <p className="text-gray-500 font-medium mb-6">
                            Thank you for your subscription. Your account is now active!
                        </p>

                        <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-left">
                            <h3 className="text-lg font-black text-[#24385E] mb-4">Transaction Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400 font-medium">Transaction ID:</span>
                                    <span className="font-bold text-[#24385E]">{paymentData.transactionId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400 font-medium">Order ID:</span>
                                    <span className="font-bold text-[#24385E]">{paymentData.orderId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400 font-medium">Amount:</span>
                                    <span className="font-bold text-[#24385E]">{paymentData.currency} {paymentData.amount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400 font-medium">Date:</span>
                                    <span className="font-bold text-[#24385E]">
                                        {new Date(paymentData.timeOfPayment).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#24385E]/5 border border-[#24385E]/10 rounded-2xl p-4 mb-6">
                            <p className="text-sm text-[#24385E] font-medium">
                                📧 Your login credentials have been sent to <strong>{formData.email}</strong>
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                <strong>Note:</strong> If you don't see the email in your inbox, please check your spam or junk mail folder.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-4 bg-[#24385E] hover:bg-[#1a2a47] text-white font-black text-lg rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Click Here to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Signup;
