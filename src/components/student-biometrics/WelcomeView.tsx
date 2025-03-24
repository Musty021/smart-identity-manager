
import React from 'react';
import { Camera, Fingerprint, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const WelcomeView = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center min-h-[300px]">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <UserPlus className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-500 mb-3">Add Student Biometric Data</h3>
        <p className="text-gray-500 mb-6">
          Search for a student using their registration number to add biometric data for facial and fingerprint verification
        </p>
        
        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
          <div className="bg-fud-green/10 rounded-lg p-3 text-center">
            <Fingerprint className="h-6 w-6 text-fud-green mx-auto mb-2" />
            <p className="text-sm font-medium text-fud-navy">Fingerprint</p>
          </div>
          <div className="bg-fud-green/10 rounded-lg p-3 text-center">
            <Camera className="h-6 w-6 text-fud-green mx-auto mb-2" />
            <p className="text-sm font-medium text-fud-navy">Face ID</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeView;
