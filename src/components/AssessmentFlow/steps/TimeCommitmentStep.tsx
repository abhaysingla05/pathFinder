// components/AssessmentFlow/steps/TimeCommitmentStep.tsx
import { AssessmentData } from "../types";
import React, { useState } from 'react';
interface TimeCommitmentStepProps {
  data: AssessmentData;
  onNext: (data: AssessmentData) => void;
}

export const TimeCommitmentStep = ({ data, onNext }: TimeCommitmentStepProps) => {
  const [timeCommitment, setTimeCommitment] = useState<number>(5); // Default: 5 hours/week

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ ...data, timeCommitment });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto py-12">
      <h2 className="text-3xl font-bold mb-8">Time Commitment</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-lg mb-2">How many hours per week can you dedicate?</label>
          <input
            type="number"
            value={timeCommitment}
            onChange={(e) => setTimeCommitment(Number(e.target.value))}
            className="w-full p-3 border rounded-lg"
            min="1"
            max="20"
          />
        </div>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full mt-8"
      >
        Next: Summary →
      </button>
    </form>
  );
};