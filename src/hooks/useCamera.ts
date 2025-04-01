
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

  // Get available camera devices
  const getVideoDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error('MediaDevices API not supported in this browser');
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('Available video devices:', videoDevices.length);
      videoDevices.forEach((device, index) => {
        console.log(`Device ${index + 1}: ${device.label || 'Unnamed device'} (${device.deviceId})`);
      });
      
      setDevices(videoDevices);
      
      // Set default device if not already set
      if (!currentDeviceId && videoDevices.length > 0) {
        setCurrentDeviceId(videoDevices[0].deviceId);
      }
      
      return videoDevices;
    } catch (err) {
      console.error('Error enumerating devices:', err);
      handleError('Failed to enumerate camera devices');
      return [];
    }
  }, [currentDeviceId, handleError]);

  // Initialize and get access to the camera
  const initializeCamera = useCallback(async (deviceId?: string) => {
    try {
      setError(null);
      
      // Clean up any existing streams first
      cleanup();

      // Check if MediaDevices API is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported in this browser');
      }
      
      console.log('Initializing camera...');
      setIsCapturing(true);
      
      // Get available devices
      const videoDevices = await getVideoDevices();
      
      if (videoDevices.length === 0) {
        throw new Error('No video input devices detected');
      }

      // Set constraints for camera
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: width },
          height: { ideal: height },
          facingMode: 'user',
          ...(deviceId ? { deviceId: { exact: deviceId } } : {})
        },
        audio: false
      };

      console.log('Requesting camera with constraints:', JSON.stringify(constraints));
      
      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('Camera access granted');
      
      // Check if we got video tracks
      if (!mediaStream || mediaStream.getVideoTracks().length === 0) {
        throw new Error('No video tracks available in the media stream');
      }
      
      console.log('Video tracks:', mediaStream.getVideoTracks().length);
      mediaStream.getVideoTracks().forEach(track => {
        console.log(`Track: ${track.label}, Enabled: ${track.enabled}`);
      });
      
      setStream(mediaStream);

      // Ensure video element exists
      if (!videoRef.current) {
        throw new Error('Video element not available');
      }

      // Set up video element
      const video = videoRef.current;
      video.srcObject = mediaStream;
      video.playsInline = true; // Important for iOS

      // Wait for video to be ready before playing
      video.onloadedmetadata = async () => {
        try {
          await video.play();
          console.log('Video playback started');
        } catch (err) {
          console.error('Error playing video:', err);
          handleError('Could not play video stream. Please check your browser permissions.');
        }
      };

      // Update current device ID
      if (deviceId) {
        setCurrentDeviceId(deviceId);
      } else if (videoDevices.length > 0 && !currentDeviceId) {
        setCurrentDeviceId(videoDevices[0].deviceId);
      }

    } catch (err) {
      console.error('Error accessing camera:', err);
      handleError(err instanceof Error ? err.message : 'Failed to access camera');
      setIsCapturing(false);
    }
  }, [width, height, cleanup, handleError, getVideoDevices, currentDeviceId]);

  // Switch between available cameras
  const switchCamera = useCallback(() => {
    if (devices.length <= 1) {
      console.log('Only one camera available, cannot switch');
      return;
    }
    
    const currentIndex = devices.findIndex(device => device.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDeviceId = devices[nextIndex].deviceId;
    
    console.log(`Switching camera from ${currentIndex} to ${nextIndex}`);
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
        handleError('Captured image appears to be blank. Please check your camera and lighting.');
        return null;
      }
      
      return canvas.toDataURL('image/jpeg', 0.9);
    } catch (err) {
      console.error('Error capturing image:', err);
      handleError('Failed to capture image');
      return null;
    }
  }, [handleError]);

  // Check for MediaDevices API support on mount
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      handleError('MediaDevices API is not supported in your browser. Please use a modern browser.');
      return;
    }

    // Initial enumeration of devices
    getVideoDevices();
    
    // Listen for device changes (e.g., camera connected/disconnected)
    const handleDeviceChange = async () => {
      console.log('Device change detected');
      await getVideoDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      cleanup();
    };
  }, [getVideoDevices, handleError, cleanup]);

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
