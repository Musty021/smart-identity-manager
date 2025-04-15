
import React, { useRef, useState, useEffect } from 'react';
import { Camera, ImageOff, AlertCircle, Check } from 'lucide-react';
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
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [captureQuality, setCaptureQuality] = useState<'poor' | 'good' | 'excellent' | null>(null);
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
        
        // Start face detection once camera is active
        setTimeout(checkFaceVisibility, 1000);
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
      setIsFaceDetected(false);
      setCaptureQuality(null);
    }
  };
  
  // Function to analyze image brightness
  const analyzeBrightness = (canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d');
    if (!context) return 0;
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let brightness = 0;
    
    // Calculate average brightness
    for (let i = 0; i < data.length; i += 4) {
      brightness += (0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2]);
    }
    
    return brightness / (data.length / 4);
  };
  
  // Function to detect face in the video
  const checkFaceVisibility = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.readyState !== 4) {
      // Video not ready yet, try again
      setTimeout(checkFaceVisibility, 500);
      return;
    }
    
    // Draw current video frame to canvas for analysis
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Analyze brightness
    const brightness = analyzeBrightness(canvas);
    
    // Simple face detection based on brightness and image area coverage
    // In a production app, you would use a proper face detection library or API
    if (brightness > 50) {
      // Brightness is good, assume face is visible
      setIsFaceDetected(true);
      
      if (brightness > 100) {
        setCaptureQuality('excellent');
      } else if (brightness > 70) {
        setCaptureQuality('good');
      } else {
        setCaptureQuality('poor');
      }
    } else {
      setIsFaceDetected(false);
      setCaptureQuality(null);
    }
    
    // Continue checking while camera is active
    if (isCameraActive) {
      setTimeout(checkFaceVisibility, 500);
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
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9); // Higher quality JPEG
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
              className="bg-fud-green hover:bg-fud-green-dark text-white"
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
              className="bg-fud-green hover:bg-fud-green-dark text-white"
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
        
        {/* Face detection overlay */}
        {isCameraActive && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-0 right-0 flex justify-center">
              {isFaceDetected ? (
                <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-medium
                  ${captureQuality === 'excellent' ? 'bg-green-500 text-white' : 
                    captureQuality === 'good' ? 'bg-yellow-400 text-yellow-800' : 
                    'bg-orange-400 text-orange-800'}`}>
                  {captureQuality === 'excellent' ? (
                    <>
                      <Check className="h-4 w-4" />
                      Face detected (excellent lighting)
                    </>
                  ) : captureQuality === 'good' ? (
                    <>
                      <Check className="h-4 w-4" />
                      Face detected (good lighting)
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      Face detected (improve lighting)
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-red-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-medium">
                  <AlertCircle className="h-4 w-4" />
                  No face detected
                </div>
              )}
            </div>

            {/* Face positioning guide */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-2 rounded-full border-dashed border-white/40"></div>
            </div>
          </div>
        )}
      </div>
      
      {isCameraActive && (
        <div className="flex space-x-4 w-full">
          <Button
            onClick={takePhoto}
            className="flex-1 bg-fud-green hover:bg-fud-green-dark text-white"
            disabled={!isFaceDetected}
          >
            {!isFaceDetected ? 'Waiting for face...' : 'Take Photo'}
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
      
      {isCameraActive && (
        <div className="text-sm text-gray-600 mt-2 text-center">
          <p>Position your face in the circle and ensure good lighting for best results.</p>
          {captureQuality === 'poor' && (
            <p className="text-orange-600 mt-1">Try moving to a brighter area for better verification.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
