
import React, { useEffect, useState } from 'react';
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
  const [videoReady, setVideoReady] = useState(false);

  // Monitor video element for readiness
  useEffect(() => {
    if (!videoRef?.current || !isCapturing) return;
    
    const video = videoRef.current;
    
    const checkVideoReady = () => {
      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        console.log('Video is ready for display, dimensions:', video.videoWidth, 'x', video.videoHeight);
        setVideoReady(true);
      }
    };
    
    // Check if already ready
    checkVideoReady();
    
    // Set up event listeners
    const handleCanPlay = () => {
      console.log('Video can play event triggered');
      checkVideoReady();
    };
    
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleCanPlay);
    
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleCanPlay);
    };
  }, [videoRef, isCapturing]);
  
  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-300 shadow-sm bg-black mb-4"
         style={{ width, height, maxWidth: '100%' }}>
      {isCapturing ? (
        <>
          {!videoReady && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="animate-spin h-8 w-8 border-2 border-fud-green border-t-transparent rounded-full"></div>
            </div>
          )}
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${videoReady ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            style={{ 
              transform: 'scaleX(-1)',  // Mirror for selfie view
              display: 'block',
              backgroundColor: '#000'
            }}
            width={width}
            height={height}
          />
        </>
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
