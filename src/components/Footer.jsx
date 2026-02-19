import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="bg-white border-t border-gray-100">
            {/* CTA Banner */}
            <div className="bg-gray-900 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                        We built H1B Wage Level for ourselves,<br className="hidden md:block" />
                        now we're sharing it with the world.
                    </h2>
                    <p className="text-gray-400 mb-8 text-lg">Get closer to landing your dream job today.</p>
                    <p className="text-gray-500 mb-8 text-sm">Find US jobs with visa sponsorship. Your path to working in America starts here.</p>
                    <button
                        onClick={() => navigate('/signup')}
                        className="inline-flex items-center bg-white text-gray-900 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all text-base shadow-lg"
                    >
                        Get Access →
                    </button>
                </div>
            </div>

            {/* Footer Links */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                                <span className="text-white font-bold text-sm">H</span>
                            </div>
                            <span className="font-bold text-lg text-gray-900">Wage Level</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                            Access 500,000+ verified U.S. jobs with visa sponsorship. Find H-1B, Green Card, E-3, TN, CPT/OPT, H-1B1, and J-1 friendly roles.
                        </p>
                    </div>

                    {/* About Us */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4 text-sm">About Us</h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">About Us</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Is H1B Wage Level Legit?</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">How to Use H1B Wage Level</a></li>
                        </ul>
                    </div>

                    {/* Application & Career */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4 text-sm">Application & Career Strategy</h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Visa Jobs in New York City</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">H-1B Sponsorship Jobs 2026</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">E-3 Visa: Complete Guide</a></li>
                        </ul>
                    </div>

                    {/* Policy Updates */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4 text-sm">Policy Updates</h3>
                        <ul className="space-y-2.5 text-sm">
                            <li><a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Trump's $100K H-1B fee</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">H-1B Lottery 2026</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Work Auth for Int'l Students</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-gray-100 mt-10 pt-8 flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex flex-wrap gap-4 text-sm">
                        <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Contact Support</a>
                        <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Privacy Policy</a>
                        <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Careers</a>
                        <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Blog</a>
                    </div>
                    <p className="text-gray-400 text-sm">© 2026 H1B Wage Level. All Rights Reserved.</p>
                </div>

                {/* Legal Disclaimer */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400 leading-relaxed">
                        <strong className="text-gray-500">Legal Disclaimer:</strong> H1B Wage Level is a technology platform that provides general immigration information and tools and is not a law firm. Nothing on this website constitutes legal advice or creates an attorney-client relationship. Any legal services are provided independently by licensed immigration attorneys, who are solely responsible for the advice they provide. Immigration outcomes depend on individual circumstances and government decisions and are not guaranteed. For advice specific to your situation, consult a qualified immigration attorney.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
