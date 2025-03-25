
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, Image as ImageIcon, RotateCw, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const [attemptCount, setAttemptCount] = useState(0);
  const maxAttempts = 3;

  // Handle errors internally and also send to parent if callback provided
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setIsCapturing(false);
    
    if (onError) {
      onError(errorMessage);
    }
  }, [onError]);

  // Retry logic with backoff
  const retryInitializeCamera = useCallback(async (deviceId?: string) => {
    if (attemptCount >= maxAttempts) {
      handleError("Maximum retry attempts reached. Please check your camera permissions.");
      return;
    }

    // Exponential backoff
    const backoffTime = Math.pow(2, attemptCount) * 500;
    await new Promise(resolve => setTimeout(resolve, backoffTime));
    
    setAttemptCount(prev => prev + 1);
    initializeCamera(deviceId).catch(err => {
      console.error('Retry failed:', err);
    });
  }, [attemptCount, handleError]);

  // Initialize and get access to the camera
  const initializeCamera = useCallback(async (deviceId?: string) => {
    try {
      setError(null);
      setCapturedImage(null);
      setIsCapturing(true);

      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Request camera access with the specified device (if available)
      const constraints: MediaStreamConstraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId }, width, height, facingMode: 'user' } 
          : { width, height, facingMode: 'user' }
      };

      console.log('Requesting camera access with constraints:', constraints);
      
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          
          // Check if the video is actually streaming data
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            videoRef.current.play().catch(err => {
              console.error('Error playing video:', err);
              handleError('Error starting video stream: ' + err.message);
            });
          };
          
          videoRef.current.onerror = () => {
            handleError('Video element encountered an error');
          };
        }

        // Get available video devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Available video devices:', videoDevices);
        setDevices(videoDevices);

        // Set current device ID if not already set
        if (!currentDeviceId && videoDevices.length > 0) {
          setCurrentDeviceId(videoDevices[0].deviceId);
        }
        
        // Reset attempt count on success
        setAttemptCount(0);
      } catch (err) {
        console.error('Error accessing camera:', err);
        
        // Check if we should retry
        if (attemptCount < maxAttempts) {
          console.log(`Retrying camera access (attempt ${attemptCount + 1}/${maxAttempts})...`);
          retryInitializeCamera(deviceId);
        } else {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          handleError(`Could not access the camera: ${errorMessage}. Please ensure camera permissions are enabled.`);
        }
      }
    } catch (err) {
      console.error('Error in initializeCamera:', err);
      handleError('An unexpected error occurred while setting up the camera');
    }
  }, [width, height, stream, currentDeviceId, handleError, attemptCount, maxAttempts, retryInitializeCamera]);

  // Switch between available cameras
  const switchCamera = useCallback(() => {
    if (devices.length <= 1) return;
    
    const currentIndex = devices.findIndex(device => device.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDeviceId = devices[nextIndex].deviceId;
    
    setCurrentDeviceId(nextDeviceId);
    initializeCamera(nextDeviceId);
  }, [devices, currentDeviceId, initializeCamera]);

  // Capture an image from the video stream
  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Make sure video dimensions are valid
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        handleError('Video stream not ready or has zero dimensions');
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageSrc = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageSrc);
        setIsCapturing(false);
      }
    }
  }, [handleError]);

  // Retake the photo
  const retakeImage = useCallback(() => {
    setCapturedImage(null);
    setIsCapturing(true);
    initializeCamera(currentDeviceId);
  }, [initializeCamera, currentDeviceId]);

  // Accept the captured image
  const acceptImage = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  }, [capturedImage, onCapture]);

  // Initialize camera on component mount
  useEffect(() => {
    console.log('Initializing camera...');
    initializeCamera();

    // Clean up on unmount
    return () => {
      console.log('Cleaning up camera...');
      if (stream) {
        stream.getTracks().forEach(track => {
          console.log('Stopping track:', track.kind, track.label);
          track.stop();
        });
      }
    };
  }, [initializeCamera]);

  // Handle device changes
  useEffect(() => {
    const handleDeviceChange = async () => {
      console.log('Device change detected');
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Updated video devices:', videoDevices);
        setDevices(videoDevices);
      } catch (err) {
        console.error('Error handling device change:', err);
      }
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  return (
    <div className="webcam-capture flex flex-col items-center">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 w-full">
          <div className="flex">
            <CameraOff className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="relative rounded-lg overflow-hidden border border-gray-300 shadow-sm bg-black mb-4"
           style={{ width: width, height: height, maxWidth: '100%' }}>
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

      <canvas ref={canvasRef} className="hidden" />

      {showControls && (
        <div className="flex flex-wrap gap-2 justify-center mt-1">
          {isCapturing ? (
            <>
              <Button 
                type="button" 
                onClick={captureImage}
                className="bg-fud-green hover:bg-fud-green-dark text-white"
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
              
              {devices.length > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={switchCamera}
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
            </>
          ) : capturedImage ? (
            <>
              <Button 
                type="button" 
                onClick={acceptImage}
                className="bg-fud-green hover:bg-fud-green-dark text-white"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Use Photo
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={retakeImage}
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
            </>
          ) : error ? (
            <>
              <Button 
                type="button"
                onClick={() => {
                  setError(null);
                  setAttemptCount(0);
                  initializeCamera();
                }}
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
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
