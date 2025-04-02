
import { useState, useRef, useCallback, useEffect } from 'react';

interface UseCameraOptions {
  onError?: (error: string) => void;
}

export function useCamera({ onError }: UseCameraOptions = {}) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle errors
  const handleError = useCallback((message: string) => {
    console.error(`Camera error: ${message}`);
    setError(message);
    if (onError) onError(message);
  }, [onError]);

  // Get list of video devices
  const getVideoDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) {
        throw new Error('Browser does not support media devices enumeration');
      }

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      
      console.log(`Found ${videoDevices.length} video devices`);
      setDevices(videoDevices);
      
      if (videoDevices.length > 0 && !activeDeviceId) {
        setActiveDeviceId(videoDevices[0].deviceId);
      }
      
      return videoDevices;
    } catch (err) {
      handleError(`Could not get camera devices: ${err instanceof Error ? err.message : String(err)}`);
      return [];
    }
  }, [activeDeviceId, handleError]);

  // Stop any active media streams
  const stopMediaStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log(`Stopping track: ${track.label}`);
        track.stop();
      });
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsReady(false);
  }, [stream]);

  // Initialize camera with specified device ID
  const startCamera = useCallback(async (deviceId?: string) => {
    try {
      // Reset previous state
      setError(null);
      stopMediaStream();

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Browser does not support media devices API');
      }

      console.log('Starting camera...');
      
      // Get available video devices if not already loaded
      if (devices.length === 0) {
        await getVideoDevices();
      }

      // Set up constraints for camera
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
          ...(deviceId ? { deviceId: { exact: deviceId } } : {})
        },
        audio: false
      };

      console.log('Requesting camera with constraints:', constraints);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Check if we got any video tracks
      if (!mediaStream.getVideoTracks().length) {
        throw new Error('No video track available in media stream');
      }
      
      setStream(mediaStream);
      
      if (!videoRef.current) {
        throw new Error('Video element not available');
      }
      
      // Connect stream to video element
      videoRef.current.srcObject = mediaStream;
      
      // Update active device ID
      if (deviceId) {
        setActiveDeviceId(deviceId);
      }
      
      return true;
    } catch (err) {
      handleError(`Failed to start camera: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }, [devices.length, getVideoDevices, handleError, stopMediaStream]);

  // Switch to another camera
  const switchCamera = useCallback(() => {
    if (devices.length <= 1) {
      console.log('Only one camera available, cannot switch');
      return;
    }
    
    const currentIndex = devices.findIndex(device => device.deviceId === activeDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDeviceId = devices[nextIndex].deviceId;
    
    console.log(`Switching camera from device ${currentIndex} to device ${nextIndex}`);
    startCamera(nextDeviceId);
  }, [activeDeviceId, devices, startCamera]);

  // Capture image from video feed
  const captureImage = useCallback((): string | null => {
    try {
      if (!videoRef.current || !canvasRef.current) {
        handleError('Video or canvas element not available');
        return null;
      }
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (!video.videoWidth || !video.videoHeight || video.paused || video.ended) {
        handleError('Video stream not ready');
        return null;
      }
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        handleError('Could not get canvas context');
        return null;
      }
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Check if image is mostly black (blank camera)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Calculate average brightness
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        totalBrightness += (r + g + b) / 3;
      }
      
      const avgBrightness = totalBrightness / (canvas.width * canvas.height);
      if (avgBrightness < 10) { // Very dark/black threshold
        handleError('Camera image appears to be blank. Please check your camera permissions and lighting.');
        return null;
      }
      
      return canvas.toDataURL('image/jpeg', 0.9);
    } catch (err) {
      handleError(`Failed to capture image: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }, [handleError]);

  // Monitor video readiness
  useEffect(() => {
    if (!videoRef.current || !stream) {
      setIsReady(false);
      return;
    }
    
    const video = videoRef.current;
    
    const checkVideoReady = () => {
      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        setIsReady(true);
      }
    };
    
    // Check immediately
    checkVideoReady();
    
    // Set up event listeners
    const handleCanPlay = () => {
      console.log('Video can play event');
      checkVideoReady();
    };
    
    const handleLoadedMetadata = () => {
      console.log('Video loaded metadata event');
      checkVideoReady();
    };
    
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', checkVideoReady);
    
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', checkVideoReady);
    };
  }, [stream]);

  // Set up device change listener
  useEffect(() => {
    if (!navigator.mediaDevices) return;
    
    const handleDeviceChange = async () => {
      console.log('Media devices changed');
      await getVideoDevices();
    };
    
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    // Initial device enumeration
    getVideoDevices();
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [getVideoDevices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMediaStream();
    };
  }, [stopMediaStream]);

  return {
    videoRef,
    canvasRef,
    isReady,
    error,
    devices,
    activeDeviceId,
    startCamera,
    switchCamera,
    captureImage,
    stopCamera: stopMediaStream,
    hasMultipleCameras: devices.length > 1
  };
}

export default useCamera;
