
import React from 'react';
import FadeIn from '@/components/animations/FadeIn';

const VerificationInfo: React.FC = () => {
  return (
    <div className="mt-10 p-6 rounded-xl bg-fud-navy/5 border border-fud-navy/10">
      <h3 className="text-lg font-semibold text-fud-navy mb-3">About VerifyMe</h3>
      <p className="text-gray-600 mb-4">
        VerifyMe provides quick identity verification for students across various campus facilities using AWS Rekognition for facial recognition. The system ensures that only authorized individuals gain access to university services, enhancing security and preventing fraud.
      </p>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium text-fud-navy mb-2">Campus Gates</h4>
          <p className="text-sm text-gray-600">
            Secure entry points with biometric verification
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium text-fud-navy mb-2">Library Access</h4>
          <p className="text-sm text-gray-600">
            Verify identity for library and resource access
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium text-fud-navy mb-2">Event Entry</h4>
          <p className="text-sm text-gray-600">
            Control access to university events and functions
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium text-fud-navy mb-2">Lab Access</h4>
          <p className="text-sm text-gray-600">
            Restrict lab access to authorized students only
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationInfo;
