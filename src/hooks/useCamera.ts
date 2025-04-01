
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
    console.error('Camera error:', errorMessage);
    setError(errorMessage);
    setIsCapturing(false);
    
    if (onError) {
      onError(errorMessage);
    }
  }, [onError]);

  // Cleanup function to stop all tracks
  const cleanup = useCallback(() => {
    console.log('Cleaning up camera...');
    
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log('Stopping track:', track.label);
        track.stop();
      });
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCapturing(false);
  }, [stream]);

  // Wait for video element to be ready
  const waitForVideoElement = useCallback(async (maxWaitTime = 2000, interval = 100): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check right away first
      if (videoRef.current) {
        console.log('Video element found immediately');
        return resolve();
      }
      
      console.log('Waiting for video element to be ready...');
      let waitTime = 0;
      
      const checkInterval = setInterval(() => {
        if (videoRef.current) {
          console.log('Video element found after waiting');
          clearInterval(checkInterval);
          resolve();
        } else if (waitTime >= maxWaitTime) {
          console.error('Timed out waiting for video element');
          clearInterval(checkInterval);
          reject(new Error('Video element not available after waiting'));
        }
        waitTime += interval;
      }, interval);
    });
  }, []);

  // Initialize and get access to the camera
  const initializeCamera = useCallback(async (deviceId?: string) => {
    try {
      setError(null);
      
      // Clean up any existing streams first
      cleanup();
      
      setIsCapturing(true);

      console.log('Initializing camera with deviceId:', deviceId || 'default');
      
      // Request camera access with better constraints
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'user',
          width: { ideal: width },
          height: { ideal: height },
          ...(deviceId ? { deviceId: { exact: deviceId } } : {})
        },
        audio: false
      };

      console.log('Requesting camera access with constraints:', JSON.stringify(constraints));
      
      // Wait for video element to be available
      try {
        await waitForVideoElement();
      } catch (err) {
        throw new Error(`Video element not ready: ${err instanceof Error ? err.message : 'unknown error'}`);
      }
      
      // Wait a moment to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 200));
      
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Camera access granted, tracks:', mediaStream.getTracks().map(t => `${t.label} (enabled: ${t.enabled})`));
        
        if (!mediaStream || mediaStream.getVideoTracks().length === 0) {
          throw new Error('No video tracks available in the media stream');
        }
        
        setStream(mediaStream);

        // Double check video ref is still available
        if (!videoRef.current) {
          throw new Error('Video element not available after stream acquisition');
        }
        
        // Set video source and play
        const video = videoRef.current;
        video.srcObject = mediaStream;
        video.playsInline = true;  // Important for iOS
        
        try {
          // Try to play the video
          await video.play();
          console.log('Video playback started');
          
          // Wait for the video to have valid dimensions
          await new Promise<void>((resolve, reject) => {
            const checkDimensions = () => {
              if (!videoRef.current) {
                return reject('Video element lost during dimension check');
              }
              
              if (videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
                console.log('Video has valid dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
                resolve();
              } else {
                console.log('Waiting for valid video dimensions...');
                setTimeout(checkDimensions, 100);
              }
            };
            
            checkDimensions();
          });
          
        } catch (playError) {
          console.error('Error playing video:', playError);
          throw new Error('Could not play video stream');
        }
        
        // Get available video devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Available video devices:', videoDevices.map(d => d.label || 'Unlabeled device'));
        setDevices(videoDevices);

        // Set current device ID if not already set
        if (deviceId) {
          setCurrentDeviceId(deviceId);
        } else if (!currentDeviceId && videoDevices.length > 0) {
          setCurrentDeviceId(videoDevices[0].deviceId);
        }
        
        // Reset attempt count on success
        setAttemptCount(0);
      } catch (err) {
        console.error('Error accessing camera:', err);
        
        // Check if we should retry
        if (attemptCount < maxAttempts) {
          console.log(`Retrying camera access (attempt ${attemptCount + 1}/${maxAttempts})...`);
          setAttemptCount(prev => prev + 1);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          await initializeCamera(deviceId);
        } else {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          handleError(`Could not access the camera: ${errorMessage}. Please check your camera permissions in browser settings.`);
        }
      }
    } catch (err) {
      console.error('Error in initializeCamera:', err);
      handleError('An unexpected error occurred while setting up the camera');
    }
  }, [width, height, cleanup, handleError, attemptCount, maxAttempts, currentDeviceId, waitForVideoElement]);

  // Switch between available cameras
  const switchCamera = useCallback(() => {
    if (devices.length <= 1) return;
    
    const currentIndex = devices.findIndex(device => device.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDeviceId = devices[nextIndex].deviceId;
    
    console.log(`Switching camera from ${currentIndex} to ${nextIndex}`);
    setCurrentDeviceId(nextDeviceId);
    initializeCamera(nextDeviceId);
  }, [devices, currentDeviceId, initializeCamera]);

  // Capture an image from the video stream
  const captureImage = useCallback(() => {
    if (!videoRef.current) {
      handleError('Video element not available');
      return null;
    }
    
    const video = videoRef.current;
    
    // Make sure video dimensions are valid and video is playing
    if (!video.videoWidth || !video.videoHeight || video.paused || video.ended) {
      handleError('Video stream not ready or has zero dimensions');
      return null;
    }
    
    if (!canvasRef.current) {
      handleError('Canvas element not available');
      return null;
    }
    
    try {
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        handleError('Cannot get canvas context');
        return null;
      }
      
      console.log(`Capturing image with dimensions: ${canvas.width}x${canvas.height}`);
      // Draw the video frame to the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get the image data to verify we captured something
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Check if the image is completely black (or nearly black)
      let totalBrightness = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        totalBrightness += r + g + b;
      }
      
      // If the average brightness is very low, image might be black
      const avgBrightness = totalBrightness / (imageData.width * imageData.height * 3);
      if (avgBrightness < 5) { // Threshold for "mostly black"
        console.warn(`Image appears to be mostly black (avg brightness: ${avgBrightness.toFixed(2)})`);
        handleError('Captured image appears to be blank. Please ensure your camera is working properly and well lit.');
        return null;
      }
      
      return canvas.toDataURL('image/jpeg', 0.9);
    } catch (err) {
      console.error('Error capturing image:', err);
      handleError('Failed to capture image');
      return null;
    }
  }, [handleError]);

  // Handle device changes
  useEffect(() => {
    const handleDeviceChange = async () => {
      console.log('Device change detected');
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Updated video devices:', videoDevices.map(d => d.label || 'Unlabeled device'));
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
