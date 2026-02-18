import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Menu, X, ChevronDown, ChevronUp, Star, Play,
    Check, Mail, MapPin, DollarSign, ArrowRight
} from 'lucide-react';

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
        text: "I was a bit hesitant at first to subscribe but realised that I really had no other options out there to find currently open jobs that sponsor visas so I thought I'd give H1B Wage Level a try. I'm so happy I did because I've heard back from multiple job openings. This is by far the best job platform I've used.",
        name: 'Alex M.',
        country: '🇮🇳 India',
        year: '2025',
        color: 'from-orange-400 to-red-500',
    },
    {
        title: 'Perfect for international students',
        text: "I'm an international student and have been looking for graduate jobs for a while at companies that'll sponsor me on an H-1B after my OPT ends. It's been really difficult to find this information so when I saw an ad for H1B Wage Level I thought this could be perfect for me and it really was.",
        name: 'Priya S.',
        country: '🇮🇳 India',
        year: '2025',
        color: 'from-blue-400 to-indigo-500',
    },
    {
        title: 'Have had a brilliant experience',
        text: "Have had a brilliant experience with H1B Wage Level, the team are very easy to get in touch with if need be, the website is very easy to navigate through every step of the way. Not to mention it is very cheap to use their services. Things have genuinely changed and I am in a much better space to get sponsored.",
        name: 'James O.',
        country: '🇳🇬 Nigeria',
        year: '2025',
        color: 'from-green-400 to-teal-500',
    },
    {
        title: 'This service is changing my life!',
        text: "This service is changing my life. It's sooo easy to find top jobs in the US & for a very decent price. Can't recommend enough!",
        name: 'Maria L.',
        country: '🇧🇷 Brazil',
        year: '2025',
        color: 'from-purple-400 to-pink-500',
    },
    {
        title: 'Affordable and stress free',
        text: "The platform was incredibly affordable and made finding a high quality job in the US incredibly seamless. I found three companies actively sponsoring within my first week.",
        name: 'Chen W.',
        country: '🇨🇳 China',
        year: '2025',
        color: 'from-yellow-400 to-orange-500',
    },
    {
        title: 'Well thought out and implemented',
        text: "As an Aussie Digital Nomad currently based in Bali I'm interested in working in the US. I find the service well thought out and affordable. A lot of thought has been put in to ensure the user feels comfortable and at ease.",
        name: 'Sarah K.',
        country: '🇦🇺 Australia',
        year: '2025',
        color: 'from-cyan-400 to-blue-500',
    },
];

