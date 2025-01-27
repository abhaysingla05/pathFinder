import { ChevronRight } from 'lucide-react';

interface HeroSectionProps {
  onStartAssessment: () => void;
}

export default function HeroSection({ onStartAssessment }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Your Learning Path,<br />Built Just for You
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
          Discover courses, track progress, and achieve goals with an AI mentor that adapts to your pace and style
        </p>
        <button
          onClick={onStartAssessment}
          className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center mx-auto gap-2"
        >
          Start Your Free Assessment
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
            alt="PathFinder Dashboard"
            className="rounded-lg shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}