
import React from 'react';
import { Camera, Fingerprint, UserPlus, Calendar, BadgeCheck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import FeatureCard from '@/components/FeatureCard';

const WelcomeView = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center">
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
