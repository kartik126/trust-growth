export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin text-white rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span className="ml-2 text-sm text-white">Processing...</span>
    </div>
  );
} 