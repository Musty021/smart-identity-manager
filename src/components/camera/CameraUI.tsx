
import React, { useState, useEffect } from 'react';
import { Camera, RotateCw, X, Check, CameraOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/useCamera';

interface CameraUIProps {
  onCapture: (imageSrc: string) => void;
  onCancel?: () => void;
  width?: number;
  height?: number;
}

const CameraUI: React.FC<CameraUIProps> = ({ 
  onCapture, 
  onCancel,
  width = 480,
  height = 360
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [mode, setMode] = useState<'ready' | 'capturing' | 'review' | 'error'>('ready');
  const [retryCount, setRetryCount] = useState(0);

  const {
    videoRef,
    canvasRef,
    isReady,
    error,
    startCamera,
    stopCamera,
    switchCamera,
    captureImage,
    hasMultipleCameras
  } = useCamera({
    onError: (errorMsg) => {
      console.error("Camera error:", errorMsg);
      setMode('error');
    }
  });

  // Initialize camera on mount or retry
  useEffect(() => {
    let mounted = true;
    
    const initCamera = async () => {
      // Short delay to ensure component is mounted
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!mounted) return;
      
      setMode('capturing');
      console.log("Starting camera...");
      const success = await startCamera();
      if (!mounted) return;
      
      if (!success) {
        console.error("Failed to start camera");
        setMode('error');
      } else {
        console.log("Camera started successfully");
      }
    };
    
    initCamera();
    
    return () => {
      mounted = false;
      stopCamera();
    };
  }, [startCamera, stopCamera, retryCount]);

  // Handle take picture button click
  const handleTakePicture = () => {
    const image = captureImage();
    if (image) {
      setCapturedImage(image);
      setMode('review');
    } else {
      console.error("Failed to capture image");
    }
  };

  // Handle retry button click
  const handleRetry = () => {
    setCapturedImage(null);
    setMode('capturing');
    setRetryCount(prev => prev + 1);
  };

  // Accept the captured image
  const handleAccept = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCamera();
      setCapturedImage(null);
      setMode('ready');
    }
  };

  // Cancel and cleanup
  const handleCancel = () => {
    stopCamera();
    setCapturedImage(null);
    setMode('ready');
    if (onCancel) onCancel();
  };

  // Render preview or captured image
  const renderPreview = () => {
    if (mode === 'review' && capturedImage) {
      return (
        <div className="relative w-full h-full">
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-cover rounded-lg"
            style={{ transform: 'scaleX(-1)' }} // Mirror image
          />
        </div>
      );
    }

    return (
      <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
        {/* Video element for camera stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isReady ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          style={{ transform: 'scaleX(-1)' }} // Mirror for selfie view
        />
        
        {/* Loading overlay */}
        {!isReady && mode === 'capturing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-white mb-2"></div>
            <p className="text-white text-sm">Initializing camera...</p>
          </div>
        )}
      </div>
    );
  };

  // Render UI based on current mode
  const renderUI = () => {
    if (mode === 'ready') {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Camera className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">Camera Access</h3>
          <p className="text-gray-600 text-sm mb-4">
            Click below to enable your camera
          </p>
          <Button
            onClick={() => setMode('capturing')}
            variant="default"
            className="bg-fud-green hover:bg-fud-green-dark"
          >
            <Camera className="h-4 w-4 mr-2" />
            Open Camera
          </Button>
        </div>
      );
    }

    if (mode === 'error') {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <CameraOff className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Camera Error</h3>
          <p className="text-gray-600 text-sm mb-6">
            {error || "Failed to access camera. Please check your camera permissions."}
          </p>
          <div className="flex gap-3">
            <Button
              onClick={handleRetry}
              variant="default"
              className="bg-fud-green hover:bg-fud-green-dark"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            {onCancel && (
              <Button
                onClick={handleCancel}
                variant="outline"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      );
    }

    // Preview container and controls
    return (
      <>
        <div className="relative rounded-lg overflow-hidden shadow-sm bg-black mb-4"
             style={{ width, height, maxWidth: '100%' }}>
          {renderPreview()}
        </div>

        {/* Camera controls */}
        <div className="flex flex-wrap gap-2 justify-center">
          {mode === 'capturing' && (
            <>
              <Button
                onClick={handleTakePicture}
                className="bg-fud-green hover:bg-fud-green-dark"
                disabled={!isReady}
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>

              {hasMultipleCameras && (
                <Button
                  variant="outline"
                  onClick={switchCamera}
                  disabled={!isReady}
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Switch Camera
                </Button>
              )}
            </>
          )}

          {mode === 'review' && (
            <>
              <Button
                onClick={handleAccept}
                className="bg-fud-green hover:bg-fud-green-dark"
              >
                <Check className="h-4 w-4 mr-2" />
                Use Photo
              </Button>

              <Button
                variant="outline"
                onClick={handleRetry}
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Retake
              </Button>
            </>
          )}

          {(mode === 'capturing' || mode === 'review') && onCancel && (
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" width={width} height={height} />
      </>
    );
  };

  return (
    <div className="camera-ui flex flex-col items-center">
      {renderUI()}
    </div>
  );
};

export default CameraUI;
