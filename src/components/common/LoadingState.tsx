// export const LoadingState = ({ message }: { message: string }) => {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
//         <div className="relative">
//           {/* Main spinner */}
//           <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          
//           {/* Decorative elements */}
//           <div className="absolute top-0 left-0 w-full h-full">
//             <div className="absolute top-0 left-0 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
//             <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
//           </div>
//         </div>
        
//         <p className="mt-4 text-lg text-gray-700 font-medium">{message}</p>
//         <div className="mt-2 text-sm text-gray-500 text-center max-w-md">
//           <p className="animate-pulse">Building your personalized learning experience...</p>
//         </div>
//       </div>
//     );
//   };
// components/common/LoadingState.tsx
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