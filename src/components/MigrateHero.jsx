import React, { useState } from 'react';
import { Search, Star, Sliders, MapPin, X, Building, Briefcase, GraduationCap, Clock, Mail, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const JOBS_DATA = [
    {
        id: 1,
        company: "Medical University of South Carolina",
        logo: "https://www.google.com/s2/favicons?domain=musc.edu&sz=128",
        title: "Registered Nurse",
        location: "Florence, South Carolina",
        time: "New 2h ago",
        functions: ["Nursing", "Healthcare Administration", "Patient Services & Wellbeing"],
        type: "On Site",
        education: "Associate's",
        commitment: "Full Time",
        email: "hr-visa@musc.edu",
        sponsorshipCount: "28+",
        visas: ["H-1B", "E-3", "F-1 OPT", "F-1 CPT"],
        note: "If you are an F-1 student on CPT, OPT or STEM OPT, you have work authorization in the U.S. and do not require employer visa sponsorship for this role."
    },
    {
        id: 2,
        company: "Amazon",
        logo: "https://www.google.com/s2/favicons?domain=amazon.com&sz=128",
        title: "Cloud Solutions Architect",
        location: "Seattle, WA",
        time: "4h ago",
        functions: ["Cloud Computing", "Solutions Architecture", "Software Development"],
        type: "Hybrid",
        education: "Bachelor's",
        commitment: "Full Time",
        email: "sponsorship@amazon.com",
        sponsorshipCount: "12,000+",
        visas: ["H-1B", "Green Card", "L-1"],
        note: "Amazon provides comprehensive sponsorship for technical roles. Candidates with active OPT are encouraged to apply."
    },
    {
        id: 3,
        company: "Google",
        logo: "https://www.google.com/s2/favicons?domain=google.com&sz=128",
        title: "UX Architecture Lead",
        location: "Mountain View, CA",
        time: "1h ago",
        functions: ["UX Design", "Product Strategy", "User Research"],
        type: "On Site",
        education: "Master's",
        commitment: "Full Time",
        email: "global-talent@google.com",
        sponsorshipCount: "8,500+",
        visas: ["H-1B", "Green Card", "O-1"],
        note: "Google is a leading sponsor of international talent. We handle all visa processing costs for eligible H1B candidates."
    }
];

const CompanyLogo = ({ logo, company, className = "w-8 h-8" }) => {
    const [imgSrc, setImgSrc] = useState(logo);
    const [hasError, setHasError] = useState(false);
    const [useFallback, setUseFallback] = useState(false);

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const handleError = () => {
        if (!useFallback) {
            // Try Google Favicon service as a first fallback
            const domain = logo.split('/').pop();
            setImgSrc(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
            setUseFallback(true);
        } else {
            setHasError(true);
        }
    };

    if (hasError) {
        return (
            <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center text-[10px] font-black text-gray-400 uppercase tracking-tighter`}>
                {getInitials(company)}
            </div>
        );
    }

    return (
        <img
            src={imgSrc}
            alt={company}
            className={`${className} object-contain`}
            onError={handleError}
        />
    );
};

const JobCard = ({ job, isSelected, onClick }) => (
    <div
        onClick={() => onClick(job)}
        className={`p-5 rounded-2xl border transition-all cursor-pointer group ${isSelected
            ? 'bg-white border-yellow-400 shadow-lg ring-1 ring-yellow-400/20'
            : 'bg-white border-gray-100 hover:border-[#24385E]/30 hover:shadow-md'
            }`}
    >
        <div className="flex gap-4 items-start">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-50 overflow-hidden">
                <CompanyLogo logo={job.logo} company={job.company} className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[13px] font-bold text-gray-500 mb-0.5">{job.company}</p>
                        <h3 className="text-base font-black text-[#24385E] leading-tight mb-2 group-hover:text-yellow-600 transition-colors">{job.title}</h3>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center mb-3">
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                        <MapPin size={12} /> {job.location}
                    </div>
                    <span className="text-[11px] font-black text-emerald-500 uppercase">{job.time}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {job.visas.slice(0, 3).map(v => (
                        <span key={v} className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[9px] font-black rounded uppercase tracking-widest">{v}</span>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const JobDetailView = ({ job, onClose }) => {
    if (!job) return null;

    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-2xl p-8 sticky top-24 animate-fadeIn text-left">
            <div className="flex justify-between items-start mb-8">
                <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-50 overflow-hidden">
                        <CompanyLogo logo={job.logo} company={job.company} className="w-12 h-12" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 mb-1 leading-none">{job.company}</p>
                        <h2 className="text-2xl font-black text-[#24385E] leading-tight mb-1">{job.title}</h2>
                        <p className="text-sm font-bold text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                            <MapPin size={14} className="text-yellow-500" /> {job.location}
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="space-y-8">
                {/* Job Functions */}
                <div>
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Job Functions</h4>
                    <div className="flex flex-wrap gap-2">
                        {job.functions.map(f => (
                            <span key={f} className="px-3 py-1.5 bg-white border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg shadow-sm">{f}</span>
                        ))}
                    </div>
                </div>

                {/* Logistics Grid */}
                <div className="grid grid-cols-2 gap-y-4">
                    <div className="flex items-center gap-2.5 text-[#24385E] text-sm font-bold">
                        <Building size={16} className="text-yellow-500" /> {job.type}
                    </div>
                    <div className="flex items-center gap-2.5 text-[#24385E] text-sm font-bold">
                        <GraduationCap size={16} className="text-yellow-500" /> {job.education}
                    </div>
                    <div className="flex items-center gap-2.5 text-[#24385E] text-sm font-bold">
                        <Clock size={16} className="text-yellow-500" /> {job.commitment}
                    </div>
                    <div className="flex items-center gap-2.5 text-[#24385E] text-sm font-bold">
                        <Mail size={16} className="text-yellow-500" /> {job.email}
                    </div>
                </div>

                {/* Sponsorship Stats */}
                <div className="pt-4 border-t border-gray-50">
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">{job.sponsorshipCount} total visas sponsored in the last year</h4>
                    <div className="flex flex-wrap gap-3">
                        {job.visas.map(v => (
                            <span key={v} className="px-4 py-2 bg-[#fafafa] text-[#24385E] text-[12px] font-black rounded-xl border border-gray-100 uppercase tracking-widest">{v}</span>
                        ))}
                    </div>
                </div>

                {/* Work Auth Note */}
                <div className="p-5 bg-yellow-50/30 rounded-2xl border border-yellow-100/50">
                    <h4 className="text-sm font-black text-[#24385E] flex items-center gap-2 mb-2 uppercase tracking-tight">
                        <Info size={16} className="text-yellow-500" /> Work authorization note
                    </h4>
                    <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                        {job.note}
                    </p>
                </div>

                <button className="w-full py-4 bg-[#24385E] hover:bg-[#1a2a47] text-white font-black text-lg rounded-full shadow-xl transition-all transform hover:scale-[1.02]">
                    Apply for this role
                </button>
            </div>
        </div>
    );
};

const MigrateHero = () => {
    const [selectedJob, setSelectedJob] = useState(JOBS_DATA[0]);
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <section className="relative overflow-hidden text-center">
            {/* Hero Header Area - Self-contained background */}
            <div className="relative pt-24 pb-16 px-6 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 bottom-0 z-0">
                    <img
                        src="/hero-bg.png"
                        alt="Times Square Wage Level"
                        className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-[#24385E]/40"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex justify-center gap-0.5 mb-3">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-white text-xs font-bold mb-4 tracking-wide drop-shadow-sm uppercase">Trusted by 30,000+ job seekers</p>
                    <h1 className="text-[28px] md:text-[44px] font-[900] text-white leading-[1.1] tracking-tight mb-6 drop-shadow-lg max-w-2xl mx-auto">
                        Land your dream job in the U.S.
                    </h1>
                    {/* {user ? (
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="inline-block px-7 py-3 bg-[#24385E] hover:bg-[#1a2a47] text-white font-black text-sm rounded-full shadow-2xl transition-all transform hover:scale-105"
                        >
                            Go to Dashboard
                        </button>
                    ) : (
                        <Link to="/signup" className="inline-block px-7 py-3 bg-[#24385E] hover:bg-[#1a2a47] text-white font-black text-sm rounded-full shadow-2xl transition-all transform hover:scale-105">
                            Get Access Today
                        </Link>
                    )} */}
                </div>
            </div>

            {/* Content Area: Search & Jobs */}
            <div className="relative z-20 mt-12 max-w-6xl mx-auto px-6 pb-20">
                <div className="bg-[#fafafa] rounded-[32px] md:rounded-[48px] shadow-2xl overflow-hidden">
                    <div className="pt-10 pb-12 px-6 md:px-10">
                        <h2 className="text-xl md:text-2xl font-black text-[#24385E] mb-2 tracking-tight">Search for your perfect role.</h2>
                        <p className="text-gray-400 font-bold text-xs mb-8 uppercase tracking-widest">Data verified by the U.S. Government.</p>

                        <div className="max-w-3xl mx-auto mb-10">
                            <div className="bg-white rounded-full p-2 shadow-lg border border-white flex items-center pr-3">
                                <div className="pl-4 text-gray-300">
                                    <Search size={18} strokeWidth={3} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search & find your dream job"
                                    className="flex-1 bg-transparent border-none outline-none px-3 text-sm font-bold text-[#1F2937] placeholder:text-gray-300"
                                />
                                <button className="bg-[#24385E] hover:bg-[#1a2a47] text-white font-black px-6 py-3 rounded-full transition-all text-sm">
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Main Split Interface */}
                        <div className="grid lg:grid-cols-2 gap-10 items-start text-left">
                            {/* List Column */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-5 px-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        Showing <span className="text-[#24385E] underline decoration-yellow-400 decoration-2">3 of 500,000+ jobs</span>
                                    </span>
                                    <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-100 rounded-full shadow-sm text-xs font-black text-[#24385E]">
                                        <Sliders size={14} strokeWidth={3} className="text-yellow-500" /> Filters <span className="w-4 h-4 bg-[#24385E] text-white rounded-full flex items-center justify-center text-[9px]">2</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {JOBS_DATA.map(job => (
                                        <JobCard
                                            key={job.id}
                                            job={job}
                                            isSelected={selectedJob?.id === job.id}
                                            onClick={setSelectedJob}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Details Column (The Screenshot Part) */}
                            <div className="hidden lg:block">
                                {selectedJob ? (
                                    <JobDetailView
                                        job={selectedJob}
                                        onClose={() => setSelectedJob(null)}
                                    />
                                ) : (
                                    <div className="h-full min-h-[500px] border-2 border-dashed border-gray-200 rounded-[32px] flex items-center justify-center text-gray-400 bg-gray-50/50">
                                        <p className="font-bold">Select a job to view details</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MigrateHero;
