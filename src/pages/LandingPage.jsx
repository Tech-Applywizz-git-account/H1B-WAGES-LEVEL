import React, { useEffect } from 'react';
import MigrateNavbar from '../components/MigrateNavbar';
import MigrateHero from '../components/MigrateHero';
import MigrateMiddleSections from '../components/MigrateMiddleSections';
import BuiltByImmigrants from '../components/BuiltByImmigrants';
import MigrateFooterSections from '../components/MigrateFooterSections';

const LandingPage = () => {
    // Scroll to top on load
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "H1-B Wage Level | Land your dream job in the US";
    }, []);

    return (
        <div className="mm-landing bg-slate-50 min-h-screen font-sans selection:bg-[#24385E]/20">
            {/* 1) TOP NAVBAR (Sticky) */}
            <MigrateNavbar />

            <main className="max-w-[1600px] mx-auto space-y-24 md:space-y-40 pb-32">
                {/* 2 & 3) HERO & SEARCH CARD */}
                <div className="pt-8">
                    <MigrateHero />
                </div>

                {/* 4, 5, 6, 7) MIDDLE SECTIONS */}
                <div>
                    <MigrateMiddleSections />
                </div>

                {/* BUILT BY IMMIGRANTS - New Section */}
                <div>
                    <BuiltByImmigrants />
                </div>

                {/* 8, 9, 10) FOOTER SECTIONS */}
                <div>
                    <MigrateFooterSections />
                </div>
            </main>
        </div>
    );
};

export default LandingPage;
