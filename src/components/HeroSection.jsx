import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const jobExamples = [
    { title: 'Financial Systems Manager', company: 'Coca-Cola', contact: 'jularevalo@cocacola.com', name: 'Jula' },
    { title: 'Software Engineer', company: 'Google', contact: 'hiring@google.com', name: 'Sarah' },
    { title: 'Data Scientist', company: 'Microsoft', contact: 'talent@microsoft.com', name: 'James' },
];

const HeroSection = () => {
    const navigate = useNavigate();
    const [currentJob, setCurrentJob] = useState(0);
    const [step, setStep] = useState(0); // 0: job card, 1: contact, 2: success
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const stepTimers = [
            setTimeout(() => setStep(1), 2000),
            setTimeout(() => setStep(2), 4000),
            setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => {
                    setCurrentJob(prev => (prev + 1) % jobExamples.length);
                    setStep(0);
                    setIsVisible(true);
                }, 400);
            }, 6500),
        ];
        return () => stepTimers.forEach(clearTimeout);
    }, [currentJob]);

    const job = jobExamples[currentJob];

    return (
        <div className="bg-white">
            {/* Hero */}
            <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)' }}>
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Text */}
                        <div>
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-full px-4 py-1.5 mb-6">
                                <span className="text-sm text-white font-medium">Open Job & Visa Platform 🇺🇸</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                                Sick of guessing which companies sponsor visas?
                                <span className="block text-gray-300 mt-2">So are we.</span>
                            </h1>

                            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-xl">
                                That's why we built H1B Wage Level. Now you can easily search & find currently open jobs at companies who sponsor visas. We've done the work so you can skip the painful hours of doom scrolling and rejection emails.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="inline-flex items-center justify-center bg-white text-gray-900 font-bold px-7 py-3.5 rounded-xl hover:bg-gray-100 transition-all text-base shadow-lg"
                                >
                                    Get Access →
                                </button>
                                <button
                                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="inline-flex items-center justify-center border border-white border-opacity-30 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white hover:bg-opacity-10 transition-all text-base"
                                >
                                    How it works
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white border-opacity-10">
                                <div>
                                    <div className="text-2xl font-bold text-white">500K+</div>
                                    <div className="text-sm text-gray-400">Verified open roles</div>
                                </div>
                                <div className="w-px h-10 bg-white bg-opacity-20"></div>
                                <div>
                                    <div className="text-2xl font-bold text-white">6</div>
                                    <div className="text-sm text-gray-400">Visa types supported</div>
                                </div>
                                <div className="w-px h-10 bg-white bg-opacity-20"></div>
                                <div>
                                    <div className="text-2xl font-bold text-white">Daily</div>
                                    <div className="text-sm text-gray-400">New job updates</div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Animated Demo */}
                        <div className="hidden lg:flex items-center justify-center">
                            <div
                                className="w-full max-w-sm transition-all duration-300"
                                style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(10px)' }}
                            >
                                {/* Step 1: Job Card */}
                                <div className={`bg-white rounded-2xl shadow-2xl p-5 mb-3 transition-all duration-500 ${step >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="text-xs text-gray-400 font-medium mb-1">OPEN ROLE</div>
                                            <h3 className="font-bold text-gray-900 text-base">{job.title}</h3>
                                            <p className="text-sm text-gray-500">{job.company}</p>
                                        </div>
                                        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {job.company[0]}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">H-1B</span>
                                        <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">Green Card</span>
                                        <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium">OPT</span>
                                    </div>
                                </div>

                                {/* Step 2: Contact */}
                                <div className={`bg-white rounded-2xl shadow-2xl p-5 mb-3 transition-all duration-500 ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                    <div className="text-xs text-gray-400 font-medium mb-2">VISA CONTACT</div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {job.name[0]}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 text-sm">{job.name}</div>
                                            <div className="text-xs text-gray-500">{job.contact}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 3: Success */}
                                <div className={`bg-green-50 border border-green-200 rounded-2xl shadow-xl p-5 transition-all duration-500 ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-bold text-green-800 text-sm">You got the job!!</div>
                                            <div className="text-xs text-green-600 mt-0.5">We're also committing to sponsoring your H-1B Visa...</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 bg-gray-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How it works</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="text-center">
                            <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Find open jobs that are perfect for you</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Search 500,000+ verified open roles filtered by your visa type, role, and location.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="text-center">
                            <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Contact the person at the company who deals with visas</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Get the verified email of the real person at each company who handles visa sponsorship.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="text-center">
                            <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Apply, interview, and land your dream job</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Apply directly, ace the interview, and secure your visa sponsorship offer.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Platform Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5 mb-6">
                                <span className="text-sm font-semibold text-gray-700">Open Job & Visa Platform 🇺🇸</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                For anyone from any country
                            </h2>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                If you're looking to land a job in the US as a non-US citizen, H1B Wage Level is right for you. Whether you're a recent graduate, a professional with years of experience, or someone with niche skills, H1B Wage Level can help you identify companies that have a proven history of sponsoring visas.
                            </p>

                            <ul className="space-y-3">
                                {[
                                    '500,000+ verified open roles',
                                    'H-1B, F-1 (OPT/CPT), TN, E-3, J-1 & Green Cards',
                                    'Constantly updated with new jobs',
                                    'Salary & company info for every role',
                                    'Verified email of a real company contact per role',
                                    'Cancel anytime',
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-700 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => navigate('/signup')}
                                className="mt-8 inline-flex items-center bg-gray-900 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-gray-700 transition-all text-base"
                            >
                                Get Access →
                            </button>
                        </div>

                        {/* Right: Job Cards Preview */}
                        <div className="space-y-3">
                            {[
                                { title: 'Data Engineer', company: 'hackajob', location: 'Philadelphia, PA', visas: ['Green Card', 'TN', 'OPT', 'CPT'], type: 'On-Site' },
                                { title: 'Software Engineer, Product', company: 'Torch Dental', location: 'New York, NY', visas: ['Green Card', 'OPT'], type: 'On-Site' },
                                { title: 'Devops Engineer II', company: 'Verisk', location: 'Jersey City, NJ', visas: ['H-1B', 'TN', 'Green Card'], type: 'Hybrid' },
                            ].map((job, i) => (
                                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="font-bold text-gray-900">{job.title}</div>
                                            <div className="text-sm text-gray-500">{job.company} · {job.location}</div>
                                        </div>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium flex-shrink-0">{job.type}</span>
                                    </div>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {job.visas.map((v, j) => (
                                            <span key={j} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">{v}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div className="text-center pt-2">
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
                                >
                                    + 499,997 more jobs available →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HeroSection;
