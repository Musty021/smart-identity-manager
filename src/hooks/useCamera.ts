
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
  const isVideoReady = useRef(false);

  // Handle errors internally and also send to parent if callback provided
  const handleError = useCallback((errorMessage: string) => {
    console.error('Camera error:', errorMessage);
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
      isVideoReady.current = false;
      
      // Clean up any existing streams first
      if (stream) {
        console.log('Cleaning up existing stream before initializing camera');
        stream.getTracks().forEach(track => {
          console.log('Stopping track:', track.label);
          track.stop();
        });
      }
      
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
      
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Camera access granted, tracks:', mediaStream.getTracks().map(t => `${t.label} (enabled: ${t.enabled})`));
        
        if (!mediaStream || mediaStream.getVideoTracks().length === 0) {
          throw new Error('No video tracks available in the media stream');
        }
        
        setStream(mediaStream);

        if (videoRef.current) {
          console.log('Setting video source object');
          videoRef.current.srcObject = mediaStream;
          
          // Add onloadedmetadata handler
          await new Promise<void>((resolve, reject) => {
            if (!videoRef.current) {
              reject(new Error('Video element not available'));
              return;
            }
            
            const onLoadedMetadata = () => {
              if (!videoRef.current) return;
              
              console.log('Video metadata loaded, dimensions:', 
                videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
                
              if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
                reject(new Error('Video dimensions are zero. Check your camera permissions.'));
                return;
              }
              
              videoRef.current.play()
                .then(() => {
                  console.log('Video playback started successfully');
                  isVideoReady.current = true;
                  resolve();
                })
                .catch(err => {
                  console.error('Error playing video:', err);
                  reject(err);
                });
            };
            
            // Set up event handlers
            videoRef.current.onloadedmetadata = onLoadedMetadata;
            
            // If metadata is already loaded, call the handler directly
            if (videoRef.current.readyState >= 1) {
              onLoadedMetadata();
            }
            
            videoRef.current.onerror = (event) => {
              console.error('Video element error:', event);
              reject(new Error('Video element encountered an error'));
            };
            
            // Add safety timeout
            const timeoutId = setTimeout(() => {
              reject(new Error('Timeout waiting for video to be ready'));
            }, 10000);
            
            // Clear timeout on success
            videoRef.current.oncanplay = () => {
              clearTimeout(timeoutId);
              console.log('Video can play event fired');
              isVideoReady.current = true;
              resolve();
            };
          });
        } else {
          console.error('Video ref is null');
          throw new Error('Video element not available');
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
    
    if (!isVideoReady.current) {
      handleError('Video stream not ready yet. Please wait a moment and try again.');
      return null;
    }
    
    // Make sure video dimensions are valid
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      handleError('Video stream not ready or has zero dimensions');
      return null;
    }
    
    if (!canvasRef.current) {
      handleError('Canvas element not available');
      return null;
    }
    
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      console.log(`Capturing image with dimensions: ${canvas.width}x${canvas.height}`);
      // Draw the video frame to the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Check if the captured image contains any non-transparent pixels
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let hasContent = false;
      
      // Check a sample of pixels to see if we have actual content (not all black)
      for (let i = 0; i < imageData.length; i += 16) {
        // Check if this pixel has any non-zero RGB values
        if (imageData[i] > 5 || imageData[i + 1] > 5 || imageData[i + 2] > 5) {
          hasContent = true;
          break;
        }
      }
      
      if (!hasContent) {
        console.warn('Captured image appears to be completely black');
      }
      
      return canvas.toDataURL('image/jpeg');
    }
    
    return null;
  }, [handleError]);

  // Clean up function to stop all tracks
  const cleanup = useCallback(() => {
    console.log('Cleaning up camera...');
    isVideoReady.current = false;
    
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log('Stopping track:', track.label);
        track.stop();
      });
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
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
