
import React from 'react';
import CameraComponent from '@/components/Camera';

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
    </div>
  );
};

export default CameraUI;
