
import React, { useState, useEffect, useCallback, useRef } from 'react';
import useCamera from '@/hooks/useCamera';
import CameraError from '@/components/camera/CameraError';
import CameraControls from '@/components/camera/CameraControls';
import CameraPreview from '@/components/camera/CameraPreview';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  onCancel?: () => void;
  onError?: (errorMessage: string) => void;
  showControls?: boolean;
  width?: number;
  height?: number;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({
  onCapture,
  onCancel,
  onError,
  showControls = true,
  width = 480,
  height = 360
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uiMode, setUiMode] = useState<'capturing' | 'review' | 'error'>('capturing');
  const [retryAttempt, setRetryAttempt] = useState(0);
  const componentMounted = useRef(true);
  
  const {
    videoRef,
    canvasRef,
    isCapturing,
    error,
    devices,
    initializeCamera,
    switchCamera,
    captureImage,
    handleError,
    cleanup
  } = useCamera({ 
    width, 
    height, 
    onError 
  });

  // Track component mounting state
  useEffect(() => {
    componentMounted.current = true;
    console.log('WebcamCapture mounted');
    
    return () => {
      componentMounted.current = false;
      console.log('WebcamCapture unmounted');
    };
  }, []);
  
  // Initialize camera when component mounts or after retry
  useEffect(() => {
    console.log('Initializing camera (attempt', retryAttempt, ')');
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(async () => {
      if (!componentMounted.current) {
        console.log('Component not mounted, skipping camera initialization');
        return;
      }
      
      try {
        await initializeCamera();
        console.log('Camera initialization completed');
      } catch (err) {
        console.error('Failed to initialize camera:', err);
      }
    }, 300);
    
    return () => {
      clearTimeout(timer);
    };
  }, [initializeCamera, retryAttempt]);

  // Handle camera capture
  const handleCaptureImage = useCallback(() => {
    console.log('Attempting to capture image');
    const imageSrc = captureImage();
    if (imageSrc) {
      console.log('Image captured successfully');
      setCapturedImage(imageSrc);
      setUiMode('review');
    } else {
      console.error('Failed to capture image');
    }
  }, [captureImage]);

  // Accept the captured image
  const acceptImage = useCallback(() => {
    if (capturedImage) {
      console.log('Image accepted by user');
      onCapture(capturedImage);
      cleanup();
    }
  }, [capturedImage, onCapture, cleanup]);

  // Retake the photo
  const retakeImage = useCallback(() => {
    console.log('Retaking image');
    setCapturedImage(null);
    setUiMode('capturing');
    
    // Force reinitialization of camera
    setTimeout(() => {
      setRetryAttempt(prev => prev + 1);
    }, 100);
  }, []);

  // Reset state on error
  const handleRetry = useCallback(() => {
    console.log('Retrying after error');
    setCapturedImage(null);
    setUiMode('capturing');
    
    // Force reinitialization by incrementing retry attempt
    setTimeout(() => {
      setRetryAttempt(prev => prev + 1);
    }, 100);
  }, []);

  // Update UI mode based on error state
  useEffect(() => {
    if (error) {
      console.log('Error detected, updating UI mode');
      setUiMode('error');
    }
  }, [error]);

  return (
    <div className="webcam-capture flex flex-col items-center">
      {error && <CameraError errorMessage={error} />}

      <CameraPreview
        videoRef={videoRef}
        capturedImage={capturedImage}
        isCapturing={isCapturing && uiMode === 'capturing'}
        width={width}
        height={height}
      />

      <canvas ref={canvasRef} className="hidden" width={width} height={height} />

      {showControls && (
        <CameraControls
          mode={uiMode}
          onCapture={handleCaptureImage}
          onAccept={acceptImage}
          onRetake={retakeImage}
          onCancel={onCancel}
          onRetry={handleRetry}
          onSwitchCamera={switchCamera}
          hasMultipleCameras={devices.length > 1}
        />
      )}
    </div>
  );
};

export default WebcamCapture;
