    // components/AssessmentFlow/steps/SummaryStep.tsx
    import { AssessmentData } from "../types";

    interface SummaryStepProps {
    data: AssessmentData;
    onNext: () => void;
    }

    export const SummaryStep = ({ data, onNext }: SummaryStepProps) => {
    return (
        <div className="max-w-2xl mx-auto py-12">
        <h2 className="text-3xl font-bold mb-8">Review Your Inputs</h2>
        
        <div className="space-y-6">
            <div>
            <h3 className="text-xl font-semibold mb-2">Goal</h3>
            <p className="text-gray-600">{data.goal}</p>
            </div>
            <div>
            <h3 className="text-xl font-semibold mb-2">Skill Level</h3>
            <p className="text-gray-600">{data.skillLevel}/5</p>
            </div>
            <div>
            <h3 className="text-xl font-semibold mb-2">Focus Areas</h3>
            <p className="text-gray-600">{data.focusAreas.join(', ')}</p>
            </div>
        </div>

        <button
            onClick={onNext}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full mt-8"
        >
            Generate Roadmap →
        </button>
        </div>
    );
    };