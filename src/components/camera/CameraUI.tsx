
import React, { useState } from 'react';
import CameraComponent from '@/components/Camera';
import { Button } from '@/components/ui/button';
import { Camera, AlertCircle } from 'lucide-react';

interface CameraUIProps {
  onCapture: (imageSrc: string) => void;
  onCancel?: () => void;
}

const CameraUI: React.FC<CameraUIProps> = ({ 
  onCapture, 
  onCancel 
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const handleCameraError = (error: string) => {
    console.error('Camera error in CameraUI:', error);
    setCameraError(error);
  };

  return (
    <div className="camera-ui-container w-full">
      {cameraError ? (
        <div className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Camera Error</h3>
          <p className="text-sm text-red-600 text-center mb-4">{cameraError}</p>
          <Button 
            onClick={() => setCameraError(null)}
            className="bg-fud-green hover:bg-fud-green-dark text-white"
          >
            Try Again
          </Button>
        </div>
      ) : (
        <CameraComponent 
          onCapture={onCapture} 
          onError={handleCameraError}
        />
      )}
      
      {onCancel && (
        <div className="mt-4 flex justify-center">
          <Button 
            onClick={onCancel}
            variant="outline"
            className="text-gray-600"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default CameraUI;
