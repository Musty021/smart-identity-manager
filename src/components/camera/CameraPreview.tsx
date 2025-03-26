
import React from 'react';
import { ImageIcon } from 'lucide-react';

interface CameraPreviewProps {
  videoRef?: React.RefObject<HTMLVideoElement>;
  capturedImage?: string | null;
  isCapturing: boolean;
  width?: number;
  height?: number;
}

const CameraPreview: React.FC<CameraPreviewProps> = ({
  videoRef,
  capturedImage,
  isCapturing,
  width = 480,
  height = 360
}) => {
  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-300 shadow-sm bg-black mb-4"
         style={{ width, height, maxWidth: '100%' }}>
      {isCapturing ? (
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }} // Mirror for selfie view
        />
      ) : capturedImage ? (
        <img 
          src={capturedImage} 
          alt="Captured" 
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }} // Mirror to match video
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
          <ImageIcon size={48} />
        </div>
      )}
    </div>
  );
};

export default CameraPreview;
