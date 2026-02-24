import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import LiveSponsorships from '../components/LiveSponsorships';
import FutureStartsHere from '../components/FutureStartsHere';
import BuiltByImmigrants from '../components/BuiltByImmigrants';
import SimpleHowItWorks from '../components/SimpleHowItWorks';
import FeaturesSection from '../components/FeaturesSection';
import FAQ from '../components/FAQ';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

const LandingPage = () => {
    // Scroll to top on load
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <main>
                <HeroSection />

                {/* User Requested Sections - Premium Theme */}
                <LiveSponsorships />
                <FutureStartsHere />
                <BuiltByImmigrants />

                {/* Information Sections */}
                <SimpleHowItWorks />
                <FeaturesSection />
                <Testimonials />
                <FAQ />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
