
import React, { useState, useEffect, useCallback } from 'react';
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

  // Initialize camera on component mount or after retry
  useEffect(() => {
    console.log('WebcamCapture: Initializing camera...');
    const startCamera = async () => {
      try {
        await initializeCamera();
      } catch (err) {
        console.error('Failed to initialize camera:', err);
      }
    };
    
    startCamera();

    // Clean up on unmount
    return () => {
      console.log('WebcamCapture: Cleaning up...');
      cleanup();
    };
  }, [initializeCamera, cleanup, retryAttempt]);

  // Handle camera capture
  const handleCaptureImage = useCallback(() => {
    console.log('WebcamCapture: Attempting to capture image');
    const imageSrc = captureImage();
    if (imageSrc) {
      console.log('WebcamCapture: Image captured successfully');
      setCapturedImage(imageSrc);
      setUiMode('review');
    } else {
      console.error('WebcamCapture: Failed to capture image');
      handleError('Failed to capture image. Please try again.');
    }
  }, [captureImage, handleError]);

  // Accept the captured image
  const acceptImage = useCallback(() => {
    if (capturedImage) {
      console.log('WebcamCapture: Image accepted');
      onCapture(capturedImage);
      cleanup(); // Stop the camera after capture is accepted
    }
  }, [capturedImage, onCapture, cleanup]);

  // Retake the photo
  const retakeImage = useCallback(() => {
    console.log('WebcamCapture: Retaking image');
    setCapturedImage(null);
    setUiMode('capturing');
    // Force reinitialization by incrementing retry attempt
    setRetryAttempt(prev => prev + 1);
  }, []);

  // Reset state on error
  const handleRetry = useCallback(() => {
    console.log('WebcamCapture: Retrying after error');
    setCapturedImage(null);
    setUiMode('capturing');
    // Force reinitialization by incrementing retry attempt
    setRetryAttempt(prev => prev + 1);
  }, []);

  // Update UI mode based on error state
  useEffect(() => {
    if (error) {
      console.log('WebcamCapture: Error detected, updating UI mode');
      setUiMode('error');
    }
  }, [error]);

  return (
    <div className="webcam-capture flex flex-col items-center">
      <CameraError errorMessage={error || ''} />

      <CameraPreview
        videoRef={videoRef}
        capturedImage={capturedImage}
        isCapturing={isCapturing && uiMode === 'capturing'}
        width={width}
        height={height}
      />

      <canvas ref={canvasRef} className="hidden" />

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
