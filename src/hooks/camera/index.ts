
import { useState, useCallback } from 'react';
import { useCameraDevices } from './useCameraDevices';
import { useCameraStream } from './useCameraStream';
import { useCameraCapture } from './useCameraCapture';

interface UseCameraOptions {
  onError?: (error: string) => void;
}

export function useCamera({ onError }: UseCameraOptions = {}) {
  const [error, setError] = useState<string | null>(null);

  // Handle errors
  const handleError = useCallback((message: string) => {
    console.error(`Camera error: ${message}`);
    setError(message);
    if (onError) onError(message);
  }, [onError]);

  // Initialize hooks with error handling
  const {
    devices,
    activeDeviceId,
    setActiveDeviceId,
    hasMultipleCameras
  } = useCameraDevices({ 
    onError: handleError 
  });

  const {
    videoRef,
    isReady,
    startCamera,
    stopCamera,
    stream
  } = useCameraStream({ 
    onError: handleError 
  });

  const { canvasRef, captureImage: capture } = useCameraCapture({ 
    onError: handleError 
  });

  // Switch to another camera
  const switchCamera = useCallback(() => {
    if (!devices || devices.length <= 1) {
      console.log('Only one camera available, cannot switch');
      return;
    }
    
    const currentIndex = devices.findIndex(device => device.deviceId === activeDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDeviceId = devices[nextIndex].deviceId;
    
    console.log(`Switching camera from device ${currentIndex} to device ${nextIndex}`);
    setActiveDeviceId(nextDeviceId);
    startCamera(nextDeviceId);
  }, [activeDeviceId, devices, setActiveDeviceId, startCamera]);

  // Capture image wrapper
  const captureImage = useCallback((): string | null => {
    return capture(videoRef.current);
  }, [capture, videoRef]);

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
    stopCamera,
    hasMultipleCameras,
    stream
  };
}

export default useCamera;
