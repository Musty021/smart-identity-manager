
import React from 'react';
import { Camera, Fingerprint, ShieldCheck } from 'lucide-react';

const AboutRegistration = () => {
  return (
    <div className="mt-10 p-6 rounded-xl bg-fud-navy/5 border border-fud-navy/10">
      <h3 className="text-lg font-semibold text-fud-navy mb-3">About Registration Process</h3>
      <p className="text-gray-600 mb-4">
        The biometric registration process adds student face and fingerprint data to our secure database for identity verification across campus services.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-fud-green/10 flex items-center justify-center">
              <Camera className="h-4 w-4 text-fud-green" />
            </div>
            <h4 className="font-medium text-fud-navy">Face ID Process</h4>
          </div>
          <p className="text-sm text-gray-600">
            Captures and processes facial features using AWS Rekognition for secure identity recognition with advanced facial recognition algorithms.
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-fud-green/10 flex items-center justify-center">
              <Fingerprint className="h-4 w-4 text-fud-green" />
            </div>
            <h4 className="font-medium text-fud-navy">Fingerprint Process</h4>
          </div>
          <p className="text-sm text-gray-600">
            Captures unique fingerprint patterns and stores them securely for reliable biometric verification.
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-fud-green/10 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-fud-green" />
            </div>
            <h4 className="font-medium text-fud-navy">Data Security</h4>
          </div>
          <p className="text-sm text-gray-600">
            All biometric data is encrypted and stored securely in compliance with data protection regulations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutRegistration;
