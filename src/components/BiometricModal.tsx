
import React, { useState } from 'react';
import { 
  Fingerprint, 
  Scan, 
  Check, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (method: 'face' | 'fingerprint') => void;
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
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const simulateVerification = (method: 'face' | 'fingerprint') => {
    setVerifying(method);
    setStatus('loading');
    
    // Simulate verification process
    setTimeout(() => {
      // For demo purposes, let's assume 80% success rate
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
        setStatus('success');
        setTimeout(() => {
          onSuccess(method);
        }, 1500);
      } else {
        setStatus('error');
        toast.error('Verification failed. Please try again.');
      }
    }, 2500);
  };

  const resetState = () => {
    setVerifying(null);
    setStatus('idle');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={() => {
          if (status !== 'loading') {
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
              onClick={() => simulateVerification('face')}
              className="flex flex-col items-center justify-center p-6 rounded-xl border border-gray-200 hover:border-fud-green hover:bg-fud-green/5 transition-colors"
            >
              <Scan className="h-8 w-8 text-fud-green mb-3" />
              <span className="text-sm font-medium text-gray-800">Face ID</span>
            </button>
            
            <button
              onClick={() => simulateVerification('fingerprint')}
              className="flex flex-col items-center justify-center p-6 rounded-xl border border-gray-200 hover:border-fud-green hover:bg-fud-green/5 transition-colors"
            >
              <Fingerprint className="h-8 w-8 text-fud-green mb-3" />
              <span className="text-sm font-medium text-gray-800">Fingerprint</span>
            </button>
          </div>
        )}

        {status !== 'idle' && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-6">
              {status === 'loading' && (
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
              {status === 'loading' && 'Verifying...'}
              {status === 'success' && 'Verification Successful'}
              {status === 'error' && 'Verification Failed'}
            </h4>
            
            <p className="text-sm text-gray-600 mb-6">
              {status === 'loading' && `Using ${verifying === 'face' ? 'Face ID' : 'Fingerprint'} for verification`}
              {status === 'success' && 'Your identity has been verified'}
              {status === 'error' && 'Please try again or use an alternative method'}
            </p>

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
