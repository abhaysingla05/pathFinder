import { useState } from 'react';
import { AssessmentData } from '../../../types/assessment';
import { AutocompleteInput } from '../../common/AutocompleteInput';
import { LEARNING_PATHS } from './LearningPaths';



interface GoalStepProps {
  data: AssessmentData;
  onNext: (data: AssessmentData) => void;
}

export default function GoalStep({ data, onNext }: GoalStepProps) {
  const [localData, setLocalData] = useState(data);
  const [isCustomGoal, setIsCustomGoal] = useState(false);

  const handleGoalChange = (value: string) => {
    const isKnownPath = value in LEARNING_PATHS;
    setIsCustomGoal(!isKnownPath);
    setLocalData((prev) => ({ 
      ...prev, 
      goal: value,
      isCustomGoal: !isKnownPath 
    }));
  };

  const handleSkillLevelChange = (level: number) => {
    setLocalData((prev) => ({ ...prev, skillLevel: level }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localData.goal.trim()) {
      onNext({ ...localData, isCustomGoal });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto py-12">
      <h2 className="text-3xl font-bold mb-8">Let's Build Your Path</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-lg mb-2">What do you want to learn?</label>
          <AutocompleteInput
            value={localData.goal}
            onChange={handleGoalChange}
            suggestions={Object.keys(LEARNING_PATHS)}
            allowCustomInput={true}
            placeholder="Enter a learning goal (e.g., Web Development, Photography)"
          />
          {isCustomGoal && (
            <p className="mt-2 text-sm text-gray-600">
              Custom learning path will be generated based on your goal
            </p>
          )}
        </div>

        <div>
          <label className="block text-lg mb-2">Current skill level (1-5)</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleSkillLevelChange(n)}
                className={`px-4 py-2 rounded-lg ${
                  localData.skillLevel === n ? 'bg-blue-600 text-white' : 'bg-gray-100'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-600">
            1 = Beginner, 5 = Expert
          </p>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full"
          disabled={!localData.goal.trim()}
        >
          Next: Focus Areas →
        </button>
      </div>
    </form>
  );
}