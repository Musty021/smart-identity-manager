
import React from 'react';
import { CameraOff } from 'lucide-react';

interface CameraErrorProps {
  errorMessage: string;
}

const CameraError: React.FC<CameraErrorProps> = ({ errorMessage }) => {
  if (!errorMessage) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 w-full">
      <div className="flex">
        <CameraOff className="h-5 w-5 text-red-500 mr-2" />
        <p className="text-sm">{errorMessage}</p>
      </div>
    </div>
  );
};

export default CameraError;
