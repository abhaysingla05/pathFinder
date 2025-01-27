// src/components/AssessmentFlow/steps/FocusStep.tsx
import { useEffect, useState } from 'react';
import { AssessmentData } from '../../../types/assessment';
import { generateCustomFocusAreas } from './LearningPaths';
import { LEARNING_PATHS } from './LearningPaths';

interface FocusStepProps {
  data: AssessmentData;
  onNext: (data: AssessmentData) => void;
}
export default function FocusStep({ data, onNext }: FocusStepProps) {
  const [localData, setLocalData] = useState<AssessmentData>(data);
  const [focusOptions, setFocusOptions] = useState<string[]>([]);
  const [customFocusAreas, setCustomFocusAreas] = useState<string[]>([]); // New state for custom areas

  useEffect(() => {
    const getFocusAreas = () => {
      if (data.goal in LEARNING_PATHS) {
        return [...LEARNING_PATHS[data.goal].focusAreas];
      }
      return generateCustomFocusAreas(data.goal);
    };
    
    setFocusOptions(getFocusAreas());
  }, [data.goal]);

  const handleFocusChange = (area: string) => {
    setLocalData((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter((a) => a !== area)
        : [...prev.focusAreas, area],
    }));
  };

  const handleCustomFocus = () => {
    const customArea = prompt('Enter your custom focus area:');
    if (customArea?.trim()) {
      const newCustomArea = customArea.trim();
      setCustomFocusAreas(prev => [...prev, newCustomArea]); // Add to custom areas
      handleFocusChange(newCustomArea); // Add to selected areas
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      if (localData.focusAreas.length > 0) {
        onNext(localData);
      }
    }} className="max-w-2xl mx-auto py-12">
      <h2 className="text-3xl font-bold mb-8">Focus Areas</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-lg mb-2">
            What specific areas do you want to focus on?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* Predefined focus options */}
            {focusOptions.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => handleFocusChange(area)}
                className={`px-4 py-2 rounded-lg ${
                  localData.focusAreas.includes(area) ? 'bg-blue-600 text-white' : 'bg-gray-100'
                }`}
              >
                {area}
              </button>
            ))}
            
            {/* Custom focus areas */}
            {customFocusAreas.map((area) => (
              <button
                key={`custom-${area}`}
                type="button"
                onClick={() => handleFocusChange(area)}
                className={`px-4 py-2 rounded-lg ${
                  localData.focusAreas.includes(area) ? 'bg-blue-600 text-white' : 'bg-gray-100'
                }`}
              >
                {area}
              </button>
            ))}
            
            {/* Add custom focus button */}
            <button
              type="button"
              onClick={handleCustomFocus}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2"
            >
              <span>+</span> Add Custom Focus
            </button>
          </div>
        </div>

        {/* Selected Areas Summary */}
        {localData.focusAreas.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Selected Focus Areas:</p>
            <div className="flex flex-wrap gap-2">
              {localData.focusAreas.map((area) => (
                <span
                  key={area}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                >
                  {area}
                  <button
                    onClick={() => handleFocusChange(area)}
                    className="hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full"
          disabled={localData.focusAreas.length === 0}
        >
          Next: Learning Preferences →
        </button>
      </div>
    </form>
  );
}