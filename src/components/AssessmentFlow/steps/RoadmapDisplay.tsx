import { RoadmapData } from "../types";

interface RoadmapDisplayProps {
  data: RoadmapData;
  onClose: () => void;
}

export function RoadmapDisplay({ data, onClose }: RoadmapDisplayProps) {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h2 className="text-4xl font-bold mb-8 text-center">Your AI-Powered Learning Path</h2>
      
      <div className="space-y-8">
        {data.weeks.map((week) => (
          <div key={week.week} className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                {week.week}
              </div>
              <h3 className="text-xl font-semibold">Week {week.week}</h3>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Topics:</h4>
              <div className="flex flex-wrap gap-2">
                {week.topics.map((topic) => (
                  <span 
                    key={topic} 
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Resources:</h4>
              <div className="space-y-2">
                {week.resources.map((res) => (
                  <a
                    key={res.title}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="text-blue-600">
                      {res.type === 'video' ? '▶️' : '📄'}
                    </span>
                    <span className="flex-1">{res.title}</span>
                    <span className="text-sm text-gray-500">{new URL(res.url).hostname}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Close
      </button>
    </div>
  );
}