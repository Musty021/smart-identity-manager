
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Check, AlertCircle, CameraOff } from 'lucide-react';
import WebcamCapture from '@/components/WebcamCapture';
import { toast } from 'sonner';

interface FaceCaptureProps {
  onFaceCapture: (imageSrc: string) => void;
  onNext: () => void;
  onCancel: () => void;
  faceImageCaptured: boolean;
  faceImageData: string | null;
}

const FaceCapture: React.FC<FaceCaptureProps> = ({
  onFaceCapture,
  onNext,
  onCancel,
  faceImageCaptured,
  faceImageData
}) => {
  const [showWebcam, setShowWebcam] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Reset camera error when showing webcam
  useEffect(() => {
    if (showWebcam) {
      setCameraError(null);
    }
  }, [showWebcam]);

  const handleCameraError = (error: string) => {
    console.error('Camera error:', error);
    setCameraError(error);
    setShowWebcam(false);
    toast.error('Camera access failed', {
      description: 'Please check your camera permissions and try again'
    });
  };

  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-semibold text-fud-navy mb-4">Step 1: Face ID Capture</h3>
      <p className="text-gray-600 mb-6">
        Capture the student's face for facial recognition verification
      </p>
      
      <div className="flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 mb-6">
        {!faceImageCaptured ? (
          showWebcam ? (
            <WebcamCapture
              onCapture={onFaceCapture}
              onCancel={() => setShowWebcam(false)}
              onError={handleCameraError}
            />
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                <Camera className="h-10 w-10 text-gray-400" />
              </div>
              
              {cameraError ? (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4 max-w-md">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800 mb-1">Camera Error</h4>
                      <p className="text-xs text-red-700">{cameraError}</p>
                      <p className="text-xs text-red-700 mt-2">
                        Please check your camera permissions, try another browser, or use a device with a working camera.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-center mb-6 max-w-md">
                  Position the student's face in a well-lit environment for optimal image quality
                </p>
              )}
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => setShowWebcam(true)}
                  className="bg-fud-green hover:bg-fud-green-dark text-white"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Open Camera
                </Button>
                
                {cameraError && (
                  <Button 
                    variant="outline" 
                    onClick={() => setCameraError(null)}
                    className="border-fud-green text-fud-green hover:bg-fud-green/10"
                  >
                    <CameraOff className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
              </div>
            </>
          )
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 mb-4 mx-auto relative">
              <img 
                src={faceImageData!} 
                alt="Captured face" 
                className="w-full h-full object-cover rounded-full border-4 border-green-200"
                style={{ transform: 'scaleX(-1)' }} // Mirror for consistency
              />
              <div className="absolute bottom-0 right-0 bg-green-100 rounded-full p-1 border-2 border-white">
                <Check className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <h4 className="text-lg font-medium text-green-700 mb-1">Face Image Captured</h4>
            <p className="text-gray-600 mb-4">
              Face image has been successfully captured and processed
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setShowWebcam(true);
                onFaceCapture(null);
              }}
              className="text-fud-green border-fud-green hover:bg-fud-green/10"
            >
              Retake Image
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={onNext}
          className="bg-fud-green hover:bg-fud-green-dark text-white"
          disabled={!faceImageCaptured}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default FaceCapture;
