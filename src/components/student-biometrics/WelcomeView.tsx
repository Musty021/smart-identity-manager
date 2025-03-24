
import React from 'react';
import { Camera, Fingerprint, UserPlus, Calendar, BadgeCheck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import FeatureCard from '@/components/FeatureCard';

const WelcomeView = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center">
      <div className="text-center max-w-md mb-8">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <UserPlus className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-500 mb-3">Virtual Student's ID Features</h3>
        <p className="text-gray-500 mb-6">
          Explore our identity management tools designed to enhance campus security and streamline administrative processes
        </p>
        
        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8">
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
      
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
        <FeatureCard 
          icon={Calendar}
          title="Smart Attendance"
          description="Automate lecture attendance with biometric verification, preventing proxy attendance and generating detailed reports."
          to="/smart-attendance"
          delay={100}
        />
        
        <FeatureCard 
          icon={BadgeCheck}
          title="ExamPass ID"
          description="Verify student identity for exam hall access with secure biometric authentication to prevent impersonation."
          to="/exam-pass"
          delay={200}
        />
        
        <FeatureCard 
          icon={ShieldCheck}
          title="VerifyMe"
          description="Quickly authenticate student identity for various campus services and access points."
          to="/verify-me"
          delay={300}
        />
        
        <FeatureCard 
          icon={UserPlus}
          title="Add a Student"
          description="Register new students with biometric data capture for facial recognition and fingerprint verification."
          to="/add-student"
          delay={400}
        />
      </div>
    </div>
  );
};

export default WelcomeView;
