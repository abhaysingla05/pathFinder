///src/components/AssessmentFlow/ProgressBar.tsx
interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
  }
  
  export const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
    return (
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Step {currentStep + 1} of {totalSteps}
        </p>
      </div>
    );
  };