const COMPANY_LOGOS = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Salesforce', 'Adobe'];

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function Navbar({ onGetAccess }) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [resourcesOpen, setResourcesOpen] = useState(false);
    const resourcesRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (resourcesRef.current && !resourcesRef.current.contains(e.target)) setResourcesOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setOpen(false);
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'border-b border-gray-100'}`}>
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                            <span className="text-white font-black text-sm">H</span>
                        </div>
                        <span className="font-bold text-lg text-gray-900 tracking-tight">H1B Wage Level</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        <a href="#" className="px-3 py-2 text-sm text-gray-600 font-medium hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all">Post a job</a>

                        <div className="relative" ref={resourcesRef}>
                            <button
                                onClick={() => setResourcesOpen(!resourcesOpen)}
                                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 font-medium hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all"
                            >
                                Resources <ChevronDown size={13} className={`transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {resourcesOpen && (
                                <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-gray-100 shadow-xl rounded-2xl py-3 z-50 animate-fadeIn">
                                    <div className="px-4 pb-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">About</p>
                                        {['About Us', 'Is H1B Wage Level Legit?', 'How to Use H1B Wage Level'].map(l => (
                                            <a key={l} href="#" className="block text-sm text-gray-700 hover:text-gray-900 py-1.5 hover:underline">{l}</a>
                                        ))}
                                    </div>
                                    <div className="border-t border-gray-100 mx-3 my-2" />
                                    <div className="px-4">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Policy Updates</p>
                                        {["Trump's $100K H-1B fee", 'H-1B Lottery 2026', 'OPT, CPT, and J-1 Compared'].map(l => (
                                            <a key={l} href="#" className="block text-sm text-gray-700 hover:text-gray-900 py-1.5 hover:underline">{l}</a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={() => scrollTo('pricing-anchor')} className="px-3 py-2 text-sm text-gray-600 font-medium hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all">Pricing</button>
                        <button onClick={() => scrollTo('about-anchor')} className="px-3 py-2 text-sm text-gray-600 font-medium hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all">About Us</button>
                        <Link to="/login" className="px-3 py-2 text-sm text-gray-600 font-medium hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all">Login</Link>
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <button onClick={onGetAccess} className="mm-cta-btn">
                            Get Access
                        </button>
                    </div>

                    {/* Mobile Hamburger */}
                    <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        {open ? <X size={22} className="text-gray-700" /> : <Menu size={22} className="text-gray-700" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {open && (
                <div className="md:hidden bg-white border-t border-gray-100 px-5 py-4 space-y-1 shadow-lg animate-fadeIn">
                    {['Post a job', 'Resources', 'Pricing', 'About Us'].map(l => (
                        <a key={l} href="#" className="block py-2.5 text-sm text-gray-700 font-medium hover:text-gray-900 border-b border-gray-50" onClick={() => setOpen(false)}>{l}</a>
                    ))}
                    <Link to="/login" className="block py-2.5 text-sm text-gray-700 font-medium hover:text-gray-900 border-b border-gray-50" onClick={() => setOpen(false)}>Login</Link>
                    <div className="pt-3">
                        <button onClick={() => { onGetAccess(); setOpen(false); }} className="mm-cta-btn w-full text-center">Get Access</button>
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
        <>
            <section
                className="relative w-full overflow-hidden"
                style={{ marginTop: '64px' }}
            >
                {/* Background image — Golden Gate Bridge */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1600&q=80')`,
                    }}
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

                {/* Centered content */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center px-5 py-20 sm:py-28 min-h-[320px] sm:min-h-[380px]">
                    <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={18} className="text-yellow-400 fill-current drop-shadow" />
                        ))}
                    </div>
                    <p className="text-white/80 text-sm font-medium mb-5 drop-shadow">
                        Trusted by 30,000+ job seekers
                    </p>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-8 drop-shadow-lg max-w-2xl">
                        Land your dream<br />job in the U.S.
                    </h1>
                    <button onClick={onGetAccess} className="mm-hero-cta">
                        Get Access Today
                    </button>
                </div>
            </section>
        </>
    );
}

/* ─────────────────────────────────────────────
   PROBLEM SECTION
───────────────────────────────────────────── */
function ProblemSection({ onGetAccess }) {
    return (
        <section className="py-20 bg-gray-950 text-white">
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                <div className="max-w-3xl">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-6">
                        Sick of guessing which companies sponsor visas?{' '}
                        <span className="text-gray-400">So are we.</span>
                    </h2>
                    <p className="text-lg text-gray-400 leading-relaxed mb-8">
                        That's why we built H1B Wage Level. Now you can easily search & find currently open jobs at companies who sponsor visas.
                        We've done the work so you can skip the painful hours of doom scrolling and rejection emails.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-6 mb-10">
                        {[
                            { icon: '😩', label: 'Hours of doom scrolling', sub: "Wasted on job boards that don't filter by visa" },
                            { icon: '📧', label: 'Rejection emails', sub: 'From companies that never sponsored anyone' },
                            { icon: '🔍', label: 'Guessing games', sub: 'Not knowing which companies actually sponsor' },
                        ].map(({ icon, label, sub }) => (
                            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                <div className="text-2xl mb-3">{icon}</div>
                                <div className="font-bold text-white mb-1">{label}</div>
                                <div className="text-sm text-gray-400">{sub}</div>
                            </div>
                        ))}
                    </div>
                    <button onClick={onGetAccess} className="mm-cta-btn-white">
                        Skip the guesswork → Get Access
                    </button>
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   HOW IT WORKS (ACCORDION)
───────────────────────────────────────────── */
function HowItWorksSection() {
    const [open, setOpen] = useState(0);

    return (
        <section id="how-it-works" className="py-20 bg-white">
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                <div className="text-center mb-14">
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">How it works</h2>
                    <p className="text-gray-500 text-lg">Six simple steps to your dream US job.</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-3">
                    {HOW_STEPS.map((step, idx) => (
                        <div
                            key={step.num}
                            className={`border rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer
                ${open === idx ? 'border-gray-900 shadow-lg' : 'border-gray-100 hover:border-gray-300'}`}
                            onClick={() => setOpen(open === idx ? -1 : idx)}
                        >
                            <div className="flex items-center justify-between px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 transition-colors
                    ${open === idx ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        {step.num}
                                    </div>
                                    <span className={`font-semibold text-base transition-colors ${open === idx ? 'text-gray-900' : 'text-gray-700'}`}>
                                        {step.title}
                                    </span>
                                </div>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                  ${open === idx ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {open === idx ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </div>
                            </div>
                            {open === idx && (
                                <div className="px-6 pb-5 animate-fadeIn">
                                    {step.content}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   VIDEO SECTION
───────────────────────────────────────────── */
function VideoSection() {
    const [playing, setPlaying] = useState(false);

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">See how it works in 2 mins</h2>
                    <p className="text-gray-500">Watch a quick walkthrough of the platform.</p>
                </div>

                <div className="max-w-3xl mx-auto">
                    <div
                        className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-2xl cursor-pointer group"
                        onClick={() => setPlaying(true)}
                    >
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-6xl mb-4">🇺🇸</div>
                                <p className="text-white/60 text-sm">H1B Wage Level Platform Demo</p>
                            </div>
                        </div>
                        {!playing && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                    <Play size={28} className="text-gray-900 ml-1" fill="currentColor" />
                                </div>
                            </div>
                        )}
                        {playing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                                <p className="text-white text-sm">Video would play here</p>
                            </div>
                        )}
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
        <section id="pricing-anchor" className="py-20 bg-white">
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                <div className="bg-gray-950 rounded-3xl p-10 sm:p-14 grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
                            <span className="text-sm font-semibold text-white">Open Job & Visa Platform 🇺🇸</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
                            Sign up. Find a job.<br />Get sponsored, fast.
                        </h2>
                        <p className="text-gray-400 mb-8">For anyone from any country.</p>
                        <button onClick={onGetAccess} className="mm-cta-btn-white">
                            Get Access <ArrowRight size={16} className="inline ml-1" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Check size={11} className="text-white" strokeWidth={3} />
                                </div>
                                <span className="text-gray-300 text-sm font-medium">{f}</span>
                            </div>
                        ))}
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
            a: "If you're looking to land a job in the US as a non-US citizen, H1B Wage Level is right for you. Whether you're a recent graduate, a professional with years of experience, or someone with niche skills, H1B Wage Level can help you identify companies that have a proven history of sponsoring visas. It's designed for job seekers from any country and any industry. All jobs listed are actively hiring.",
        },
        {
            q: 'What visa types are supported?',
            a: 'We support all major US work visas including H-1B, F-1 (OPT/CPT), Green Card, TN (Canada & Mexico), E-3 (Australia), H-1B1 (Chile/Singapore), and J-1. You can filter jobs by your specific visa requirements.',
        },
        {
            q: 'How often are jobs updated?',
            a: "Our database is constantly updated with new jobs from companies actively hiring and sponsoring visas. You'll always have access to the freshest opportunities.",
        },
        {
            q: 'What is the verified email contact feature?',
            a: 'For every job listing, we provide the verified email address of a real person at the company who handles visa sponsorship. This lets you reach out directly — a huge advantage over traditional applications.',
        },
        {
            q: 'Can I cancel my subscription anytime?',
            a: "Yes! Cancel anytime from your account settings. You won't be charged for the next billing period. Access continues until the end of the current period.",
        },
        {
            q: 'Is H1B Wage Level legit?',
            a: 'Absolutely. H1B Wage Level is a legitimate platform built by immigrants for immigrants. Our job data is verified against U.S. Government records including USCIS H-1B disclosure data. We have thousands of satisfied users who have successfully found visa-sponsored employment.',
        },
    ];

    return (
        <section id="faq" className="py-20 bg-gray-50">
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                <div className="text-center mb-14">
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">Frequently Asked Questions</h2>
                    <p className="text-gray-500">Everything you need to know about H1B Wage Level.</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-3">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className={`border rounded-2xl overflow-hidden transition-all cursor-pointer
                ${open === i ? 'border-gray-900 bg-white shadow-md' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                            onClick={() => setOpen(open === i ? null : i)}
                        >
                            <div className="flex items-center justify-between px-6 py-4">
                                <h3 className={`font-semibold text-base pr-4 ${open === i ? 'text-gray-900' : 'text-gray-700'}`}>{faq.q}</h3>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                  ${open === i ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {open === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </div>
                            </div>
                            {open === i && (
                                <div className="px-6 pb-5 animate-fadeIn">
                                    <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                                </div>
                            )}
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
        <section className="py-20 bg-white">
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                <div className="text-center mb-14">
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">Reviews</h2>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        {[...Array(5)].map((_, i) => <Star key={i} size={18} className="text-yellow-400 fill-current" />)}
                        <span className="font-bold text-gray-900 ml-1">4.7 / 5</span>
                    </div>
                    <p className="text-gray-500 text-sm">Trusted by 30,000+ happy jobseekers</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {REVIEWS.map((r, i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, j) => <Star key={j} size={13} className="text-yellow-400 fill-current" />)}
                                </div>
                                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Verified · {r.year}</span>
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2 text-sm">{r.title}</h4>
                            <p className="text-gray-600 text-sm leading-relaxed flex-1">"{r.text}"</p>
                            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-50">
                                <div className={`w-9 h-9 bg-gradient-to-br ${r.color} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                                    {r.name[0]}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">{r.name}</div>
                                    <div className="text-xs text-gray-400">{r.country}</div>
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
        <section id="about-anchor" className="py-20 bg-gray-950">
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                {/* City image placeholder */}
                <div className="w-full h-48 sm:h-64 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-3xl mb-14 flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 flex items-end justify-center pb-6">
                        <svg viewBox="0 0 800 120" className="w-full opacity-30" fill="white">
                            <rect x="50" y="40" width="30" height="80" />
                            <rect x="90" y="20" width="25" height="100" />
                            <rect x="125" y="50" width="20" height="70" />
                            <rect x="155" y="10" width="35" height="110" />
                            <rect x="200" y="30" width="28" height="90" />
                            <rect x="240" y="55" width="22" height="65" />
                            <rect x="272" y="5" width="40" height="115" />
                            <rect x="322" y="25" width="30" height="95" />
                            <rect x="362" y="45" width="25" height="75" />
                            <rect x="397" y="15" width="35" height="105" />
                            <rect x="442" y="35" width="28" height="85" />
                            <rect x="480" y="60" width="20" height="60" />
                            <rect x="510" y="8" width="38" height="112" />
                            <rect x="558" y="28" width="30" height="92" />
                            <rect x="598" y="48" width="22" height="72" />
                            <rect x="630" y="18" width="32" height="102" />
                            <rect x="672" y="38" width="26" height="82" />
                            <rect x="708" y="55" width="20" height="65" />
                            <rect x="738" y="22" width="34" height="98" />
                        </svg>
                    </div>
                    <div className="relative text-center">
                        <div className="text-4xl mb-2">🗽</div>
                        <p className="text-white/40 text-sm">New York City, USA</p>
                    </div>
                </div>

                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
                        We built H1B Wage Level for ourselves, now we're sharing it with the world.
                    </h2>
                    <p className="text-xl text-gray-400 mb-4">Get closer to landing your dream job today.</p>
                    <p className="text-gray-500 mb-10 text-sm">Find US jobs with visa sponsorship. Your path to working in America starts here.</p>
                    <button onClick={onGetAccess} className="mm-cta-btn-white text-base px-10 py-4">
                        Get Access <ArrowRight size={16} className="inline ml-1" />
                    </button>
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
    const cols = [
        {
            heading: 'About',
            links: ['About Us', 'Is H1B Wage Level Legit?', 'How to Use H1B Wage Level', 'Careers'],
        },
        {
            heading: 'Resources',
            links: ['H-1B Guide', 'OPT / CPT Guide', 'E-3 Visa Guide', 'Green Card Guide', 'Blog'],
        },
        {
            heading: 'Support',
            links: ['Contact Support', 'Help Center', 'Status'],
        },
        {
            heading: 'Legal',
            links: ['Privacy Policy', 'Terms of Service', 'Refund Policy'],
        },
    ];

    return (
        <footer className="bg-white border-t border-gray-100">
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-14">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                                <span className="text-white font-black text-sm">H</span>
                            </div>
                            <span className="font-bold text-base text-gray-900">H1B Wage Level</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Access 500,000+ verified U.S. jobs with visa sponsorship. Find H-1B, Green Card, E-3, TN, CPT/OPT, H-1B1, and J-1 friendly roles.
                        </p>
                    </div>

                    {cols.map(col => (
                        <div key={col.heading}>
                            <h4 className="font-bold text-gray-900 text-sm mb-4">{col.heading}</h4>
                            <ul className="space-y-2.5">
                                {col.links.map(l => (
                                    <li key={l}>
                                        <a href="#" className="text-gray-500 text-sm hover:text-gray-900 transition-colors">{l}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-4 text-sm">
                        {['Privacy Policy', 'Careers', 'Blog', 'Contact Support'].map(l => (
                            <a key={l} href="#" className="text-gray-400 hover:text-gray-700 transition-colors">{l}</a>
                        ))}
                    </div>
                    <p className="text-gray-400 text-sm">© 2026 H1B Wage Level. All Rights Reserved.</p>
                </div>

                <div className="mt-6 p-5 bg-gray-50 rounded-2xl">
                    <p className="text-xs text-gray-400 leading-relaxed">
                        <strong className="text-gray-500">Legal Disclaimer:</strong> H1B Wage Level is a technology platform that provides general immigration information and tools and is not a law firm. Nothing on this website constitutes legal advice or creates an attorney-client relationship. Any legal services are provided independently by licensed immigration attorneys, who are solely responsible for the advice they provide. Immigration outcomes depend on individual circumstances and government decisions and are not guaranteed. For advice specific to your situation, consult a qualified immigration attorney.
                    </p>
                </div>
            </div>
        </footer>
    );
}

/* ─────────────────────────────────────────────
   MAIN LANDING PAGE
───────────────────────────────────────────── */
export default function LandingPage() {
    const navigate = useNavigate();
    const handleGetAccess = () => navigate('/signup');

    return (
        <div className="mm-landing">
            <Navbar onGetAccess={handleGetAccess} />
            <HeroSection onGetAccess={handleGetAccess} />
            <ProblemSection onGetAccess={handleGetAccess} />
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
