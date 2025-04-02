
import { useRef, useCallback } from 'react';

interface UseCameraCaptureOptions {
  onError?: (error: string) => void;
}

export function useCameraCapture({ onError }: UseCameraCaptureOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle errors
  const handleError = useCallback((message: string) => {
    console.error(`Camera capture error: ${message}`);
    if (onError) onError(message);
  }, [onError]);

  // Capture image from video feed
  const captureImage = useCallback((videoElement: HTMLVideoElement | null): string | null => {
    try {
      if (!videoElement || !canvasRef.current) {
        handleError('Video or canvas element not available');
        return null;
      }
      
      const video = videoElement;
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

  return {
    canvasRef,
    captureImage
  };
}
