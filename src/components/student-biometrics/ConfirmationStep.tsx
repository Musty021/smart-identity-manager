
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Check, Fingerprint, Save } from 'lucide-react';

interface ConfirmationStepProps {
  onSubmit: () => void;
  onBack: () => void;
  isProcessing: boolean;
  studentData: {
    name: string;
    regNumber: string;
    department: string;
    level: string;
  };
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  onSubmit,
  onBack,
  isProcessing,
  studentData
}) => {
  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-semibold text-fud-navy mb-4">Step 3: Confirmation</h3>
      <p className="text-gray-600 mb-6">
        Review and confirm the biometric data for the student
      </p>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-fud-green/10 flex items-center justify-center mb-3 mx-auto">
            <Camera className="h-6 w-6 text-fud-green" />
          </div>
          <h4 className="font-medium text-fud-navy mb-1">Face ID</h4>
          <p className="text-sm text-gray-600">
            Face image captured and processed for verification
          </p>
          <div className="mt-3 flex justify-center">
            <span className="inline-flex items-center bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
              <Check className="h-3 w-3 mr-1" />
              Captured
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-fud-green/10 flex items-center justify-center mb-3 mx-auto">
            <Fingerprint className="h-6 w-6 text-fud-green" />
          </div>
          <h4 className="font-medium text-fud-navy mb-1">Fingerprint</h4>
          <p className="text-sm text-gray-600">
            Fingerprint captured and processed for verification
          </p>
          <div className="mt-3 flex justify-center">
            <span className="inline-flex items-center bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
              <Check className="h-3 w-3 mr-1" />
              Captured
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-fud-navy/5 rounded-xl p-6 mb-6">
        <h4 className="font-medium text-fud-navy mb-3">Student Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium text-fud-navy">{studentData.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Registration Number</p>
            <p className="font-medium text-fud-navy">{studentData.regNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="font-medium text-fud-navy">{studentData.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Level</p>
            <p className="font-medium text-fud-navy">{studentData.level}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          onClick={onSubmit}
          className="bg-fud-green hover:bg-fud-green-dark text-white flex items-center gap-2"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Processing...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Complete Registration
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationStep;
