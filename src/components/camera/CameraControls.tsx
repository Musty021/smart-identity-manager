
import React from 'react';
import { Camera, RotateCw, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraControlsProps {
  mode: 'capturing' | 'review' | 'error';
  onCapture?: () => void;
  onAccept?: () => void;
  onRetake?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
  onSwitchCamera?: () => void;
  hasMultipleCameras?: boolean;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  mode,
  onCapture,
  onAccept,
  onRetake,
  onCancel,
  onRetry,
  onSwitchCamera,
  hasMultipleCameras = false
}) => {
  if (mode === 'capturing') {
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-1">
        <Button 
          type="button" 
          onClick={onCapture}
          className="bg-fud-green hover:bg-fud-green-dark text-white"
        >
          <Camera className="h-4 w-4 mr-2" />
          Capture
        </Button>
        
        {hasMultipleCameras && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onSwitchCamera}
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Switch Camera
          </Button>
        )}
        
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>
    );
  }
  
  if (mode === 'review') {
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-1">
        <Button 
          type="button" 
          onClick={onAccept}
          className="bg-fud-green hover:bg-fud-green-dark text-white"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Use Photo
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={onRetake}
        >
          <RotateCw className="h-4 w-4 mr-2" />
          Retake
        </Button>
        
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>
    );
  }
  
  if (mode === 'error') {
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-1">
        <Button 
          type="button"
          onClick={onRetry}
          className="bg-fud-green hover:bg-fud-green-dark text-white"
        >
          <RotateCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>
    );
  }
  
  return null;
};

export default CameraControls;
