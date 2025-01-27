import { RoadmapData } from "../types";
// components/AssessmentFlow/steps/RoadmapDisplay.tsx


interface RoadmapDisplayProps {
  data: RoadmapData;
  onClose: () => void;
}

export const RoadmapDisplay = ({ data, onClose }: RoadmapDisplayProps) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h2 className="text-4xl font-bold mb-8 text-center">Your AI-Powered Learning Path</h2>
      
      <div className="space-y-8">
        {data.weeks.map((week) => (
          <div key={week.week} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                {week.week}
              </div>
              <h3 className="text-xl font-semibold">Week {week.week}</h3>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2 text-gray-700">Topics to Master:</h4>
              <div className="flex flex-wrap gap-2">
                {week.topics.map((topic) => (
                  <span 
                    key={topic} 
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-gray-700">Curated Resources:</h4>
              <div className="space-y-2">
                {week.resources.map((res) => (
                  <a
                    key={res.title}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                  >
                    <span className="text-blue-600 text-xl">
                      {res.type === 'video' ? '▶️' : '📄'}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{res.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{new URL(res.url).hostname}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Learning Journey
        </button>
      </div>
    </div>
  );
};