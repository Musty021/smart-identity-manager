
import { useState, useCallback, useEffect, useRef } from 'react';

interface UseCameraProps {
  width?: number;
  height?: number;
  onError?: (errorMessage: string) => void;
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  stream: MediaStream | null;
  isCapturing: boolean;
  error: string | null;
  devices: MediaDeviceInfo[];
  currentDeviceId: string;
  initializeCamera: (deviceId?: string) => Promise<void>;
  switchCamera: () => void;
  captureImage: () => string | null;
  handleError: (errorMessage: string) => void;
  cleanup: () => void;
}

const useCamera = ({ width = 480, height = 360, onError }: UseCameraProps = {}): UseCameraReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
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
        return null;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg');
      }
    }
    return null;
  }, [handleError]);

  // Clean up function to stop all tracks
  const cleanup = useCallback(() => {
    console.log('Cleaning up camera...');
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind, track.label);
        track.stop();
      });
    }
    setIsCapturing(false);
  }, [stream]);

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

  return {
    videoRef,
    canvasRef,
    stream,
    isCapturing,
    error,
    devices,
    currentDeviceId,
    initializeCamera,
    switchCamera,
    captureImage,
    handleError,
    cleanup
  };
};

export default useCamera;
