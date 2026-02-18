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
                        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
                        console.log('PayPal Client ID:', import.meta.env.VITE_PAYPAL_CLIENT_ID);

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
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black opacity-30"></div>

            <div className="relative card max-w-2xl w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-2">
                        <div className="w-12 h-12 bg-primary-yellow rounded-lg flex items-center justify-center">
                            <span className="text-primary-dark font-bold text-2xl">TW</span>
                        </div>
                        <span className="font-bold text-xl text-primary-dark">H1B Wage Level</span>
                    </Link>
                </div>

                {step === 1 && (
                    // Step 1: Form Page
                    <div>
                        <h1 className="text-3xl font-bold text-primary-dark mb-4 text-center">
                            Get Access to 500,000+ Jobs
                        </h1>
                        <p className="text-gray-600 text-center mb-8">
                            Fill in your details to proceed
                        </p>

                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                                        placeholder="John"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                                    placeholder="john.doe@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mobile Number *
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        name="countryCode"
                                        value={formData.countryCode}
                                        onChange={handleInputChange}
                                        className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow bg-white"
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
                                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                                        placeholder="1234567890"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Promo Code (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="promoCode"
                                    value={formData.promoCode}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                                    placeholder="Enter promo code"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full btn-primary text-lg"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Proceed to Payment'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-600">
                                Already have an account?{' '}
                                <Link to="/login" className="text-accent-blue font-semibold hover:underline">
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    // Step 2: Payment Section
                    <div>
                        <h1 className="text-3xl font-bold text-primary-dark mb-4 text-center">
                            Complete Your Payment
                        </h1>

                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <p className="text-center text-xl font-semibold text-primary-dark mb-4">
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
                                    <div key={index} className="flex items-center space-x-3">
                                        <Check className="w-5 h-5 text-accent-green flex-shrink-0" />
                                        <span className="text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Testimonial */}
                        <div className="border-l-4 border-primary-yellow bg-gray-50 p-4 mb-6">
                            <div className="flex mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-primary-yellow fill-current" />
                                ))}
                            </div>
                            <p className="text-gray-700 italic text-sm mb-2">
                                "This platform helped me land my dream job at Microsoft! Highly recommended!"
                            </p>
                            <p className="text-sm font-semibold text-gray-800">- Rajesh K., Software Engineer</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        {/* PayPal Button Container */}
                        {paypalLoading && (
                            <div className="mb-4 p-6 bg-gray-50 rounded-lg text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-yellow mx-auto mb-2"></div>
                                <p className="text-gray-600">Loading PayPal...</p>
                            </div>
                        )}
                        <div
                            id="paypal-button-container"
                            className="mb-4"
                            style={{ display: paypalLoading ? 'none' : 'block' }}
                        ></div>

                        {loading && (
                            <div className="text-center py-4">
                                <p className="text-gray-600">Processing payment...</p>
                            </div>
                        )}

                        <p className="text-center text-sm text-gray-500">
                            Customer: {formData.firstName} {formData.lastName} ({formData.email})
                        </p>
                    </div>
                )}

                {step === 3 && paymentData && (
                    // Step 3: Success Card
                    <div className="text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-green-600 mb-4">
                            Payment Successful! 🎉
                        </h1>

                        <p className="text-gray-600 mb-6">
                            Thank you for your subscription. Your account is now active!
                        </p>

                        <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                            <h3 className="text-lg font-semibold text-primary-dark mb-4">Transaction Details</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Transaction ID:</span>
                                    <span className="font-medium text-gray-900">{paymentData.transactionId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Order ID:</span>
                                    <span className="font-medium text-gray-900">{paymentData.orderId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Amount:</span>
                                    <span className="font-medium text-gray-900">{paymentData.currency} {paymentData.amount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date:</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(paymentData.timeOfPayment).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-800">
                                📧 Your login credentials have been sent to <strong>{formData.email}</strong>
                            </p>
                            <p className="text-xs text-blue-700 mt-2">
                                <strong>Note:</strong> If you don't see the email in your inbox, please check your spam or junk mail folder.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full btn-primary text-lg"
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
