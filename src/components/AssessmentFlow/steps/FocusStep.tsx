import { AssessmentData } from "../types";

interface FocusStepProps {
  data: AssessmentData;
  onNext: (data: AssessmentData) => Promise<void>;
}

export const FocusStep = ({ data, onNext }: FocusStepProps) => {
  const toggleFocusArea = (area: string) => {
    const newAreas = data.focusAreas.includes(area)
      ? data.focusAreas.filter(a => a !== area)
      : [...data.focusAreas, area];
    onNext({ ...data, focusAreas: newAreas });
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h2 className="text-3xl font-bold mb-8">Where do you need help?</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        {['Foundations', 'Projects', 'Theory', 'Tools'].map((area) => (
          <button
            key={area}
            type="button"
            onClick={() => toggleFocusArea(area)}
            className={`p-4 rounded-lg border ${
              data.focusAreas.includes(area)
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      <button
        type="button" // Add this
        onClick={async () => await onNext(data)}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full"
      >
        Generate Personalized Quiz →
      </button>
    </div>
  );
};