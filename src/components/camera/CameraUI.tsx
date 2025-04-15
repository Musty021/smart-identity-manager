
import React from 'react';
import CameraComponent from '@/components/Camera';
import { Button } from '@/components/ui/button';

interface CameraUIProps {
  onCapture: (imageSrc: string) => void;
  onCancel?: () => void;
}

const CameraUI: React.FC<CameraUIProps> = ({ 
  onCapture, 
  onCancel 
}) => {
  return (
    <div className="camera-ui-container w-full">
      <CameraComponent onCapture={onCapture} />
      
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
