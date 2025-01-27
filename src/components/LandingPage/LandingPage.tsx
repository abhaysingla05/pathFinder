import HeroSection from './components/HeroSection';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

interface LandingPageProps {
  onStartAssessment: () => void;
}

export default function LandingPage({ onStartAssessment }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection onStartAssessment={onStartAssessment} />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </div>
  );
}