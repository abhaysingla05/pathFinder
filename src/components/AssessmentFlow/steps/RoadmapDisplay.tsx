
import { RoadmapData } from "../../../types/assessment";
import { useState } from 'react';

interface RoadmapDisplayProps {
  data: RoadmapData;
  onClose: () => void;
}
// components/AssessmentFlow/steps/RoadmapDisplay.tsx
export const RoadmapDisplay = ({ data, onClose }: RoadmapDisplayProps) => { 
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  const metadata = data.metadata || {
    totalWeeks: 12,
    weeklyCommitment: 0,
    difficulty: 'beginner' as const,
    focusAreas: []
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Your Personalized Learning Path</h2>
        <p className="text-gray-600 mb-8">
          A {metadata.totalWeeks}-week journey customized for your goals and schedule
        </p>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 p-6 rounded-xl">
            <h3 className="font-semibold text-blue-900">Weekly Commitment</h3>
            <p className="text-2xl font-bold text-blue-600">{metadata.weeklyCommitment} hours</p>
          </div>
          <div className="bg-green-50 p-6 rounded-xl">
            <h3 className="font-semibold text-green-900">Difficulty Level</h3>
            <p className="text-2xl font-bold text-green-600 capitalize">{metadata.difficulty}</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl">
            <h3 className="font-semibold text-purple-900">Focus Areas</h3>
            <p className="text-sm font-medium text-purple-600">
              {metadata.focusAreas.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Content */}
      <div className="space-y-6">
        {data.weeks.map((week) => (
          <div 
            key={week.week}
            className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300
              ${expandedWeek === week.week ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}`}
          >
            {/* Week Header */}
            <div 
              className="p-6 cursor-pointer"
              onClick={() => setExpandedWeek(expandedWeek === week.week ? null : week.week)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    {week.week}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Week {week.week}</h3>
                    <p className="text-gray-600">{week.theme}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {week.weeklyHours || metadata.weeklyCommitment} hours
                  </span>
                  <svg
                    className={`w-6 h-6 transform transition-transform ${
                      expandedWeek === week.week ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedWeek === week.week && (
              <div className="px-6 pb-6">
                {/* ... rest of the expanded content ... */}
                
                {/* Project Section */}
                {(week.project || week.projects?.[0]) && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Weekly Project</h4>
                    <div className="p-4 bg-green-50 rounded-lg">
                      {week.project ? (
                        <>
                          <h5 className="font-medium text-green-900">{week.project.title}</h5>
                          <p className="text-sm text-green-800 mt-1">{week.project.description}</p>
                          <p className="text-sm text-green-700 mt-2">
                            Estimated time: {week.project.estimatedHours} hours
                          </p>
                        </>
                      ) : week.projects?.[0] && (
                        <>
                          <h5 className="font-medium text-green-900">{week.projects[0].title}</h5>
                          <p className="text-sm text-green-800 mt-1">{week.projects[0].description}</p>
                          <p className="text-sm text-green-700 mt-2">
                            Estimated time: {week.projects[0].estimatedHours} hours
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-12 flex justify-center gap-4">
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Start Your Learning Journey
        </button>
        <button
          onClick={() => window.print()}
          className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Download Roadmap
        </button>
      </div>
    </div>
  );
};