// components/AssessmentFlow/steps/RoadmapDisplay.tsx
import { useState } from 'react';
import { RoadmapData } from "../../../types/assessment";

interface RoadmapDisplayProps {
  data: RoadmapData;
  onClose: () => void;
}

export const RoadmapDisplay = ({ data, onClose }: RoadmapDisplayProps) => {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeek(expandedWeek === weekNumber ? null : weekNumber);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h2 className="text-4xl font-bold mb-10 text-center text-gray-800">
        Your AI-Powered Learning Path
      </h2>
      
      <div className="space-y-8">
        {data.weeks.map((week) => (
          <div 
            key={week.week}
            className={`bg-white rounded-xl shadow-md border border-gray-200 transition-all duration-300 ${
              expandedWeek === week.week ? 'ring-2 ring-blue-400' : 'hover:shadow-lg'
            }`}
          >
            {/* Week Header */}
            <div 
              className="flex items-center justify-between p-6 cursor-pointer group"
              onClick={() => toggleWeek(week.week)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-inner">
                  {week.week}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Week {week.week}</h3>
                  <p className="text-gray-500">{week.theme}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">{week.weeklyHours} hours</span>
                <svg
                  className={`w-6 h-6 transform transition-transform duration-300 group-hover:text-blue-500 ${expandedWeek === week.week ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Expandable Content */}
            {expandedWeek === week.week && (
              <div className="px-6 pb-6 animate-fadeIn">
                {/* Topics Section */}
                {week.topics && week.topics.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-2 border-b pb-1">Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {week.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium border border-blue-100"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources Section */}
                {week.resources && week.resources.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-2 border-b pb-1">Learning Resources</h4>
                    <div className="space-y-3">
                      {week.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">
                              {resource.type === 'video' 
                                ? '▶️' 
                                : resource.type === 'article' 
                                  ? '📄' 
                                  : '📚'}
                            </span>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-800">{resource.title}</h5>
                              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                <span>{resource.duration}</span>
                                <span>•</span>
                                <span className="capitalize">{resource.difficulty}</span>
                                <span>•</span>
                                <span>{resource.category}</span>
                              </div>
                            </div>
                            <span className="text-blue-600 self-center">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weekly Project Section */}
                {week.project && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2 border-b pb-1">Weekly Project</h4>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <h5 className="font-medium text-green-800">{week.project.title}</h5>
                      <p className="text-sm text-green-700 mt-1">{week.project.description}</p>
                      <p className="text-sm text-green-700 mt-2">
                        Estimated time: {week.project.estimatedHours} hours
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-10 flex justify-center gap-6">
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          Start Learning Journey
        </button>
        <button
          onClick={() => window.print()}
          className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors shadow-md"
        >
          Download Roadmap
        </button>
      </div>
    </div>
  );
};
