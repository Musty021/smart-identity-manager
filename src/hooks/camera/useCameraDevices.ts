
import { useState, useCallback, useEffect } from 'react';

interface UseCameraDevicesOptions {
  onError?: (error: string) => void;
}

export function useCameraDevices({ onError }: UseCameraDevicesOptions = {}) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string>('');

  // Handle errors
  const handleError = useCallback((message: string) => {
    console.error(`Camera device error: ${message}`);
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

  // Set up device change listener
  useEffect(() => {
    if (!navigator.mediaDevices) {
      handleError('Media devices API not available in this browser');
      return;
    }
    
    const handleDeviceChange = async () => {
      console.log('Media devices changed');
      await getVideoDevices();
    };
    
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    // Initial device enumeration
    getVideoDevices();
    
    return () => {
      if (navigator.mediaDevices) {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      }
    };
  }, [getVideoDevices, handleError]);

  return {
    devices,
    activeDeviceId,
    setActiveDeviceId,
    getVideoDevices,
    hasMultipleCameras: devices && devices.length > 1
  };
}
