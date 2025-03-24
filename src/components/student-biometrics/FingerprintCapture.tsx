
import React from 'react';
import { Button } from '@/components/ui/button';
import { Fingerprint } from 'lucide-react';

interface FingerprintCaptureProps {
  onFingerprintCapture: () => void;
  onNext: () => void;
  onBack: () => void;
  fingerprintCaptured: boolean;
  isProcessing: boolean;
}

const FingerprintCapture: React.FC<FingerprintCaptureProps> = ({
  onFingerprintCapture,
  onNext,
  onBack,
  fingerprintCaptured,
  isProcessing
}) => {
  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-semibold text-fud-navy mb-4">Step 2: Fingerprint Capture</h3>
      <p className="text-gray-600 mb-6">
        Capture the student's fingerprint for biometric verification
      </p>
      
      <div className="flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 mb-6">
        {!fingerprintCaptured ? (
          <>
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <Fingerprint className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              Ensure the student's finger is clean and dry for optimal fingerprint quality
            </p>
            <Button 
              onClick={onFingerprintCapture}
              className="bg-fud-green hover:bg-fud-green-dark text-white"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Fingerprint className="h-4 w-4 mr-2" />
                  Capture Fingerprint
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-green-100 border-4 border-green-200 flex items-center justify-center mb-4 mx-auto">
              <Fingerprint className="h-12 w-12 text-green-600" />
            </div>
            <h4 className="text-lg font-medium text-green-700 mb-1">Fingerprint Captured</h4>
            <p className="text-gray-600 mb-4">
              Fingerprint has been successfully captured and processed
            </p>
            <Button
              variant="outline"
              onClick={() => onFingerprintCapture()}
              className="text-fud-green border-fud-green hover:bg-fud-green/10"
            >
              Retake Fingerprint
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-fud-green hover:bg-fud-green-dark text-white"
          disabled={!fingerprintCaptured}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default FingerprintCapture;
