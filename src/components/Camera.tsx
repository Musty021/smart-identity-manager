
import React, { useRef, useState, useEffect } from 'react';
import { Camera, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface CameraComponentProps {
  onCapture: (image: string) => void;
}

const CameraComponent = ({ onCapture }: CameraComponentProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraError("Couldn't access your camera. Please check permissions.");
      toast({
        variant: "destructive",
        title: "Camera Access Error",
        description: "We couldn't access your camera. Please check your browser permissions."
      });
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };
  
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const photoDataUrl = canvas.toDataURL('image/jpeg');
        onCapture(photoDataUrl);
        
        // Add a visual feedback for capture
        toast({
          title: "Photo Captured",
          description: "Your photo has been taken."
        });
      }
    }
  };
  
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center space-y-4 w-full max-w-md mx-auto">
      <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden">
        {!isCameraActive && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center flex-col space-y-4 text-gray-300">
            <Camera size={64} />
            <p>Camera is off</p>
            <Button
              onClick={startCamera}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Start Camera
            </Button>
          </div>
        )}
        
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center flex-col space-y-4 text-gray-300 bg-gray-900 p-4 text-center">
            <ImageOff size={64} className="text-red-500" />
            <p>{cameraError}</p>
            <Button
              onClick={startCamera}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try Again
            </Button>
          </div>
        )}
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
        />
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      {isCameraActive && (
        <div className="flex space-x-4">
          <Button
            onClick={takePhoto}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
          >
            Take Photo
          </Button>
          <Button
            onClick={stopCamera}
            variant="outline"
            className="flex-1"
          >
            Turn Off
          </Button>
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
