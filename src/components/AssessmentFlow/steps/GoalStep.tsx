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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.goal.trim()) {
      onNext(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto py-12">
      <h2 className="text-3xl font-bold mb-8">Let's Build Your Path</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-lg mb-2">What do you want to learn?</label>
          <AutocompleteInput
            value={data.goal}
            onChange={(value) => onNext({ ...data, goal: value })}
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
                onClick={() => onNext({ ...data, skillLevel: n })}
                className={`px-4 py-2 rounded-lg ${
                  data.skillLevel === n ? 'bg-blue-600 text-white' : 'bg-gray-100'
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
          disabled={!data.goal.trim()}
        >
          Next: Focus Areas →
        </button>
      </div>
    </form>
  );
}