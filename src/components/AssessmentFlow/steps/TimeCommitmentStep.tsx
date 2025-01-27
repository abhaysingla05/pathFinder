// components/AssessmentFlow/steps/TimeCommitmentStep.tsx
import { AssessmentData } from "../types";
import React, { useState } from 'react';

interface TimeCommitmentStepProps {
  data: AssessmentData;
  onNext: (data: AssessmentData) => void;
}

const TIME_OPTIONS = [
  { value: 5, label: '5 hours/week', description: 'Casual pace - 1 hour per day' },
  { value: 10, label: '10 hours/week', description: 'Regular pace - 2 hours per day' },
  { value: 15, label: '15 hours/week', description: 'Intensive pace - 3 hours per day' },
  { value: 20, label: '20 hours/week', description: 'Full-time pace - 4 hours per day' },
];

export const TimeCommitmentStep = ({ data, onNext }: TimeCommitmentStepProps) => {
  const [timeCommitment, setTimeCommitment] = useState<number>(data.timeCommitment || 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ ...data, timeCommitment });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto py-12">
      <h2 className="text-3xl font-bold mb-8">Time Commitment</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-lg mb-4">How many hours per week can you dedicate?</label>
          <div className="space-y-3">
            {TIME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTimeCommitment(option.value)}
                className={`w-full p-4 rounded-lg border transition-all ${
                  timeCommitment === option.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-200 hover:border-blue-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-sm opacity-80">{option.description}</span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Custom input option */}
          <div className="mt-4">
            <label className="block text-sm text-gray-600 mb-2">Or enter custom hours:</label>
            <input
              type="number"
              value={timeCommitment}
              onChange={(e) => setTimeCommitment(Number(e.target.value))}
              className="w-full p-3 border rounded-lg"
              min="1"
              max="40"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full mt-8"
        disabled={timeCommitment < 1}
      >
        Next: Knowledge Assessment →
      </button>
    </form>
  );
};