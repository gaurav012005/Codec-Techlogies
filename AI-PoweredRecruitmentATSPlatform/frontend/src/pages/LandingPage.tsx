import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Stats from '../components/landing/Stats';
import Testimonials from '../components/landing/Testimonials';
import Pricing from '../components/landing/Pricing';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <Navbar />
            <Hero />
            <Features />
            <HowItWorks />
            <Stats />
            <Testimonials />
            <Pricing />
            <CTA />
            <Footer />
        </div>
    );
};

export default LandingPage;
