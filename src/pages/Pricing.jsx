import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const Pricing = () => {
    const [openFaq, setOpenFaq] = useState(null);

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    const faqs = [
        {
            question: 'How does the subscription work?',
            answer: 'H1B Wage Level costs $30/month. You get immediate access to all 500,000+ verified jobs, direct company contact emails, and all premium features. Your subscription renews automatically each month until you cancel.'
        },
        {
            question: 'Can I cancel anytime?',
            answer: 'Yes! You can cancel your subscription at any time from your account settings. When you cancel, you will not be charged for the next month. However, the current month\'s payment is non-refundable and your access continues until the end of the billing period.'
        },
        {
            question: 'Do you offer refunds?',
            answer: 'No. All payments are final and non-refundable once processed. We recommend exploring the platform thoroughly before subscribing to ensure it meets your needs.'
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) and debit cards. All payments are securely processed through Stripe.'
        },
        {
            question: 'Will the price increase later?',
            answer: 'Your price is locked in at $30/month as long as you remain a subscriber. We may adjust pricing for new members in the future, but existing members keep their current rate.'
        }
    ];

    return (
        <div>
            <Navbar />

            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-xl text-gray-100 max-w-2xl mx-auto">
                            Get unlimited access to 500,000+ visa-sponsored jobs for $30/month. Cancel anytime.
                        </p>
                    </div>
                </div>

                {/* Pricing Card */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
                    <div className="bg-white rounded-2xl shadow-2xl border-2 border-primary-yellow overflow-hidden">
                        {/* Ribbon */}
                        <div className="bg-primary-yellow text-primary-dark text-center py-3 font-bold">
                            MOST POPULAR PLAN
                        </div>

                        <div className="p-8 md:p-12">
                            {/* Price */}
                            <div className="text-center mb-8">
                                <div className="text-6xl md:text-7xl font-bold text-primary-dark mb-2">
                                    $30
                                    <span className="text-2xl text-gray-500 font-normal">/month</span>
                                </div>
                                <p className="text-lg text-gray-600">billed monthly</p>
                                <p className="text-sm text-accent-blue font-semibold mt-2">
                                    ✓ Instant access to all jobs
                                </p>
                            </div>

                            {/* Features Grid */}
                            <div className="grid md:grid-cols-2 gap-4 mb-10">
                                {[
                                    '500,000+ verified open roles',
                                    'All visa types (H-1B, OPT, Green Card, etc.)',
                                    'Daily job updates',
                                    'Salary information for every role',
                                    'Advanced search & filters',
                                    'Save unlimited jobs',
                                    'Email job alerts',
                                    'Cancel anytime - no contracts'
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <Check className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Button */}
                            <Link
                                to="/signup"
                                className="block btn-primary text-center text-xl py-4 mb-4 shadow-lg hover:shadow-xl transition-shadow"
                            >
                                Get Access →
                            </Link>
                            <p className="text-center text-sm text-gray-500">
                                Join 30,000+ H1B Wage Level members finding their dream jobs
                            </p>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-3 gap-4 mt-8 mb-16">
                        <div className="text-center p-4">
                            <div className="text-3xl font-bold text-primary-dark">500K+</div>
                            <div className="text-sm text-gray-600">Active Jobs</div>
                        </div>
                        <div className="text-center p-4">
                            <div className="text-3xl font-bold text-primary-dark">10K+</div>
                            <div className="text-sm text-gray-600">Happy Users</div>
                        </div>
                        <div className="text-center p-4">
                            <div className="text-3xl font-bold text-primary-dark">6</div>
                            <div className="text-sm text-gray-600">Visa Types</div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="mb-20">
                        <h2 className="text-3xl font-bold text-primary-dark text-center mb-8">
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-4 max-w-3xl mx-auto">
                            {faqs.map((faq, index) => (
                                <div key={index} className="card">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                        className="w-full flex justify-between items-center text-left"
                                    >
                                        <h3 className="text-lg font-semibold text-primary-dark pr-8">
                                            {faq.question}
                                        </h3>
                                        {openFaq === index ? (
                                            <ChevronUp className="flex-shrink-0 text-gray-400" size={24} />
                                        ) : (
                                            <ChevronDown className="flex-shrink-0 text-gray-400" size={24} />
                                        )}
                                    </button>
                                    {openFaq === index && (
                                        <p className="mt-4 text-gray-600 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Pricing;
