import { useState } from 'react';
import { AssessmentData } from '../../../types/assessment';
import { AutocompleteInput } from '../../common/AutocompleteInput';

const GOAL_SUGGESTIONS = [
  'Web Development',
  'Data Science',
  'Machine Learning',
  'Mobile App Development',
  'UI/UX Design',
  'Digital Marketing',
  'Cloud Computing',
];

interface GoalStepProps {
  data: AssessmentData;
  onNext: (data: AssessmentData) => void;
}

export default function GoalStep({ data, onNext }: GoalStepProps) {
  const [localData, setLocalData] = useState(data);

  const handleGoalChange = (value: string) => {
    setLocalData((prev) => ({ ...prev, goal: value }));
  };

  const handleSkillLevelChange = (level: number) => {
    setLocalData((prev) => ({ ...prev, skillLevel: level }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localData.goal.trim()) {
      onNext(localData);
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
            suggestions={GOAL_SUGGESTIONS}
          />
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