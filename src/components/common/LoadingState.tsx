// common/LoadingState.tsx
interface LoadingStateProps {
  message: string;
  subMessage?: string;
}

export const LoadingState = ({ message, subMessage }: LoadingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
      {subMessage && (
        <p className="mt-2 text-sm text-gray-500">{subMessage}</p>
      )}
    </div>
  );
};