
import React, { useState, useCallback } from 'react';
import { 
  Fingerprint, 
  Scan, 
  Check, 
  AlertCircle, 
  Loader2,
  Info
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
  studentId?: string;
}

const BiometricModal: React.FC<BiometricModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Biometric Verification",
  description = "Please verify your identity using one of the following methods:",
  studentId
}) => {
  const [verifying, setVerifying] = useState<'face' | 'fingerprint' | null>(null);
  const [status, setStatus] = useState<'idle' | 'capturing' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [faceImageData, setFaceImageData] = useState<string | null>(null);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  const handleFaceCapture = useCallback(async (imageSrc: string) => {
    setFaceImageData(imageSrc);
    setStatus('processing');
    setErrorMessage(null);
    setErrorDetails(null);
    
    try {
      const result = await biometricService.verifyFace(imageSrc);
      
      if (result.isMatch) {
        setConfidenceScore(result.confidence || null);
        setStatus('success');
        toast.success('Identity verified successfully', {
          description: `Confidence: ${result.confidence?.toFixed(1)}%`
        });
        setTimeout(() => {
          onSuccess('face', result.student?.id);
        }, 1500);
      } else {
        setStatus('error');
        setVerificationAttempts(prev => prev + 1);
        
        if (result.error?.includes('confidence too low') && result.confidence) {
          setConfidenceScore(result.confidence);
          setErrorMessage('Verification failed due to low confidence score.');
          setErrorDetails('Your face was recognized but with low confidence. Please try again with better lighting and a clear view of your face.');
        } else if (result.error?.includes('No matching face')) {
          setErrorMessage('Face not recognized.');
          setErrorDetails('Your face could not be matched with any registered face in our system. Please try again or contact administrator if problem persists.');
        } else {
          setErrorMessage('Face verification failed.');
          setErrorDetails(result.error || 'An unknown error occurred during verification.');
        }
        
        toast.error('Verification failed', {
          description: result.error || 'Face not recognized'
        });
      }
    } catch (error) {
      console.error('Face verification error:', error);
      setStatus('error');
      setVerificationAttempts(prev => prev + 1);
      setErrorMessage('An error occurred during face verification.');
      setErrorDetails(error instanceof Error ? error.message : 'Unknown error');
      toast.error('Verification error', {
        description: 'Please try again or use another method'
      });
    }
  }, [onSuccess]);

  const handleFingerprintVerification = useCallback(async () => {
    setVerifying('fingerprint');
    setStatus('processing');
    setErrorMessage(null);
    setErrorDetails(null);
    
    try {
      const captureResult = await biometricService.fingerprintService.captureFingerprint();
      
      if (!captureResult.success) {
        setStatus('error');
        setVerificationAttempts(prev => prev + 1);
        setErrorMessage('Failed to capture fingerprint.');
        setErrorDetails('Please ensure your finger is properly placed on the scanner and try again.');
        toast.error('Fingerprint capture failed', {
          description: 'Please try again'
        });
        return;
      }
      
      const verifyResult = await biometricService.verifyFingerprint(
        studentId || 'unknown',
        captureResult.data || null
      );
      
      if (verifyResult.isMatch) {
        if (verifyResult.confidence) {
          setConfidenceScore(verifyResult.confidence);
        }
        setStatus('success');
        toast.success('Identity verified successfully');
        setTimeout(() => {
          onSuccess('fingerprint', studentId);
        }, 1500);
      } else {
        setStatus('error');
        setVerificationAttempts(prev => prev + 1);
        setErrorMessage('Fingerprint verification failed.');
        setErrorDetails('Your fingerprint did not match our records. Please try again or use face verification.');
        toast.error('Verification failed', {
          description: 'Fingerprint not recognized'
        });
      }
    } catch (error) {
      console.error('Fingerprint verification error:', error);
      setStatus('error');
      setVerificationAttempts(prev => prev + 1);
      setErrorMessage('An error occurred during fingerprint verification.');
      setErrorDetails(error instanceof Error ? error.message : 'Unknown error');
      toast.error('Verification error', {
        description: 'Please try again or use another method'
      });
    }
  }, [onSuccess, studentId]);

  const resetState = useCallback(() => {
    setVerifying(null);
    setStatus('idle');
    setErrorMessage(null);
    setErrorDetails(null);
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
              <p className="text-sm font-medium text-fud-green mb-2">
                Match confidence: {confidenceScore.toFixed(1)}%
              </p>
            )}

            {status === 'error' && errorDetails && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4 text-sm text-red-700 flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-500" />
                <p>{errorDetails}</p>
              </div>
            )}

            {verificationAttempts >= 3 && status === 'error' && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 mb-4 text-sm text-yellow-800">
                <p className="font-medium">Having trouble?</p>
                <ul className="list-disc pl-5 mt-1 text-xs">
                  <li>Make sure your face is well-lit and clearly visible</li>
                  <li>Remove any facial coverings or accessories</li>
                  <li>Try a different verification method</li>
                  <li>Contact system administrator if problems persist</li>
                </ul>
              </div>
            )}

            {status === 'error' && (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (verifying === 'face') {
                      startFaceVerification();
                    } else {
                      handleFingerprintVerification();
                    }
                  }}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    resetState();
                  }}
                  className="px-4 py-2 bg-fud-green text-white rounded-lg text-sm font-medium transition-colors hover:bg-fud-green-dark"
                >
                  Switch Method
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
