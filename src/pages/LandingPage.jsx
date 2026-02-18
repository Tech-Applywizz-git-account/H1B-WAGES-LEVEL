import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Menu, X, ChevronDown, ChevronUp, Star, Play, LogOut,
    Check, Mail, MapPin, DollarSign, ArrowRight, LayoutDashboard, User
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const VISA_CHIPS = ['H-1B', 'Green Card', 'TN (Canada)', 'TN (Mexico)', 'OPT / CPT', 'E-3 (Australia)', 'H-1B1', 'J-1'];

const HOW_STEPS = [
    {
        num: 1,
        title: 'Find the visa for you',
        content: (
            <div className="mt-4">
                <p className="text-sm text-gray-500 mb-3">Select the visa type that applies to you:</p>
                <div className="flex flex-wrap gap-2">
                    {VISA_CHIPS.map(v => (
                        <span key={v} className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer
              ${v === 'H-1B' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}>
                            {v}
                        </span>
                    ))}
                </div>
            </div>
        ),
    },
    {
        num: 2,
        title: 'Search',
        content: (
            <div className="mt-4">
                <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm max-w-md">
                    <svg className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                    </svg>
                    <span className="text-gray-400 text-sm">Software Engineer, Data Scientist…</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 ml-1">Any role, any industry, any company.</p>
            </div>
        ),
    },
    {
        num: 3,
        title: 'Apply filters',
        content: (
            <div className="mt-4 flex flex-wrap gap-2">
                {['Atlanta, Georgia', '$100k – $150k', 'Full-time', 'H-1B Sponsor'].map(f => (
                    <span key={f} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium">
                        <Check size={12} /> {f}
                    </span>
                ))}
            </div>
        ),
    },
    {
        num: 4,
        title: 'Find your dream role',
        content: (
            <div className="mt-4 max-w-sm bg-white border border-gray-100 rounded-2xl p-4 shadow-md">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">NEW JOB</span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm">Financial Systems Manager</h4>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <MapPin size={10} /> Atlanta, Georgia
                        </div>
                    </div>
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">CC</div>
                </div>
                <div className="flex gap-1.5 flex-wrap mb-3">
                    {['Full-time', 'Associate', "Bachelor's"].map(t => (
                        <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <DollarSign size={10} /> $95,000 – $130,000 / year
                </div>
                <div className="text-xs text-gray-500">
                    <span className="font-medium text-gray-700">Visas sponsored: </span>H-1B, Green Card, TN
                </div>
            </div>
        ),
    },
    {
        num: 5,
        title: 'Email a real person',
        content: (
            <div className="mt-4 max-w-xs bg-white border border-gray-100 rounded-2xl p-4 shadow-md">
                <p className="text-xs text-gray-400 mb-3">Visa contact at this company:</p>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">J</div>
                    <div>
                        <div className="font-semibold text-gray-900 text-sm">Jula Arevalo</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1"><Mail size={10} /> jularevalo@cocacola.com</div>
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">This is the real person who handles visa sponsorship at this company.</p>
            </div>
        ),
    },
    {
        num: 6,
        title: 'Land a job & visa',
        content: (
            <div className="mt-4 max-w-sm bg-green-50 border border-green-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={16} className="text-white" strokeWidth={3} />
                    </div>
                    <div>
                        <div className="font-bold text-green-800 text-sm mb-1">You got the job!!</div>
                        <div className="text-xs text-green-700 leading-relaxed">
                            We're also committing to sponsoring your H-1B Visa, which grants you full rights to work in the United States. Welcome to the team! 🎉
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
];

const REVIEWS = [
    {
        title: 'Definitely worth subscribing',
        text: "I was a bit hesitant at first to subscribe but realised that I really had no other options out there to find currently open jobs that sponsor visas so I thought I'd give H1B Wage Level a try. I'm so happy I did because I've heard back from multiple job openings.",
        name: 'Alex M.',
        country: '🇮🇳 India',
        avatar: 'A',
        color: 'bg-indigo-600',
    },
    {
        title: 'Perfect for international students',
        text: "I'm an international student and have been looking for graduate jobs for a while at companies that'll sponsor me on an H-1B after my OPT ends. It's been really difficult to find this information until now.",
        name: 'Priya S.',
        country: '🇮🇳 India',
        avatar: 'P',
        color: 'bg-emerald-600',
    },
    {
        title: 'Have had a brilliant experience',
        text: "Have had a brilliant experience with H1B Wage Level, the team are very easy to get in touch with if need be, the website is very easy to navigate through every step of the way. Not to mention it is very affordable.",
        name: 'James O.',
        country: '🇳🇬 Nigeria',
        avatar: 'J',
        color: 'bg-blue-600',
    },
];

const TRUSTED_LOGOS = [
    'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Salesforce', 'Adobe', 'Uber', 'Airbnb'
];

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function Navbar({ onGetAccess }) {
    const { user, signOut, loggingOut, role } = useAuth();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform">
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <span className="text-white font-black text-xl italic tracking-tighter">H</span>
                    </div>
                    <div className="flex flex-col">
                        <span className={`font-black text-xl italic tracking-tighter transition-colors font-display ${scrolled ? 'text-gray-900' : 'text-white'}`}>H1B WAGE</span>
                        <span className={`text-[10px] font-bold tracking-[0.2em] transition-colors ${scrolled ? 'text-indigo-600' : 'text-gray-300'}`}>LEVEL.COM</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-12">
                    {['Find Jobs', 'Pricing', 'Resources', 'About'].map(item => (
                        <button key={item} className={`text-sm font-bold tracking-tight transition-all hover:scale-105 active:scale-95 ${scrolled ? 'text-gray-600 hover:text-indigo-600' : 'text-white/80 hover:text-white'}`}>
                            {item}
                        </button>
                    ))}
                </div>

                {/* CTAs */}
                <div className="flex items-center gap-4">
                    {!user ? (
                        <>
                            <Link to="/login" className={`hidden sm:block text-sm font-bold transition-colors ${scrolled ? 'text-gray-900 hover:text-indigo-600' : 'text-white hover:text-indigo-200'}`}>Login</Link>
                            <button
                                onClick={onGetAccess}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 active:scale-95"
                            >
                                Get Access
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 bg-white text-gray-900 border border-gray-100 rounded-2xl font-black text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                        >
                            Dashboard
                        </button>
                    )}

                    {/* Mobile Toggle */}
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2">
                        {mobileMenuOpen ? <X className={scrolled ? 'text-gray-900' : 'text-white'} /> : <Menu className={scrolled ? 'text-gray-900' : 'text-white'} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-6 lg:hidden animate-slideDown">
                    <div className="flex flex-col gap-6">
                        {['Find Jobs', 'Pricing', 'Resources', 'About'].map(item => (
                            <button key={item} className="text-left text-lg font-black text-gray-900 tracking-tight">{item}</button>
                        ))}
                        <Link to="/login" className="text-lg font-black text-indigo-600 tracking-tight">Login</Link>
                    </div>
                </div>
            )}
        </nav>
    );
}

/* ─────────────────────────────────────────────
   HERO SECTION — Full-width Golden Gate Bridge
───────────────────────────────────────────── */
function HeroSection({ onGetAccess }) {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-950">
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 animate-slowZoom"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=2000&q=80')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950/40 to-gray-950" />
            </div>

            <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full mb-10 animate-fadeInUp">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="text-amber-400 fill-current" />)}
                    </div>
                    <span className="text-white font-bold text-sm tracking-tight text-white/90">Trusted by 30,000+ Internationals</span>
                </div>

                <h1 className="text-[56px] md:text-[88px] font-black text-white leading-[0.9] tracking-tighter mb-8 animate-fadeInUp delay-100 font-display">
                    FIND A JOB. <br />
                    GET <span className="text-indigo-500 italic">SPONSORED.</span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-400 font-bold max-w-2xl mx-auto mb-12 animate-fadeInUp delay-200">
                    The #1 platform for finding active US job openings with verified visa sponsorship.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fadeInUp delay-300">
                    <button
                        onClick={onGetAccess}
                        className="group relative px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[28px] font-black text-lg transition-all shadow-2xl shadow-indigo-500/20 active:scale-95 overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            Start Your Journey <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>

                    <button className="flex items-center gap-4 px-8 py-5 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-[28px] font-black text-lg hover:bg-white/10 transition-all active:scale-95">
                        <Play fill="white" size={20} />
                        Watch Demo
                    </button>
                </div>
            </div>

            {/* Trusted Logos Marquee */}
            <div className="absolute bottom-10 left-0 right-0 overflow-hidden py-4 opacity-40">
                <div className="flex gap-20 animate-marquee whitespace-nowrap px-10">
                    {[...TRUSTED_LOGOS, ...TRUSTED_LOGOS].map((logo, i) => (
                        <span key={i} className="text-3xl font-black text-white italic tracking-tighter grayscale border-b-4 border-white pb-1">{logo}</span>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   PROBLEM SECTION
───────────────────────────────────────────── */
function ProblemSection({ onGetAccess }) {
    const cards = [
        { title: 'Doom Scrolling', icon: '😩', color: 'bg-red-500/10 text-red-500', text: "Wasted hours on job boards that don't even filter for sponsorship." },
        { title: 'Dead-end Apps', icon: '📩', color: 'bg-amber-500/10 text-amber-500', text: 'Getting ghosted by companies that have never sponsored a visa.' },
        { title: 'Information Gap', icon: '🔍', color: 'bg-indigo-500/10 text-indigo-500', text: "Not knowing if a role is actually open to international candidates." }
    ];

    return (
        <section className="py-32 bg-gray-950 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
                <h2 className="text-[40px] md:text-[64px] font-black text-white leading-[1.1] tracking-tighter mb-16 font-display">
                    STOP GUESSING. <br />
                    <span className="text-gray-600 italic">START APPLYING.</span>
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {cards.map((card, i) => (
                        <div key={i} className="group p-10 bg-white/5 border border-white/10 rounded-[40px] text-left hover:bg-white/[0.08] transition-all hover:border-indigo-500/30">
                            <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform`}>
                                {card.icon}
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4 tracking-tight italic">{card.title}</h3>
                            <p className="text-gray-400 font-bold leading-relaxed">{card.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   HOW IT WORKS (ACCORDION)
───────────────────────────────────────────── */
function HowItWorksSection() {
    const [active, setActive] = useState(0);

    return (
        <section id="how-it-works" className="py-32 bg-white overflow-hidden text-gray-900">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="flex flex-col lg:flex-row gap-20 items-center">
                    <div className="lg:w-1/2">
                        <h2 className="text-[40px] md:text-[56px] font-black leading-[1] tracking-tighter mb-10 font-display">
                            Finding a US job should be <span className="text-indigo-600">automatic.</span>
                        </h2>

                        <div className="space-y-6">
                            {HOW_STEPS.map((step, idx) => (
                                <div
                                    key={idx}
                                    onMouseEnter={() => setActive(idx)}
                                    className={`p-8 rounded-[32px] cursor-pointer transition-all duration-300 border ${active === idx ? 'bg-indigo-50 border-indigo-100 shadow-xl shadow-indigo-100/20 translate-x-2' : 'bg-transparent border-transparent hover:bg-gray-50'}`}
                                >
                                    <div className="flex gap-6 items-start">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 transition-colors ${active === idx ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            {step.num}
                                        </div>
                                        <div>
                                            <h3 className={`text-xl font-black mb-2 tracking-tight ${active === idx ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</h3>
                                            <div className={`transition-all duration-500 overflow-hidden ${active === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                {step.content}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:w-1/2 relative hidden lg:block">
                        <div className="aspect-[4/5] bg-gray-100 rounded-[64px] overflow-hidden shadow-2xl relative group">
                            <div className="absolute inset-0 bg-indigo-600/5 group-hover:bg-indigo-600/0 transition-colors" />
                            <img
                                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80"
                                className="w-full h-full object-cover grayscale-0 hover:scale-105 transition-transform duration-700"
                                alt="Professional workspace"
                            />
                            <div className="absolute bottom-10 left-10 right-10 bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[40px] animate-fadeInUp">
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600">
                                        <Check className="stroke-[3]" size={24} />
                                    </div>
                                    <p className="text-white font-black text-lg tracking-tight">Access 500k+ Sponsoring Companies</p>
                                </div>
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-[80px] rounded-full" />
                        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-indigo-600/20 blur-[100px] rounded-full" />
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   VIDEO SECTION
───────────────────────────────────────────── */
function VideoSection() {
    return (
        <section className="py-32 bg-gray-50">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="bg-white p-4 rounded-[48px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden group">
                    <div className="relative aspect-video rounded-[40px] overflow-hidden bg-gray-950 flex items-center justify-center">
                        <img
                            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80"
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[2s]"
                            alt="Platform walkthough"
                        />
                        <div className="absolute inset-0 bg-indigo-900/40 group-hover:bg-indigo-900/20 transition-colors" />

                        <div className="relative z-10 text-center">
                            <button className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all text-indigo-600 mb-8">
                                <Play fill="currentColor" size={32} className="ml-1" />
                            </button>
                            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 font-display">Watch the walkthrough</h3>
                            <p className="text-white/80 font-bold">See how easy it is to find your next role in 2 minutes.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   MID-PAGE CTA STRIP
───────────────────────────────────────────── */
function MidCTASection({ onGetAccess }) {
    const features = [
        '500,000+ verified open roles',
        'H-1B, F-1 (OPT/CPT), TN, E-3, J-1 & Green Cards',
        'Constantly updated with new jobs',
        'Salary & company info for every role',
        'Verified email of a real company contact per role',
        'Cancel anytime',
    ];

    return (
        <section id="pricing-anchor" className="py-32 bg-white">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="bg-gray-950 rounded-[64px] p-12 md:p-24 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/10 skew-x-12 translate-x-32 group-hover:translate-x-24 transition-transform duration-700" />
                    <div className="relative z-10 flex flex-col lg:flex-row gap-20 items-center">
                        <div className="lg:w-1/2 text-left">
                            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-5 py-2 mb-8 animate-fadeInUp">
                                <span className="text-sm font-black text-indigo-400 tracking-tighter uppercase italic">Ready to start? 🇺🇸</span>
                            </div>
                            <h2 className="text-[48px] md:text-[64px] font-black text-white leading-[1] tracking-tighter mb-8 font-display">
                                YOUR FUTURE <br />
                                <span className="text-gray-500 italic">STARTS HERE.</span>
                            </h2>
                            <p className="text-xl text-gray-400 font-bold mb-12">Everything you need to secure a job and visa, all in one place.</p>
                            <button
                                onClick={onGetAccess}
                                className="px-12 py-6 bg-white hover:bg-gray-100 text-gray-950 rounded-[28px] font-black text-xl transition-all shadow-2xl active:scale-95 flex items-center gap-4"
                            >
                                Get Instant Access <ArrowRight className="stroke-[3]" />
                            </button>
                        </div>

                        <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {features.map((f, i) => (
                                <div key={i} className="flex items-center gap-4 group/item">
                                    <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover/item:bg-indigo-600 transition-colors">
                                        <Check className="text-white stroke-[4]" size={16} />
                                    </div>
                                    <span className="text-gray-300 font-bold text-sm leading-tight">{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   FAQ SECTION
───────────────────────────────────────────── */
function FAQSection() {
    const [open, setOpen] = useState(null);

    const faqs = [
        {
            q: 'Is H1B Wage Level right for me?',
            a: "If you're looking to land a job in the US as a non-US citizen, H1B Wage Level is right for you. Whether you're a recent graduate, a professional with years of experience, or someone with niche skills, H1B Wage Level can help you identify companies that have a proven history of sponsoring visas.",
        },
        {
            q: 'What visa types are supported?',
            a: 'We support all major US work visas including H-1B, F-1 (OPT/CPT), Green Card, TN (Canada & Mexico), E-3 (Australia), H-1B1 (Chile/Singapore), and J-1.',
        },
        {
            q: 'How often are jobs updated?',
            a: "Our database is constantly updated with new jobs from companies actively hiring and sponsoring visas. You'll always have access to the freshest opportunities.",
        },
        {
            q: 'Can I cancel my subscription anytime?',
            a: "Yes! Cancel anytime from your account settings. You won't be charged for the next billing period.",
        }
    ];

    return (
        <section id="faq" className="py-32 bg-gray-50">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-20">
                <div className="lg:w-1/3">
                    <h2 className="text-[40px] md:text-[56px] font-black leading-[1] tracking-tighter mb-8 font-display">
                        ANY <span className="text-indigo-600">QUESTIONS?</span>
                    </h2>
                    <p className="text-xl text-gray-500 font-bold mb-10">Everything you need to know about the platform.</p>
                    <button className="flex items-center gap-3 text-indigo-600 font-black hover:gap-5 transition-all">
                        Contact Support <ArrowRight size={20} />
                    </button>
                </div>

                <div className="lg:w-2/3 space-y-4">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className={`border rounded-[32px] overflow-hidden transition-all duration-300 cursor-pointer
                ${open === i ? 'bg-white border-indigo-100 shadow-xl shadow-indigo-100/10' : 'bg-white border-transparent hover:bg-white/80'}`}
                            onClick={() => setOpen(open === i ? null : i)}
                        >
                            <div className="flex items-center justify-between px-10 py-8">
                                <h3 className={`font-black text-xl tracking-tight transition-colors ${open === i ? 'text-indigo-600' : 'text-gray-900'}`}>{faq.q}</h3>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${open === i ? 'bg-indigo-600 text-white rotate-180' : 'bg-gray-100 text-gray-400'}`}>
                                    <ChevronDown size={20} />
                                </div>
                            </div>
                            <div className={`transition-all duration-500 overflow-hidden ${open === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-10 pb-8 text-lg text-gray-500 font-medium leading-relaxed">{faq.a}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   REVIEWS SECTION
───────────────────────────────────────────── */
function ReviewsSection() {
    return (
        <section className="py-32 bg-white">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="text-center mb-20">
                    <h2 className="text-[40px] md:text-[56px] font-black leading-[1] tracking-tighter mb-8 font-display">
                        REAL STORIES. <span className="text-indigo-600">REAL RESULTS.</span>
                    </h2>
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} className="text-amber-400 fill-current" />)}
                        </div>
                        <span className="text-xl font-black text-gray-900 italic tracking-tighter">4.9/5 RATING</span>
                    </div>
                    <p className="text-gray-500 font-bold text-lg">Join 30,000+ internationals who secured their future.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {REVIEWS.map((review, i) => (
                        <div key={i} className="p-10 bg-gray-50 rounded-[40px] border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 transition-all group">
                            <div className="flex gap-1 mb-8">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="text-amber-400 fill-current" />)}
                            </div>
                            <h4 className="text-2xl font-black text-gray-900 mb-6 tracking-tight italic">"{review.title}"</h4>
                            <p className="text-lg text-gray-500 font-bold leading-relaxed mb-10 h-32 overflow-hidden italic truncate hover:whitespace-normal hover:h-auto">
                                {review.text}
                            </p>
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 ${review.color} rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                                    {review.avatar}
                                </div>
                                <div>
                                    <div className="font-black text-gray-900 text-lg tracking-tight">{review.name}</div>
                                    <div className="text-gray-400 font-bold text-sm">{review.country}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   FOUNDER STORY + FINAL CTA
───────────────────────────────────────────── */
function FounderCTASection({ onGetAccess }) {
    return (
        <section id="about-anchor" className="py-32 bg-gray-950 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 L100 0 L100 100 Z" fill="white" />
                </svg>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="w-24 h-24 bg-indigo-600 rounded-[32px] mx-auto mb-10 flex items-center justify-center shadow-2xl shadow-indigo-500/20 rotate-12">
                        <span className="text-white font-black text-4xl italic tracking-tighter">-</span>
                    </div>
                    <h2 className="text-[40px] md:text-[72px] font-black text-white leading-[0.9] tracking-tighter mb-10 font-display">
                        BUILT BY <span className="text-indigo-500 italic">IMMIGRANTS.</span> <br />
                        FOR THE WORLD.
                    </h2>
                    <p className="text-2xl text-gray-400 font-bold mb-16 leading-relaxed">
                        We built H1B Wage Level after experiencing the struggle ourselves.
                        No more guessing. No more dead ends. Just verified paths to your future in the U.S.
                    </p>
                    <button
                        onClick={onGetAccess}
                        className="px-16 py-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[40px] font-black text-2xl transition-all shadow-[0_20px_60px_-15px_rgba(79,70,229,0.5)] active:scale-95 animate-pulse-subtle"
                    >
                        Get Started Today
                    </button>
                    <p className="mt-10 text-gray-500 font-bold tracking-tight italic">Cancel anytime. No commitment. 100% Verified.</p>
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
    return (
        <footer className="bg-white pt-24 pb-12 text-gray-900 border-t border-gray-100">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center">
                                <span className="text-white font-black text-xl italic tracking-tighter">H</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-xl italic tracking-tighter">H1B WAGE</span>
                                <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-600">LEVEL.COM</span>
                            </div>
                        </Link>
                        <p className="text-gray-500 font-bold leading-relaxed">
                            Access 500,000+ verified U.S. jobs with visa sponsorship.
                            The most trusted platform for international job seekers.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-black text-lg mb-6 tracking-tight">Platform</h4>
                        <ul className="space-y-4 font-bold text-gray-500">
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Find Jobs</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Sponsorship Data</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Success Stories</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-lg mb-6 tracking-tight">Resources</h4>
                        <ul className="space-y-4 font-bold text-gray-500">
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">H-1B Guide</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">OPT/CPT Tips</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">USCIS Records</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-lg mb-6 tracking-tight">Support</h4>
                        <ul className="space-y-4 font-bold text-gray-500">
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact Us</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Refund Policy</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-400 font-bold text-sm">© 2026 H1B WAGE LEVEL. ALL RIGHTS RESERVED.</p>
                    <div className="flex gap-8">
                        <a href="#" className="text-gray-400 hover:text-indigo-600 transition-all"><X size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-indigo-600 transition-all"><Mail size={20} /></a>
                    </div>
                </div>

                <div className="mt-12 p-8 bg-gray-50 rounded-[32px]">
                    <p className="text-xs text-gray-400 leading-relaxed font-medium">
                        <strong className="text-gray-900 font-black">Legal Disclaimer:</strong> H1B Wage Level is a technology platform that provides general immigration information and tools and is not a law firm. Nothing on this website constitutes legal advice or creates an attorney-client relationship. Immigration outcomes depend on individual circumstances and government decisions and are not guaranteed.
                    </p>
                </div>
            </div>
        </footer>
    );
}

/* ─────────────────────────────────────────────
   JOBS SECTION (PREVIEW)
───────────────────────────────────────────── */
function JobsSection({ onGetAccess }) {
    const { user } = useAuth();
    const jobs = [
        { title: 'Data Engineer', company: 'hackajob', location: 'Philadelphia, PA', visas: ['Green Card', 'TN', 'OPT'], salary: '$140k - $190k', color: 'bg-blue-600' },
        { title: 'Fullstack Engineer', company: 'Torch Dental', location: 'New York, NY', visas: ['H-1B', 'OPT'], salary: '$160k - $210k', color: 'bg-red-600' },
        { title: 'Cloud Architect', company: 'Verisk', location: 'Jersey City, NJ', visas: ['H-1B', 'E-3'], salary: '$180k - $240k', color: 'bg-black' },
    ];

    return (
        <section id="jobs-section" className="py-32 bg-gray-50 relative">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="text-center mb-20 animate-fadeInUp">
                    <h2 className="text-[40px] md:text-[56px] font-black leading-[1] tracking-tighter mb-8 font-display">
                        LIVE <span className="text-indigo-600 uppercase">SPONSORSHIPS.</span>
                    </h2>
                    <p className="text-xl text-gray-500 font-bold max-w-2xl mx-auto">
                        Access 500,000+ verified roles at companies actively hiring and sponsoring today.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {jobs.map((job, i) => (
                        <div
                            key={i}
                            onClick={onGetAccess}
                            className="group bg-white border-2 border-transparent hover:border-indigo-600 rounded-[40px] p-10 shadow-xl shadow-gray-200/50 transition-all hover:-translate-y-2 cursor-pointer flex flex-col h-full"
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className={`w-16 h-16 ${job.color} rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg`}>
                                    {job.company[0].toUpperCase()}
                                </div>
                                <div className="px-5 py-2 bg-indigo-50 rounded-full text-indigo-600 font-black text-xs uppercase tracking-widest">
                                    Full-time
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-gray-900 mb-2 font-display">{job.title}</h3>
                            <p className="text-gray-500 font-bold mb-8">{job.company} · {job.location}</p>

                            <div className="flex flex-wrap gap-2 mb-8">
                                {job.visas.map(v => (
                                    <span key={v} className="px-4 py-1.5 bg-gray-50 text-gray-900 rounded-lg text-[10px] font-black uppercase tracking-tight group-hover:bg-indigo-600 group-hover:text-white transition-colors border border-gray-100">
                                        {v}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-auto pt-8 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-gray-900 font-black text-lg">{job.salary}</span>
                                <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <ArrowRight size={20} className="stroke-[3]" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <button
                        onClick={onGetAccess}
                        className="inline-flex items-center gap-4 text-gray-950 font-black text-xl hover:gap-6 transition-all font-display italic tracking-tighter"
                    >
                        SEE 500k+ MORE JOBS <ArrowRight className="stroke-[3]" size={24} />
                    </button>
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   MAIN LANDING PAGE
───────────────────────────────────────────── */
export default function LandingPage() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    // While auth is loading, show a subtle placeholder (minimal flicker)
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            </div>
        );
    }

    // Unified CTA handler
    const handleGetAccess = () => {
        if (user) {
            navigate('/jobs');
        } else {
            navigate('/signup');
        }
    };

    return (
        <div className="mm-landing">
            <Navbar onGetAccess={handleGetAccess} />
            <HeroSection onGetAccess={handleGetAccess} />
            <ProblemSection onGetAccess={handleGetAccess} />
            <JobsSection onGetAccess={handleGetAccess} />
            <HowItWorksSection />
            <VideoSection />
            <MidCTASection onGetAccess={handleGetAccess} />
            <FAQSection />
            <ReviewsSection />
            <FounderCTASection onGetAccess={handleGetAccess} />
            <Footer />
        </div>
    );
}
