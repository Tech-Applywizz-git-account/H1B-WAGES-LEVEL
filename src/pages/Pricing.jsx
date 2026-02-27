import React, { useState, useEffect } from 'react';
import MigrateNavbar from '../components/MigrateNavbar';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp, Sparkles, Shield, Zap, Star, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';

const Pricing = () => {
    const [openFaq, setOpenFaq] = useState(null);

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    const faqs = [
        {
            question: 'How does the subscription work?',
            answer: 'H1-B Wage Level costs $30/month. You get immediate access to all 500,000+ verified jobs, direct company contact emails, and all premium features. Your subscription renews automatically each month until you cancel.'
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
            <MigrateNavbar />

            <div className="min-h-screen bg-gradient-to-b from-[#f8f9fc] to-white">
                {/* Hero Section */}
                <div className="bg-[#24385E] text-white py-16 md:py-24 relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#FDB913]/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                    <div className="max-w-4xl mx-auto px-6 md:px-8 text-center relative z-10">
                        <div className="flex justify-center mb-5">
                            <div className="w-14 h-14 bg-[#FDB913] rounded-2xl flex items-center justify-center shadow-lg">
                                <Sparkles className="text-[#24385E] w-7 h-7" />
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black mb-5 tracking-tight leading-tight">
                            H1-B Wage Level
                        </h1>
                        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-medium">
                            Unlimited access to 500,000+ visa-sponsored jobs for just $30/month.
                        </p>
                    </div>
                </div>

                {/* Pricing Card */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-20">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                        {/* Ribbon */}
                        <div className="bg-[#FDB913] text-[#24385E] text-center py-3.5 font-black text-sm uppercase tracking-widest">
                            ★ MOST POPULAR PLAN ★
                        </div>

                        <div className="p-8 md:p-14">
                            {/* Price */}
                            <div className="text-center mb-10">
                                <div className="inline-flex items-baseline gap-1">
                                    <span className="text-lg text-gray-400 font-bold">$</span>
                                    <span className="text-7xl md:text-8xl font-black text-[#24385E]">30</span>
                                    <span className="text-xl text-gray-400 font-bold">/month</span>
                                </div>
                                <p className="text-base text-gray-400 font-bold mt-2">billed monthly · cancel anytime</p>
                                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#24385E]/5 rounded-full">
                                    <Zap size={16} className="text-[#FDB913]" />
                                    <span className="text-sm font-bold text-[#24385E]">Instant access to all jobs</span>
                                </div>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-10 mb-12">
                                {[
                                    '500,000+ verified open roles',
                                    'All visa types (H-1B, TN, etc.)',
                                    'Daily job updates',
                                    'Full salary information',
                                    'Advanced search & filters',
                                    'Save unlimited jobs',
                                    'Email job alerts',
                                    'Cancel anytime'
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3 group">
                                        <div className="w-6 h-6 bg-[#FDB913]/15 rounded-full flex items-center justify-center shrink-0 group-hover:bg-[#FDB913]/30 transition-colors">
                                            <Check className="w-3.5 h-3.5 text-[#24385E]" strokeWidth={3} />
                                        </div>
                                        <span className="text-[#24385E] font-semibold text-[15px]">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Button */}
                            <Link
                                to="/signup"
                                className="block w-full text-center text-lg font-black py-4 px-8 bg-[#FDB913] hover:bg-[#e5a811] text-[#24385E] rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Get Access Now →
                            </Link>
                            <p className="text-center text-sm text-gray-400 font-bold mt-4">
                                Join 30,000+ members finding their dream jobs
                            </p>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mt-14 mb-20 md:mb-24">
                        {[
                            { icon: Star, value: '500K+', label: 'Active Jobs' },
                            { icon: Shield, value: '30,000+', label: 'Active Users' },
                            { icon: Zap, value: '8', label: 'Visa Types' }
                        ].map((badge, i) => (
                            <div key={i} className="text-center p-7 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="w-10 h-10 bg-[#FDB913]/15 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[#FDB913]/25 transition-colors">
                                    <badge.icon size={20} className="text-[#24385E]" />
                                </div>
                                <div className="text-3xl md:text-4xl font-black text-[#24385E] mb-1">{badge.value}</div>
                                <div className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{badge.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* FAQ Section */}
                    <div className="mb-20">
                        <h2 className="text-3xl font-black text-[#24385E] text-center mb-10 tracking-tight">
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-4 max-w-3xl mx-auto">
                            {faqs.map((faq, index) => (
                                <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                        className="w-full flex justify-between items-center text-left p-6"
                                    >
                                        <h3 className="text-lg font-bold text-[#24385E] pr-8">
                                            {faq.question}
                                        </h3>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${openFaq === index ? 'bg-[#FDB913] text-[#24385E]' : 'bg-gray-100 text-gray-400'}`}>
                                            {openFaq === index ? (
                                                <ChevronUp size={18} strokeWidth={3} />
                                            ) : (
                                                <ChevronDown size={18} strokeWidth={3} />
                                            )}
                                        </div>
                                    </button>
                                    <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-96' : 'max-h-0'}`}>
                                        <p className="px-6 pb-6 text-gray-500 font-medium leading-relaxed border-t border-gray-50 pt-4">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Branded Footer — matches landing page */}
            <footer className="pt-24 border-t border-gray-100 pb-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid lg:grid-cols-12 gap-10 mb-14">
                        <div className="lg:col-span-5">
                            <Link to="/" className="flex items-center gap-2 mb-6 group">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-[#24385E] rounded-xl flex items-center justify-center transform rotate-12 transition-transform group-hover:rotate-0 shadow-lg">
                                        <span className="text-white font-black text-xs tracking-tighter">H1-B</span>
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-[#24385E] tracking-tight leading-none">Wage</span>
                                    <span className="text-xl font-bold text-yellow-500 tracking-tight leading-none">Level</span>
                                </div>
                            </Link>
                            <p className="text-gray-400 font-bold text-lg mb-8 max-w-sm leading-relaxed">
                                Find US jobs with verified visa sponsorship. The #1 platform for global talent discovery.
                            </p>
                            <div className="flex gap-4">
                                {[Instagram, Twitter, Linkedin, Facebook].map((Icon, i) => (
                                    <a key={i} href="#" className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-[#24385E] hover:bg-[#FDB913] hover:text-[#24385E] transition-all shadow-sm">
                                        <Icon size={20} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10">
                            <div className="space-y-6">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#24385E]">Platform</h4>
                                <ul className="space-y-4">
                                    {['Job Search', 'How it works', 'Pricing', 'Visa Guides'].map(link => (
                                        <li key={link}><Link to="#" className="text-base font-bold text-gray-500 hover:text-[#FDB913] transition-colors">{link}</Link></li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#24385E]">Company</h4>
                                <ul className="space-y-4">
                                    {['About Us', 'Contact', 'Blog', 'Twitter'].map(link => (
                                        <li key={link}><Link to="#" className="text-base font-bold text-gray-500 hover:text-[#FDB913] transition-colors">{link}</Link></li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#24385E]">Support</h4>
                                <ul className="space-y-4">
                                    {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(link => (
                                        <li key={link}><Link to="#" className="text-base font-bold text-gray-500 hover:text-[#FDB913] transition-colors">{link}</Link></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-xs font-black text-gray-300 uppercase tracking-widest">
                            © 2026 H1-B Wage Level. All rights reserved.
                        </p>
                        <div className="flex gap-8">
                            <span className="text-xs font-black text-gray-300 uppercase tracking-widest cursor-pointer hover:text-gray-400 transition-colors">US SPONSORSHIP VERIFIED</span>
                            <span className="text-xs font-black text-gray-300 uppercase tracking-widest cursor-pointer hover:text-gray-400 transition-colors">SSL SECURE PLATFORM</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Pricing;
