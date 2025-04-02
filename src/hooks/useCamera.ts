
import { useState, useRef, useCallback } from 'react';

interface UseCameraOptions {
  onError?: (error: string) => void;
}

export function useCamera({ onError }: UseCameraOptions = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleError = useCallback((message: string) => {
    console.error(`Camera error: ${message}`);
    setError(message);
    if (onError) onError(message);
  }, [onError]);

  const startCamera = useCallback(async (deviceId?: string) => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Browser does not support media devices API');
      }

      // Stop any existing streams
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Set up constraints for camera
      const constraints: MediaStreamConstraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId }, facingMode: 'environment' }
          : { facingMode: 'environment' },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsActive(true);
        setError(null);
      }
      
      return true;
    } catch (err) {
      handleError(`Failed to start camera: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }, [stream, handleError]);

  const stopCamera = useCallback(() => {
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
    
    setIsActive(false);
  }, [stream]);

  const captureImage = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) {
      handleError('Video or canvas element not available');
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) {
      handleError('Could not get canvas context');
      return null;
    }
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');
    
    return imageData;
  }, [handleError]);

  return {
    videoRef,
    canvasRef,
    isActive,
    error,
    startCamera,
    stopCamera,
    captureImage,
    stream
  };
}

export default useCamera;
