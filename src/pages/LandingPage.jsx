import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import LiveSponsorships from '../components/LiveSponsorships';
import SimpleHowItWorks from '../components/SimpleHowItWorks';
import FutureStartsHere from '../components/FutureStartsHere';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

const LandingPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // Scroll to top on load and redirect if logged in
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "H1-B Wage Level | U.S. Visa Sponsorship Job Platform";

        if (!loading && user) {
            navigate('/app', { replace: true });
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#FDB913] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-black min-h-screen selection:bg-[#FDB913]/30">
            <Navbar />
            <main>
                <HeroSection />
                <LiveSponsorships />
                <SimpleHowItWorks />
                <FutureStartsHere />
                <Testimonials />
                <FAQ />
                <Footer />
            </main>
        </div>
    );
};

export default LandingPage;
