
import React from 'react';

interface RegistrationStepsProps {
  currentStep: number;
}

const RegistrationSteps: React.FC<RegistrationStepsProps> = ({ currentStep }) => {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-fud-navy mb-3">Registration Process</h3>
      <div className="space-y-3">
        <div className={`flex items-center gap-2 p-2 rounded-lg border ${currentStep === 1 ? 'border-fud-green bg-fud-green/5' : 'border-gray-100 bg-gray-50'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep === 1 ? 'bg-fud-green text-white' : 'bg-gray-200 text-gray-600'}`}>
            1
          </div>
          <span className={`text-sm ${currentStep === 1 ? 'text-fud-navy font-medium' : 'text-gray-600'}`}>Face ID Capture</span>
        </div>
        <div className={`flex items-center gap-2 p-2 rounded-lg border ${currentStep === 2 ? 'border-fud-green bg-fud-green/5' : 'border-gray-100 bg-gray-50'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep === 2 ? 'bg-fud-green text-white' : 'bg-gray-200 text-gray-600'}`}>
            2
          </div>
          <span className={`text-sm ${currentStep === 2 ? 'text-fud-navy font-medium' : 'text-gray-600'}`}>Fingerprint Capture</span>
        </div>
        <div className={`flex items-center gap-2 p-2 rounded-lg border ${currentStep === 3 ? 'border-fud-green bg-fud-green/5' : 'border-gray-100 bg-gray-50'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep === 3 ? 'bg-fud-green text-white' : 'bg-gray-200 text-gray-600'}`}>
            3
          </div>
          <span className={`text-sm ${currentStep === 3 ? 'text-fud-navy font-medium' : 'text-gray-600'}`}>Confirmation</span>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSteps;
