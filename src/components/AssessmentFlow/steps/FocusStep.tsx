import { useState } from 'react';
import { AssessmentData } from '../../../types/assessment';

interface FocusStepProps {
  data: AssessmentData;
  onNext: (data: AssessmentData) => void;
}

export default function FocusStep({ data, onNext }: FocusStepProps) {
  const [localData, setLocalData] = useState(data);

  const toggleFocusArea = (area: string) => {
    setLocalData((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter((a) => a !== area)
        : [...prev.focusAreas, area],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(localData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto py-12">
      <h2 className="text-3xl font-bold mb-8">Where do you need help?</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {['Foundations', 'Projects', 'Theory', 'Tools'].map((area) => (
          <button
            key={area}
            type="button"
            onClick={() => toggleFocusArea(area)}
            className={`p-4 rounded-lg border ${
              localData.focusAreas.includes(area)
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full"
        disabled={localData.focusAreas.length === 0}
      >
        Generate Personalized Quiz →
      </button>
    </form>
  );
}