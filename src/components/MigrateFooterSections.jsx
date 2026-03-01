import React from 'react';
import { Star, Play, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const MigrateFooterSections = () => {
    const { user } = useAuth();
    return (
        <div className="space-y-32">


            {/* 10) FOOTER */}
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
                                    <a key={i} href="#" className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-[#24385E] hover:bg-yellow-500 hover:text-white transition-all shadow-sm">
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
                                        <li key={link}><Link to="#" className="text-base font-bold text-gray-500 hover:text-yellow-600 transition-colors">{link}</Link></li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#24385E]">Company</h4>
                                <ul className="space-y-4">
                                    {['About Us', 'Contact', 'Blog', 'Twitter'].map(link => (
                                        <li key={link}><Link to="#" className="text-base font-bold text-gray-500 hover:text-yellow-600 transition-colors">{link}</Link></li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#24385E]">Support</h4>
                                <ul className="space-y-4">
                                    {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(link => (
                                        <li key={link}><Link to="#" className="text-base font-bold text-gray-500 hover:text-yellow-600 transition-colors">{link}</Link></li>
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

const ReviewCard = ({ image, name, rating, text, date }) => (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 text-left hover:shadow-2xl transition-all group">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <img src={image} alt={name} className="w-14 h-14 rounded-full border-2 border-white shadow-md group-hover:scale-110 transition-transform" />
                <div>
                    <h4 className="font-black text-[#24385E] text-base">{name}</h4>
                    <div className="flex gap-0.5">
                        {[...Array(rating)].map((_, i) => (
                            <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                        ))}
                    </div>
                </div>
            </div>
            <span className="text-xs font-black text-gray-300 uppercase">{date}</span>
        </div>
        <p className="text-base text-gray-500 font-bold leading-relaxed italic">
            "{text}"
        </p>
    </div>
);

export default MigrateFooterSections;
