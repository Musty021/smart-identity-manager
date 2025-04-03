
import React, { useState, useCallback } from 'react';
import { 
  Fingerprint, 
  Scan, 
  Check, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import { biometricService } from '@/services/biometricService';
import CameraUI from './camera/CameraUI';

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (method: 'face' | 'fingerprint', studentId?: string) => void;
  title?: string;
  description?: string;
}

const BiometricModal: React.FC<BiometricModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Biometric Verification",
  description = "Please verify your identity using one of the following methods:"
}) => {
  const [verifying, setVerifying] = useState<'face' | 'fingerprint' | null>(null);
  const [status, setStatus] = useState<'idle' | 'capturing' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [faceImageData, setFaceImageData] = useState<string | null>(null);

  const handleFaceCapture = useCallback(async (imageSrc: string) => {
    setFaceImageData(imageSrc);
    setStatus('processing');
    
    try {
      const result = await biometricService.verifyFace(imageSrc);
      
      if (result.isMatch) {
        setConfidenceScore(result.confidence || null);
        setStatus('success');
        setTimeout(() => {
          onSuccess('face', result.student?.id);
        }, 1500);
      } else {
        setStatus('error');
        setErrorMessage('Face verification failed. Your face does not match any registered faces in our system.');
        toast.error('Verification failed. Face not recognized.');
      }
    } catch (error) {
      console.error('Face verification error:', error);
      setStatus('error');
      setErrorMessage('An error occurred during face verification. Please try again.');
      toast.error('Verification error. Please try again.');
    }
  }, [onSuccess]);

  const handleFingerprintVerification = useCallback(async () => {
    setVerifying('fingerprint');
    setStatus('processing');
    
    // In a real implementation, you would:
    // 1. Capture a fingerprint using a fingerprint scanner
    // 2. Convert the capture to a template
    // 3. Send the template to the server for verification
    
    // For demo purposes, we'll simulate this process
    try {
      // Simulate fingerprint capturing and processing
      setTimeout(async () => {
        const isSuccess = Math.random() > 0.2; // 80% success rate for demo
        
        if (isSuccess) {
          setStatus('success');
          setTimeout(() => {
            onSuccess('fingerprint');
          }, 1500);
        } else {
          setStatus('error');
          setErrorMessage('Fingerprint verification failed. Please try again or use an alternative method.');
          toast.error('Verification failed. Fingerprint not recognized.');
        }
      }, 2500);
    } catch (error) {
      console.error('Fingerprint verification error:', error);
      setStatus('error');
      setErrorMessage('An error occurred during fingerprint verification. Please try again.');
      toast.error('Verification error. Please try again.');
    }
  }, [onSuccess]);

  const resetState = useCallback(() => {
    setVerifying(null);
    setStatus('idle');
    setErrorMessage(null);
    setConfidenceScore(null);
    setFaceImageData(null);
  }, []);

  const startFaceVerification = useCallback(() => {
    setVerifying('face');
    setStatus('capturing');
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={() => {
          if (status !== 'processing') {
            resetState();
            onClose();
          }
        }}
      />
      
      <div className="animate-scale-in relative bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-fud-navy mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>

        {status === 'idle' && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={startFaceVerification}
              className="flex flex-col items-center justify-center p-6 rounded-xl border border-gray-200 hover:border-fud-green hover:bg-fud-green/5 transition-colors"
            >
              <Scan className="h-8 w-8 text-fud-green mb-3" />
              <span className="text-sm font-medium text-gray-800">Face ID</span>
            </button>
            
            <button
              onClick={handleFingerprintVerification}
              className="flex flex-col items-center justify-center p-6 rounded-xl border border-gray-200 hover:border-fud-green hover:bg-fud-green/5 transition-colors"
            >
              <Fingerprint className="h-8 w-8 text-fud-green mb-3" />
              <span className="text-sm font-medium text-gray-800">Fingerprint</span>
            </button>
          </div>
        )}

        {status === 'capturing' && verifying === 'face' && (
          <div className="flex flex-col items-center">
            <h4 className="text-lg font-medium mb-4">Face Verification</h4>
            <CameraUI
              onCapture={handleFaceCapture}
              onCancel={() => resetState()}
            />
            <p className="text-sm text-gray-600 mt-4">
              Position your face within the frame and ensure good lighting
            </p>
          </div>
        )}

        {(status === 'processing' || status === 'success' || status === 'error') && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-6">
              {status === 'processing' && (
                <div className="relative">
                  {verifying === 'face' ? (
                    <Scan className="h-16 w-16 text-fud-green" />
                  ) : (
                    <Fingerprint className="h-16 w-16 text-fud-green" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                </div>
              )}
              
              {status === 'success' && (
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              )}
              
              {status === 'error' && (
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              )}
            </div>
            
            <h4 className="text-lg font-medium mb-1">
              {status === 'processing' && 'Verifying...'}
              {status === 'success' && 'Verification Successful'}
              {status === 'error' && 'Verification Failed'}
            </h4>
            
            <p className="text-sm text-gray-600 mb-2">
              {status === 'processing' && `Using ${verifying === 'face' ? 'Face ID' : 'Fingerprint'} for verification`}
              {status === 'success' && 'Your identity has been verified'}
              {status === 'error' && errorMessage}
            </p>

            {confidenceScore !== null && (
              <p className="text-sm font-medium text-fud-green mb-6">
                Match confidence: {confidenceScore.toFixed(1)}%
              </p>
            )}

            {status === 'error' && (
              <div className="flex gap-3">
                <button
                  onClick={resetState}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    resetState();
                    onClose();
                  }}
                  className="px-4 py-2 bg-fud-green text-white rounded-lg text-sm font-medium transition-colors hover:bg-fud-green-dark"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BiometricModal;
