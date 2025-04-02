
import { useState, useRef, useCallback, useEffect } from 'react';

interface UseCameraStreamOptions {
  onError?: (error: string) => void;
}

export function useCameraStream({ onError }: UseCameraStreamOptions = {}) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle errors
  const handleError = useCallback((message: string) => {
    console.error(`Camera stream error: ${message}`);
    setError(message);
    if (onError) onError(message);
  }, [onError]);

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
            
      return true;
    } catch (err) {
      handleError(`Failed to start camera: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }, [handleError, stopMediaStream]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMediaStream();
    };
  }, [stopMediaStream]);

  return {
    videoRef,
    stream,
    isReady,
    error,
    startCamera,
    stopCamera: stopMediaStream,
  };
}
