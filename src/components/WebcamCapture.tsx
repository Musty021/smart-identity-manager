
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
  } = useCamera({ width, height, onError });

  // Initialize camera on component mount
  useEffect(() => {
    console.log('Initializing camera...');
    initializeCamera();

    // Clean up on unmount
    return cleanup;
  }, [initializeCamera, cleanup]);

  // Handle camera capture
  const handleCaptureImage = useCallback(() => {
    const imageSrc = captureImage();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setUiMode('review');
    }
  }, [captureImage]);

  // Accept the captured image
  const acceptImage = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  }, [capturedImage, onCapture]);

  // Retake the photo
  const retakeImage = useCallback(() => {
    setCapturedImage(null);
    setUiMode('capturing');
    initializeCamera();
  }, [initializeCamera]);

  // Reset state on error
  const handleRetry = useCallback(() => {
    setCapturedImage(null);
    setUiMode('capturing');
    initializeCamera();
  }, [initializeCamera]);

  // Update UI mode based on error state
  useEffect(() => {
    if (error) {
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
