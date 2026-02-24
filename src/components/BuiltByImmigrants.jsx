import React from 'react';
import { useNavigate } from 'react-router-dom';

const BuiltByImmigrants = () => {
    const navigate = useNavigate();

    return (
        <section className="py-32 bg-black relative overflow-hidden text-center">
            {/* Background Splice Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#6366F1]/20 to-transparent"></div>
                <div className="absolute bottom-[-100%] right-[-50%] w-[200%] h-[200%] border-[1px] border-white/5 rotate-45"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6">
                <div className="flex justify-center mb-12">
                    <div className="w-20 h-20 bg-[#FDB913] rounded-[24px] rotate-12 flex items-center justify-center shadow-[0_0_40px_rgba(253,185,19,0.4)]">
                        <div className="w-8 h-1 bg-white/40 rounded-full"></div>
                    </div>
                </div>

                <h2 className="text-[52px] md:text-[64px] font-[900] text-white leading-[0.95] tracking-tight uppercase mb-8">
                    BUILT BY <span className="text-[#FDB913] font-[800]">IMMIGRANTS.</span><br />
                    FOR THE WORLD.
                </h2>

                <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-12">
                    We built H1B Wage Level after experiencing the struggle ourselves. No more guessing. No more dead ends. Just verified paths to your future in the U.S.
                </p>

                <button
                    onClick={() => navigate('/signup')}
                    className="bg-[#FDB913] hover:bg-[#e5a811] text-black font-black px-12 py-5 rounded-2xl text-[18px] transition-all shadow-[0_15px_40px_rgba(253,185,19,0.3)] hover:shadow-[0_20px_50px_rgba(253,185,19,0.4)] hover:-translate-y-1 active:scale-95"
                >
                    Get Started Today
                </button>

                <div className="mt-8">
                    <p className="text-gray-500 font-bold italic text-xs uppercase tracking-widest opacity-60">
                        Cancel anytime. No commitment. 100% Verified.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default BuiltByImmigrants;
