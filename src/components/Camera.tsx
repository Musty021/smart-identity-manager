import React, { useRef, useState, useEffect } from 'react';
import { Camera, ImageOff, AlertCircle, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface CameraComponentProps {
  onCapture: (image: string) => void;
  onError?: (error: string) => void;
}

const CameraComponent = ({ onCapture, onError }: CameraComponentProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [captureQuality, setCaptureQuality] = useState<'poor' | 'good' | 'excellent' | null>(null);
  const [cameraDevice, setCameraDevice] = useState<MediaDeviceInfo | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const { toast } = useToast();
  
  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(cameras);
      
      // Try to select front camera if available (for mobile devices)
      const frontCamera = cameras.find(camera => 
        camera.label.toLowerCase().includes('front') || 
        camera.label.toLowerCase().includes('user')
      );
      
      if (frontCamera) {
        setCameraDevice(frontCamera);
      } else if (cameras.length > 0) {
        setCameraDevice(cameras[0]);
      }
      
      return cameras.length > 0;
    } catch (err) {
      console.error('Error getting cameras:', err);
      return false;
    }
  };
  
  const startCamera = async () => {
    setCameraError(null);
    try {
      // Make sure we have cameras available
      if (availableCameras.length === 0) {
        const hasCamera = await getAvailableCameras();
        if (!hasCamera) {
          throw new Error("No cameras detected on your device");
        }
      }
      
      // Set constraints for camera - try to use selected device or fallback
      const constraints: MediaStreamConstraints = {
        video: cameraDevice ? 
          { deviceId: { exact: cameraDevice.deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } } : 
          { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      };
      
      // Stop any existing stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        
        // Start face detection once camera is active
        setTimeout(checkFaceVisibility, 1000);
      }
      
      console.log("Camera started successfully");
    } catch (err) {
      console.error('Error accessing camera:', err);
      const errorMessage = `Couldn't access your camera: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setCameraError(errorMessage);
      
      // Call the onError prop if provided
      if (onError) {
        onError(errorMessage);
      }
      
      toast({
        variant: "destructive",
        title: "Camera Access Error",
        description: "We couldn't access your camera. Please check your browser permissions."
      });
    }
  };
  
  const switchCamera = async () => {
    if (availableCameras.length <= 1) {
      toast({
        title: "No Alternative Cameras",
        description: "No other cameras found on your device"
      });
      return;
    }
    
    // Get current camera index
    const currentIndex = availableCameras.findIndex(
      camera => cameraDevice && camera.deviceId === cameraDevice.deviceId
    );
    
    // Select next camera in the list
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    setCameraDevice(availableCameras[nextIndex]);
    
    // Restart camera with new device
    if (isCameraActive) {
      stopCamera();
      setTimeout(() => {
        startCamera();
      }, 300);
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
  
  // Function to detect face-like patterns in the video
  const detectFacePattern = (canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d');
    if (!context) return false;
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;
    
    // Define the center area where we expect the face to be
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const checkRadius = Math.min(width, height) / 4;
    
    // Analyze the center area for skin-tone-like pixels
    let skinTonePixels = 0;
    let totalPixels = 0;
    
    for (let y = centerY - checkRadius; y < centerY + checkRadius; y += 4) {
      if (y < 0 || y >= height) continue;
      
      for (let x = centerX - checkRadius; x < centerX + checkRadius; x += 4) {
        if (x < 0 || x >= width) continue;
        
        const idx = (y * width + x) * 4;
        
        // Skip if out of bounds
        if (idx >= data.length - 4) continue;
        
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        // Very simple skin tone detection
        // More accurate methods would use machine learning models
        if (r > 60 && g > 40 && b > 30 && // Lower bounds for skin tones
            r > g && r > b && // Red channel should be the highest
            Math.abs(r - g) > 15) { // Some distance between red and green
          skinTonePixels++;
        }
        
        totalPixels++;
      }
    }
    
    // Calculate the percentage of skin tone pixels
    const skinToneRatio = totalPixels > 0 ? skinTonePixels / totalPixels : 0;
    
    // Consider if there's a certain percentage of skin tone pixels as a face
    return skinToneRatio > 0.15; // Threshold can be adjusted
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
    
    // Check for face-like pattern
    const hasFacePattern = detectFacePattern(canvas);
    
    console.log('Face detection check - Brightness:', brightness, 'Face pattern detected:', hasFacePattern);
    
    // Determine if a face is likely present based on both brightness and pattern
    const likelyHasFace = brightness > 50 && hasFacePattern;
    setIsFaceDetected(likelyHasFace);
    
    // Set quality based on brightness
    if (likelyHasFace) {
      if (brightness > 100) {
        setCaptureQuality('excellent');
      } else if (brightness > 70) {
        setCaptureQuality('good');
      } else {
        setCaptureQuality('poor');
      }
    } else {
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
  
  // Initialize camera devices on component mount
  useEffect(() => {
    getAvailableCameras();
    
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
          
          {availableCameras.length > 1 && (
            <Button
              onClick={switchCamera}
              variant="outline"
              className="px-3"
              title="Switch Camera"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          )}
          
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
